"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/auth";

type Multa = {
  id: number;
  diasPunicao: number;
  status: string;
  tipo: string;
  dataInicio: string;
  dataTermino: string;
};

const MULTAS_POR_PAGINA = 10;

export default function MultasPage() {
  const [data, setData] = useState("");
  const [status, setStatus] = useState("");
  const [multas, setMultas] = useState<Multa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [id_freq, setId_freq] = useState<number | null>(null);

  // Obtém o frequentador logado.
  useEffect(() => {
    const session = getSession();

    if (session?.id) {
      setId_freq(Number(session.id));
    } else {
      setCarregando(false);
    }
  }, []);

  // Carrega as multas de acordo com os filtros.
  useEffect(() => {
    if (id_freq === null) {
      return;
    }

    async function carregarMultas() {
      try {
        setCarregando(true);

        const params = new URLSearchParams();

        params.set("fk_frequentador_id_frequentador", String(id_freq));

        if (data) {
          params.set("data", data);
        }

        if (status) {
          params.set("status", status);
        }

        const response = await fetch(`/api/multas?${params.toString()}`);

        if (!response.ok) {
          const erro = await response.text();
          console.error("Erro da API de multas:", erro);
          throw new Error("Erro ao carregar multas");
        }

        const resultado = await response.json();

        setMultas(resultado.multas);
      } catch (error) {
        console.error("Erro ao carregar multas:", error);
        setMultas([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarMultas();
  }, [id_freq, data, status]);

  // Retorna à primeira página quando os filtros mudam.
  useEffect(() => {
    setPaginaAtual(1);
  }, [data, status]);

  const totalPaginas = Math.ceil(multas.length / MULTAS_POR_PAGINA);

  const inicio = (paginaAtual - 1) * MULTAS_POR_PAGINA;

  const multasDaPagina = multas.slice(inicio, inicio + MULTAS_POR_PAGINA);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1">
        <Nav />

        <main className="min-w-0 flex-1 p-3 sm:p-5 md:p-6 lg:p-8 xl:p-10">
          <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8">
            {/* CARDS */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl bg-brand-500 p-3 text-center text-text-inverse shadow-md">
                <h2 className="font-semibold">
                  Minhas Multas
                  <br />
                  Pendentes:
                </h2>

                <span className="mt-1 text-3xl font-bold">
                  {multas.filter((multa) => multa.status === "Pendente").length}
                </span>
              </div>

              <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl bg-brand-500 p-3 text-center text-text-inverse shadow-md">
                <h2 className="font-semibold">
                  Dias de Punição
                  <br />
                  Total:
                </h2>

                <span className="mt-1 text-3xl font-bold">
                  {multas.reduce(
                    (total, multa) => total + multa.diasPunicao,
                    0,
                  )}
                </span>
              </div>

              <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl bg-brand-500 p-3 text-center text-text-inverse shadow-md">
                <h2 className="font-semibold">
                  Total de Multas
                  <br />
                  já Recebidas:
                </h2>

                <span className="mt-1 text-3xl font-bold">{multas.length}</span>
              </div>
            </section>

            {/* FILTROS E LISTA */}
            <section className="rounded-3xl bg-brand-200 p-4 shadow-sm sm:p-5 md:p-6 lg:p-8">
              <h1 className="mb-5 text-xl font-bold text-(--color-text-primary) sm:text-2xl">
                Pesquisar por Multas
              </h1>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  aria-label="Filtrar pela data de início ou término da multa"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-brand-600 outline-none focus:ring-2 focus:ring-brand-500"
                />

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-brand-600 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Todos os status</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="CONCLUÍDA">Concluída</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              {/* LISTA */}
              <div className="mt-6 flex flex-col gap-4">
                {carregando ? (
                  <div className="py-8 text-center">Carregando multas...</div>
                ) : multas.length === 0 ? (
                  <div className="py-8 text-center text-text-inverse">
                    Nenhuma multa encontrada.
                  </div>
                ) : (
                  multasDaPagina.map((multa) => (
                    <div
                      key={multa.id}
                      className="grid grid-cols-1 gap-4 rounded-2xl bg-brand-400 px-4 py-4 font-bold text-text-inverse sm:px-5 sm:py-5 md:grid-cols-2 md:gap-8 lg:gap-12 lg:px-8 lg:py-6"
                    >
                      <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                        <p>Dias de punição: {multa.diasPunicao} dias</p>

                        <p>Status da Multa: {multa.status}</p>
                      </div>

                      <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                        <p>Tipo da Multa: {multa.tipo}</p>

                        <p>Início da Multa: {multa.dataInicio}</p>

                        <p>Término da Multa: {multa.dataTermino}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PAGINAÇÃO */}
              {!carregando && multas.length > MULTAS_POR_PAGINA && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPaginaAtual((pagina) => Math.max(pagina - 1, 1))
                    }
                    disabled={paginaAtual === 1}
                    className="rounded-xl bg-brand-400 px-4 py-2 text-sm font-semibold text-text-inverse transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="rounded-xl bg-brand-400 px-4 py-2 text-sm font-semibold text-text-inverse transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
