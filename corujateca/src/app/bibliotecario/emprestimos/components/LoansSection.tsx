"use client";

import { useEffect, useState } from "react";
import LoanCard from "./LoanCard";

export type LoanView = {
  id: number;
  title: string;
  author: string;
  userName: string;
  status: string;
  daysOverdue: number;
  expiration: string;
  loanDate: string;
};

type LoansSectionProps = {
  loans: LoanView[];
};

const EMPRESTIMOS_POR_PAGINA = 10;

export default function LoansSection({
  loans,
}: LoansSectionProps) {
  const [paginaAtual, setPaginaAtual] = useState(1);

  const totalPaginas = Math.ceil(
    loans.length / EMPRESTIMOS_POR_PAGINA,
  );

  const inicio = (paginaAtual - 1) * EMPRESTIMOS_POR_PAGINA;

  const loansDaPagina = loans.slice(
    inicio,
    inicio + EMPRESTIMOS_POR_PAGINA,
  );

  // Sempre volta para a primeira página quando os filtros
  // alterarem a quantidade de empréstimos.
  useEffect(() => {
    setPaginaAtual(1);
  }, [loans]);

  return (
  <div className="mt-4">
    {loans.length === 0 ? (<p className="py-6 text-center text-(--color-text-primary)">
      Nenhum empréstimo encontrado. </p>
    ) : (
      <> <div className="space-y-5">
        {loansDaPagina.map((loan) => (<LoanCard
          key={loan.id}
          loan={loan}
        />
        ))} </div>

        {loans.length > EMPRESTIMOS_POR_PAGINA && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPaginaAtual((pagina) =>
                  Math.max(pagina - 1, 1),
                )
              }
              disabled={paginaAtual === 1}
              className="rounded-xl bg-brand-400 px-4 py-2 text-sm font-semibold text-(--color-text-inverse) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>

            <span className="px-3 text-sm font-semibold text-(--color-text-primary)">
              Página {paginaAtual} de {totalPaginas}
            </span>

            <button
              type="button"
              onClick={() =>
                setPaginaAtual((pagina) =>
                  Math.min(pagina + 1, totalPaginas),
                )
              }
              disabled={paginaAtual === totalPaginas}
              className="rounded-xl bg-brand-400 px-4 py-2 text-sm font-semibold text-(--color-text-inverse) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </>
    )}
  </div>
);
}
