import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

import DashboardCard from "./components/DashboardCard";
import SearchFilters from "./components/SearchFilters";
import LoanCard from "./components/LoanCard";

const loans = [
  {
    id: 1,
    title: "Nome do livro",
    author: "Nome do autor",
    status: "Em andamento",
    expiration: "20/08/2026",
    loanDate: "10/08/2026",
  },
  {
    id: 2,
    title: "Nome do livro",
    author: "Nome do autor",
    status: "Em andamento",
    expiration: "20/08/2026",
    loanDate: "10/08/2026",
  },
  {
    id: 3,
    title: "Nome do livro",
    author: "Nome do autor",
    status: "Em andamento",
    expiration: "20/08/2026",
    loanDate: "10/08/2026",
  },
];

export default function EmprestimosPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col">
      <Header />

      <div className="flex flex-1 min-w-0">
        <Nav />

        <main className="flex-1 min-w-0 p-4 md:p-10">
          <div className="mx-auto w-full max-w-6xl space-y-8">

            {/* Cards superiores */}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <DashboardCard
                title="Empréstimos em Andamento"
                value={2}
              />

              <DashboardCard
                title="Quantidade de Livros que Expiram Hoje"
                value={2}
              />
            </section>

            {/* Pesquisa */}
            <section className="rounded-3xl bg-brand-200 p-4 shadow-sm md:p-6">
              <h2 className="mb-5 text-2xl font-bold text-[var(--color-text-primary)]">
                Pesquisar por Empréstimos
              </h2>

              <SearchFilters />

              <div className="mt-8 space-y-5">
                {loans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} />
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