"use client";

import { useEffect, useState } from "react";

import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

import DashboardCard from "./components/DashboardCard";
import SearchFilters from "./components/SearchFilters";
import LoanCard from "./components/LoanCard";

type Loan = {
  id: number;
  title: string;
  author: string;
  status: string;
  expiration: string;
  loanDate: string;
};

export default function EmprestimosPage() {
  const [loans, setLoans] = useState<Loan[]>([]);

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState("");

  // Filtros
  const [statusFiltro, setStatusFiltro] = useState("");

  const [dataFiltro, setDataFiltro] = useState("");

  useEffect(() => {
    async function buscarEmprestimos() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await fetch("/api/emprestimos");

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados.error || "Não foi possível buscar os empréstimos.",
          );
        }

        setLoans(dados.emprestimos);
      } catch (erro) {
        console.error("Erro ao buscar empréstimos:", erro);

        setErro(
          erro instanceof Error
            ? erro.message
            : "Não foi possível buscar os empréstimos.",
        );
      } finally {
        setCarregando(false);
      }
    }

    buscarEmprestimos();
  }, []);

  const loansFiltrados = loans.filter((loan) => {
    let correspondeAoStatus = true;

    if (statusFiltro === "em_andamento") {
      correspondeAoStatus = loan.status === "Em andamento";
    }

    if (statusFiltro === "devolvido") {
      correspondeAoStatus = loan.status === "Devolvido";
    }

    if (statusFiltro === "expirado") {
      correspondeAoStatus = loan.status === "Expirado";
    }

    let correspondeAData = true;

    if (dataFiltro) {
      const [ano, mes, dia] = dataFiltro.split("-");

      const dataFormatada = `${dia}/${mes}/${ano}`;

      correspondeAData = loan.loanDate === dataFormatada;
    }

    return correspondeAoStatus && correspondeAData;
  });

  const emprestimosEmAndamento = loans.filter(
    (loan) => loan.status === "Em andamento",
  ).length;

  function dataEhHoje(data: string) {
    const hoje = new Date();

    const [dia, mes, ano] = data.split("/");

    return (
      Number(dia) === hoje.getDate() &&
      Number(mes) === hoje.getMonth() + 1 &&
      Number(ano) === hoje.getFullYear()
    );
  }

  const emprestimosQueExpiramHoje = loans.filter((loan) =>
    dataEhHoje(loan.expiration),
  ).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Nav />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
          <div className="mx-auto w-full max-w-6xl space-y-8">
            {/* CARDS */}
            <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              <DashboardCard
                title="Empréstimos em Andamento:"
                value={emprestimosEmAndamento}
              />

              <DashboardCard
                title="Quantidade de empréstimos que Expiram Hoje:"
                value={emprestimosQueExpiramHoje}
              />
            </section>

            {/* PESQUISA */}
            <section className="rounded-3xl bg-brand-200 p-4 shadow-sm md:p-6">
              <h2 className="mb-5 text-xl font-bold text-(--color-text-primary) sm:text-2xl">
                Pesquisar por Empréstimos
              </h2>

              <SearchFilters
                status={statusFiltro}
                data={dataFiltro}
                onStatusChange={setStatusFiltro}
                onDataChange={setDataFiltro}
              />

              <div className="mt-8 space-y-5">
                {carregando && (
                  <p className="text-center">Carregando empréstimos...</p>
                )}

                {!carregando && erro && <p className="text-center">{erro}</p>}

                {!carregando && !erro && loans.length === 0 && (
                  <p className="text-center">Você não possui empréstimos.</p>
                )}

                {!carregando &&
                  !erro &&
                  loans.length > 0 &&
                  loansFiltrados.length === 0 && (
                    <p className="text-center">
                      Nenhum empréstimo encontrado com esses filtros.
                    </p>
                  )}

                {!carregando &&
                  !erro &&
                  loansFiltrados.map((loan) => (
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
