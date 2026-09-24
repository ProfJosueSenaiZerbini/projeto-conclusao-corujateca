"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Frequentador = {
  id_freq: number;
  nome_freq: string;
};

type ExemplarDisponivel = {
  id_exemplar: number;
  livro: { titulo_livro: string };
};

export default function CreateEmprestimoForm({
  frequentadores,
  exemplaresDisponiveis,
}: {
  frequentadores: Frequentador[];
  exemplaresDisponiveis: ExemplarDisponivel[];
}) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const frequentador = String(formData.get("fk_frequentador_id_freq") ?? "");
    const exemplar = String(formData.get("fk_exemplar_id_exemplar") ?? "");
    const senha = String(formData.get("senha") ?? "").trim();
    const prazoDias = String(formData.get("prazo_dias") ?? "");

    if (!frequentador) {
      setErro("Selecione o frequentador.");
      setEnviando(false);
      return;
    }

    if (!exemplar) {
      setErro("Selecione o exemplar.");
      setEnviando(false);
      return;
    }

    if (!senha) {
      setErro("Informe a senha do frequentador.");
      setEnviando(false);
      return;
    }

    if (!prazoDias) {
      setErro("Informe a quantidade de dias do empréstimo.");
      setEnviando(false);
      return;
    }

    try {
      const response = await fetch("/api/emprestimos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fk_frequentador_id_freq: frequentador,
          fk_exemplar_id_exemplar: exemplar,
          prazo_dias: prazoDias,
          senha,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErro(data?.error ?? "Erro ao criar empréstimo.");
        return;
      }

      form.reset();
      router.refresh();
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-bold text-[var(--color-text-primary)]">
        Criar Empréstimo
      </h3>

      {erro && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {erro}
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-4">
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
          disabled={enviando}
          className="rounded-xl bg-[var(--color-button-primary)] px-4 py-2 font-bold text-text-inverse transition hover:brightness-110 disabled:opacity-60"
        >
          {enviando ? "Criando..." : "Criar Empréstimo"}
        </button>

        <input
          type="password"
          name="senha"
          placeholder="Senha do frequentador"
          autoComplete="current-password"
          required
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-brand-600 outline-none focus:ring-2 focus:ring-brand-500 md:col-span-3"
        />
      </form>
    </div>
  );
}
