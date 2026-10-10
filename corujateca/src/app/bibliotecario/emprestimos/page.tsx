import { db } from "@/app/db";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

import DashboardCard from "./components/DashboardCard";
import SearchFilters from "./components/SearchFilters";
import LoansSection, { type LoanView } from "./components/LoansSection";
import { Prisma } from "@prisma/client";

function formatarData(data: Date | string | null) {
  if (!data) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(data));
}

interface PageProps {
  searchParams: Promise<{
    nome?: string;
    status?: string;
    data?: string;
    dataFiltro?: string;
    page?: string;
  }>;
}

export default async function EmprestimosPage({ searchParams }: PageProps) {
  const { nome, status, data: nomeLivro, dataFiltro } = await searchParams;

  const hoje = new Date();

  const whereClause: Prisma.emprestimoWhereInput = {
    inativo_emprestimo: false,
  };

  // Filtro pelo nome do frequentador.
  if (nome) {
    whereClause.frequentador = {
      nome_freq: {
        contains: nome,
        mode: "insensitive",
      },
    };
  }

  // Filtro por status.
  if (status) {
    if (status === "Em andamento") {
      whereClause.dta_devolucao_real = null;
      whereClause.dta_devolucao = { gte: hoje };
    } else if (status === "Atrasado") {
      whereClause.dta_devolucao_real = null;
      whereClause.dta_devolucao = { lt: hoje };
    } else if (
      status === "Devolvido no prazo" ||
      status === "Devolvido com atraso"
    ) {
      whereClause.dta_devolucao_real = { not: null };
    }
  }

  // Filtro por uma única data:
  // encontra empréstimos cuja data de início OU de devolução
if (dataFiltro) {
  const [ano, mes, dia] = dataFiltro.split("-").map(Number);

  const inicioDia = new Date(Date.UTC(ano, mes - 1, dia));
  const inicioProximoDia = new Date(Date.UTC(ano, mes - 1, dia + 1));

  whereClause.OR = [
    {
      dta_emprestimo: {
        gte: inicioDia,
        lt: inicioProximoDia,
      },
    },
    {
      dta_devolucao: {
        gte: inicioDia,
        lt: inicioProximoDia,
      },
    },
    {
      dta_devolucao_real: {
        gte: inicioDia,
        lt: inicioProximoDia,
      },
    },
  ];
}

  // Filtro pelo título do livro.
  if (nomeLivro) {
    whereClause.exemplar = {
      livro: {
        titulo_livro: {
          contains: nomeLivro,
          mode: "insensitive",
        },
      },
    };
  }

  // Busca empréstimos filtrados e dados para os cards de resumo.
  const [emprestimosFiltrados, todosEmprestimosAtivos] = await Promise.all([
    db.emprestimo.findMany({
      where: whereClause,
      include: {
        exemplar: {
          include: {
            livro: true,
          },
        },
        frequentador: true,
      },
      orderBy: {
        dta_emprestimo: "desc",
      },
    }),

    db.emprestimo.findMany({
      where: {
        inativo_emprestimo: false,
      },
      select: {
        dta_devolucao_real: true,
        dta_devolucao: true,
      },
    }),
  ]);

  let emprestimosProcessados = emprestimosFiltrados;

  // Diferencia devoluções realizadas no prazo das devoluções atrasadas.
  if (status === "Devolvido no prazo") {
    emprestimosProcessados = emprestimosFiltrados.filter((emp) => {
      if (!emp.dta_devolucao_real) {
        return false;
      }

      return new Date(emp.dta_devolucao_real) <= new Date(emp.dta_devolucao);
    });
  } else if (status === "Devolvido com atraso") {
    emprestimosProcessados = emprestimosFiltrados.filter((emp) => {
      if (!emp.dta_devolucao_real) {
        return false;
      }

      return new Date(emp.dta_devolucao_real) > new Date(emp.dta_devolucao);
    });
  }

  const loans: LoanView[] = emprestimosProcessados.map((emprestimo) => {
    let statusCalculado = "Em andamento";
    let daysOverdue = 0;

    if (emprestimo.dta_devolucao_real) {
      const real = new Date(emprestimo.dta_devolucao_real);
      const prevista = new Date(emprestimo.dta_devolucao);

      statusCalculado =
        real <= prevista ? "Devolvido no prazo" : "Devolvido com atraso";
    } else if (new Date(emprestimo.dta_devolucao) < hoje) {
      statusCalculado = "Atrasado";

      const dataPrevista = new Date(emprestimo.dta_devolucao);

      const vencimento = Date.UTC(
        dataPrevista.getUTCFullYear(),
        dataPrevista.getUTCMonth(),
        dataPrevista.getUTCDate(),
      );

      const hojeSemHorario = Date.UTC(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
      );

      daysOverdue = Math.max(
        1,
        Math.floor((hojeSemHorario - vencimento) / (1000 * 60 * 60 * 24)),
      );
    }

    return {
      id: emprestimo.id_emprestimo,
      title: emprestimo.exemplar.livro.titulo_livro,
      author: emprestimo.exemplar.livro.autor_livro,
      userName: emprestimo.frequentador.nome_freq,
      status: statusCalculado,
      daysOverdue,
      expiration: formatarData(emprestimo.dta_devolucao),
      loanDate: formatarData(emprestimo.dta_emprestimo),
    };
  });

  // Quantidade de empréstimos ainda não devolvidos.
  const quantidadeEmAndamento = todosEmprestimosAtivos.filter(
    (emp) => !emp.dta_devolucao_real,
  ).length;

  // Quantidade de empréstimos com devolução prevista para hoje.
  const quantidadeExpirandoHoje = todosEmprestimosAtivos.filter((emp) => {
    if (emp.dta_devolucao_real) {
      return false;
    }

    const dataExpiracao = new Date(emp.dta_devolucao);

    return dataExpiracao.toDateString() === hoje.toDateString();
  }).length;

  return (
    <div
      className="min-h-screen bg-[var(--color-background)] flex flex-col"
      suppressHydrationWarning
    >
      <Header />

      <div className="flex flex-1 min-w-0">
        <Nav />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              <DashboardCard
                title="Empréstimos em Andamento:"
                value={quantidadeEmAndamento}
              />

              <DashboardCard
                title="Quantidade de Livros que Expiram Hoje:"
                value={quantidadeExpirandoHoje}
              />
            </section>

            <section className="rounded-3xl bg-brand-200 p-4 shadow-sm md:p-6">
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
