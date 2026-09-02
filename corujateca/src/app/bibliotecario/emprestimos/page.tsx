import { db } from "@/app/db";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

import DashboardCard from "./components/DashboardCard";
import SearchFilters from "./components/SearchFilters";
import CreateEmprestimoForm from "./components/CreateEmprestimoForm";
import LoansSection, { type LoanView } from "./components/LoansSection";

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
              <CreateEmprestimoForm
                frequentadores={frequentadores}
                exemplaresDisponiveis={exemplaresDisponiveis}
              />

              <h2 className="mb-5 text-xl font-bold text-[var(--color-text-primary)] sm:text-2xl">
                Pesquisar por Empréstimos
              </h2>

              <SearchFilters />

              <LoansSection loans={loans} />
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
