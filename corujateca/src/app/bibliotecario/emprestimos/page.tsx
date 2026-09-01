import { revalidatePath } from "next/cache";

import { db } from "@/app/db";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

import DashboardCard from "./components/DashboardCard";
import SearchFilters from "./components/SearchFilters";
import LoanCard from "./components/LoanCard";

async function concluirEmprestimo(formData: FormData) {
  "use server";

  const idEmprestimo = Number(formData.get("id_emprestimo"));

  if (!idEmprestimo) {
    return;
  }

  const emprestimo = await db.emprestimo.findUnique({
    where: { id_emprestimo: idEmprestimo },
    include: { exemplar: true },
  });

  if (!emprestimo) {
    return;
  }

  await db.emprestimo.update({
    where: { id_emprestimo: idEmprestimo },
    data: {
      dta_devolucao_real: new Date(),
      inativo_emprestimo: true,
    },
  });

  await db.exemplar.update({
    where: { id_exemplar: emprestimo.fk_exemplar_id_exemplar },
    data: {
      status_exemplar: "Dispon_vel",
    },
  });

  revalidatePath("/bibliotecario/emprestimos");
}

async function criarEmprestimo(formData: FormData) {
  "use server";

  const fkFrequentador = Number(formData.get("fk_frequentador_id_freq"));
  const fkExemplar = Number(formData.get("fk_exemplar_id_exemplar"));
  const prazoDias = Number(formData.get("prazo_dias")) || 7;

  if (!fkFrequentador || !fkExemplar) {
    return;
  }

  const frequentador = await db.frequentador.findUnique({
    where: { id_freq: fkFrequentador },
  });

  if (!frequentador) {
    return;
  }

  const exemplar = await db.exemplar.findUnique({
    where: { id_exemplar: fkExemplar },
    include: { livro: true },
  });

  if (!exemplar || exemplar.inativo_exemplar || exemplar.status_exemplar !== "Dispon_vel") {
    return;
  }

  const bibliotecario = await db.bibliotecario.findFirst({
    where: { inativo_bibliotecario: false },
  });

  if (!bibliotecario) {
    return;
  }

  const dataEmprestimo = new Date();
  const dataDevolucao = new Date(dataEmprestimo);
  dataDevolucao.setDate(dataEmprestimo.getDate() + prazoDias);

  await db.emprestimo.create({
    data: {
      dta_emprestimo: dataEmprestimo,
      dta_devolucao: dataDevolucao,
      fk_bibliotecario_id_bibliotecario: bibliotecario.id_bibliotecario,
      fk_exemplar_id_exemplar: fkExemplar,
      fk_frequentador_id_freq: fkFrequentador,
    },
  });

  await db.exemplar.update({
    where: { id_exemplar: fkExemplar },
    data: {
      status_exemplar: "Em_posse",
    },
  });

  revalidatePath("/bibliotecario/emprestimos");
}

function formatarData(data: Date | string | null) {
  if (!data) {
    return "-";
  }

  const valor = new Date(data);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(valor);
}

export default async function EmprestimosPage() {
  const [emprestimos, exemplaresDisponiveis, frequentadores] = await Promise.all([
    db.emprestimo.findMany({
      where: { inativo_emprestimo: false },
      include: {
        exemplar: {
          include: {
            livro: true,
          },
        },
        frequentador: true,
      },
      orderBy: { dta_emprestimo: "desc" },
    }),
    db.exemplar.findMany({
      where: {
        inativo_exemplar: false,
        status_exemplar: "Dispon_vel",
      },
      include: {
        livro: true,
      },
      take: 50,
    }),
    db.frequentador.findMany({
      where: { inativo_freq: false },
      orderBy: { nome_freq: "asc" },
      take: 50,
    }),
  ]);

  const hoje = new Date();

  type LoanView = {
    id: number;
    title: string;
    author: string;
    userName: string;
    status: string;
    expiration: string;
    loanDate: string;
  };

  const loans: LoanView[] = emprestimos.map((emprestimo) => {
    const status = emprestimo.dta_devolucao_real
      ? "Devolvido"
      : new Date(emprestimo.dta_devolucao) < hoje
        ? "Expirado"
        : "Em andamento";

    return {
      id: emprestimo.id_emprestimo,
      title: emprestimo.exemplar.livro.titulo_livro,
      author: emprestimo.exemplar.livro.autor_livro,
      userName: emprestimo.frequentador.nome_freq,
      status,
      expiration: formatarData(emprestimo.dta_devolucao),
      loanDate: formatarData(emprestimo.dta_emprestimo),
    };
  });

  const quantidadeEmprestados = loans.length;
  const quantidadeExpirandoHoje = loans.filter((loan) => {
    if (loan.status === "Devolvido") {
      return false;
    }

    const expiracao = new Date(
      loan.expiration.split("/").reverse().join("-") + "T00:00:00",
    );

    return expiracao.toDateString() === hoje.toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <Header />

      <div className="flex flex-1 min-w-0">
        <Nav />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              <DashboardCard
                title="Quantidade de Livros Emprestados:"
                value={quantidadeEmprestados}
              />

              <DashboardCard
                title="Quantidade de Livros que Expiram Hoje:"
                value={quantidadeExpirandoHoje}
              />
            </section>

            <section className="rounded-3xl bg-brand-200 p-4 shadow-sm md:p-6">
              <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-bold text-[var(--color-text-primary)]">
                  Criar Empréstimo
                </h3>

                <form action={criarEmprestimo} className="grid gap-3 md:grid-cols-4">
                  <select
                    name="fk_frequentador_id_freq"
                    defaultValue=""
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-brand-600 outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  >
                    <option value="" disabled>
                      Selecione o frequentador
                    </option>
                    {frequentadores.map((frequentador) => (
                      <option key={frequentador.id_freq} value={frequentador.id_freq}>
                        {frequentador.nome_freq}
                      </option>
                    ))}
                  </select>

                  <select
                    name="fk_exemplar_id_exemplar"
                    defaultValue=""
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-brand-600 outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  >
                    <option value="" disabled>
                      Selecione o exemplar
                    </option>
                    {exemplaresDisponiveis.map((exemplar) => (
                      <option key={exemplar.id_exemplar} value={exemplar.id_exemplar}>
                        {exemplar.livro.titulo_livro}
                      </option>
                    ))}
                  </select>

                  <select
                    name="prazo_dias"
                    defaultValue=""
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-brand-600 outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  >
                    <option value="" disabled>
                      Prazo do empréstimo
                    </option>
                    <option value="7">7 dias</option>
                    <option value="15">15 dias</option>
                    <option value="30">30 dias</option>
                  </select>

                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--color-button-primary)] px-4 py-2 font-bold text-text-inverse transition hover:brightness-110"
                  >
                    Criar Empréstimo
                  </button>
                </form>
              </div>

              <h2 className="mb-5 text-xl font-bold text-[var(--color-text-primary)] sm:text-2xl">
                Pesquisar por Empréstimos
              </h2>

              <SearchFilters />

              <div className="mt-8 space-y-5">
                {loans.map((loan: LoanView) => (
                  <LoanCard key={loan.id} loan={loan} onConcluir={concluirEmprestimo} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}