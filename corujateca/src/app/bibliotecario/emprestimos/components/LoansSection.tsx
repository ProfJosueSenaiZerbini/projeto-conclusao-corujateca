"use client";

import { useRouter } from "next/navigation";

import LoanCard from "./LoanCard";

export type LoanView = {
  id: number;
  title: string;
  author: string;
  userName: string;
  status: string;
  expiration: string;
  loanDate: string;
};

export default function LoansSection({ loans }: { loans: LoanView[] }) {
  const router = useRouter();

  async function concluirEmprestimo(formData: FormData) {
    const idEmprestimo = Number(formData.get("id_emprestimo"));

    if (!idEmprestimo) {
      return;
    }

    const response = await fetch(`/api/emprestimos/${idEmprestimo}`, {
      method: "PATCH",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      alert(data?.error ?? "Erro ao concluir empréstimo.");
      return;
    }

    if (data?.multa) {
      const inicio = new Date(data.multa.dta_inicio_multa);
      const termino = new Date(data.multa.dta_termino_multa);
      const diasMulta = Math.round(
        (termino.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24),
      );

      alert(
        `Devolução concluída. Uma multa de atraso de ${diasMulta} ${
          diasMulta === 1 ? "dia" : "dias"
        } foi aplicada.`,
      );
    }

    router.refresh();
  }
 

  return (
    <div className="mt-8 space-y-5">
      {loans.map((loan) => (
        <LoanCard key={loan.id} loan={loan} onConcluir={concluirEmprestimo} />
        
      ))}
    </div>
  );
}
