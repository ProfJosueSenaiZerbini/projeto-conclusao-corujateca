"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";

export default function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [nome, setNome] = useState(searchParams.get("nome") ?? "");
  const [nomeLivro, setNomeLivro] = useState(searchParams.get("data") ?? "");
  const [data, setData] = useState(searchParams.get("dataFiltro") ?? "");

  function handleBuscar() {
    const params = new URLSearchParams(searchParams.toString());

    if (nome.trim()) {
      params.set("nome", nome.trim());
    } else {
      params.delete("nome");
    }

    // O parâmetro "data" continua reservado para o nome do livro.
    if (nomeLivro.trim()) {
      params.set("data", nomeLivro.trim());
    } else {
      params.delete("data");
    }

    // Um único campo de data para início OU término do empréstimo.
    if (data) {
      params.set("dataFiltro", data);
    } else {
      params.delete("dataFiltro");
    }

    // Remove os parâmetros antigos das duas datas.
    params.delete("dataEmprestimo");
    params.delete("dataExpiracao");

    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    params.delete("page");

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  return (
    <div className="relative flex flex-col gap-3">
      <input
        type="text"
        placeholder="Buscar por nome..."
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-brand-600 outline-none focus:ring-2 focus:ring-brand-500"
      />

      <input
        type="text"
        placeholder="Buscar por nome do livro..."
        value={nomeLivro}
        onChange={(e) => setNomeLivro(e.target.value)}
        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-brand-600 outline-none focus:ring-2 focus:ring-brand-500"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="date"
          aria-label="Filtrar pela data de início ou devolução do empréstimo"
          title="Busca pela data de início ou devolução prevista"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-brand-600 outline-none focus:ring-2 focus:ring-brand-500"
        />

        <div className="relative flex items-center">
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-4 h-4 w-4 text-brand-600/70"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`w-full cursor-pointer appearance-none rounded-2xl border border-gray-300 bg-white px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-brand-500 ${
              status === "" ? "text-brand-600/50" : "text-brand-600"
            }`}
          >
            <option value="">Por Status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Atrasado">Atrasado</option>
            <option value="Devolvido no prazo">Devolvido no prazo</option>
            <option value="Devolvido com atraso">Devolvido com atraso</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={handleBuscar}
        className="rounded-xl bg-brand-500 px-4 py-2.5 text-white transition-opacity hover:bg-brand-600 disabled:opacity-50"
      >
        {isPending ? "Buscando..." : "Buscar Empréstimos"}
      </button>
    </div>
  );
}
