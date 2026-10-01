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
  data: string;
};

export default function MultasPage() {
  const [data, setData] = useState("");
  const [status, setStatus] = useState("");
  const [multas, setMultas] = useState<Multa[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Não coloque 1 aqui.
  // O ID deve vir da sessão.
  const [id_freq, setId_freq] = useState<number | null>(null);

  // Pega o frequentador logado
  useEffect(() => {
    const session = getSession();

    if (session?.id) {
      setId_freq(Number(session.id));
    }
  }, []);

  // Carrega as multas
  useEffect(() => {
    if (id_freq === null) {
      return;
    }

    async function carregarMultas() {
      try {
        setCarregando(true);

        const params = new URLSearchParams();

        params.set(
          "fk_frequentador_id_frequentador",
          String(id_freq)
        );

        if (data) {
          params.set("data", data);
        }

        if (status) {
          params.set("status", status);
        }

        const response = await fetch(
          `/api/multas?${params.toString()}`
        );

        if (!response.ok) {
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

  return (
    <div className="min-h-screen flex flex-col">
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
                  {
                    multas.filter(
                      (multa) => multa.status === "Pendente"
                    ).length
                  }
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
                    (total, multa) =>
                      total + multa.diasPunicao,
                    0
                  )}
                </span>
              </div>

              <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl bg-brand-500 p-3 text-center text-text-inverse shadow-md">
                <h2 className="font-semibold">
                  Total de Multas
                  <br />
                  já Recebidas:
                </h2>

                <span className="mt-1 text-3xl font-bold">
                  {multas.length}
                </span>
              </div>

            </section>

            {/* FILTROS */}
            <section className="rounded-3xl bg-brand-200 p-4 shadow-sm sm:p-5 md:p-6 lg:p-8">

              <h1 className="mb-5 text-xl font-bold text-(--color-text-primary) sm:text-2xl">
                Pesquisar por Multas
              </h1>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-brand-600
                    outline-none
                    focus:ring-2
                    focus:ring-brand-500
                  "
                />

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-300
                    bg-white
                    px-5
                    py-3
                    text-brand-600
                    outline-none
                    focus:ring-2
                    focus:ring-brand-500
                  "
                >
                  <option value="">
                    Todos os status
                  </option>

                  <option value="PENDENTE">
                    Pendente
                  </option>

                  <option value="CONCLUÍDA">
                    Concluída
                  </option>

                  <option value="CANCELADA">
                    Cancelada
                  </option>
                </select>

              </div>

              {/* LISTA */}
              <div className="mt-6 flex flex-col gap-4">

                {carregando ? (
                  <div className="py-8 text-center">
                    Carregando multas...
                  </div>
                ) : multas.length === 0 ? (
                  <div className="py-8 text-center text-text-inverse">
                    Nenhuma multa encontrada.
                  </div>
                ) : (
                  multas.map((multa) => (
                    <div
                      key={multa.id}
                      className="
                        grid
                        grid-cols-1
                        gap-4
                        rounded-2xl
                        bg-brand-400
                        px-4
                        py-4
                        font-bold
                        text-text-inverse
                        md:grid-cols-2
                        md:gap-8
                        lg:gap-12
                        sm:px-5
                        sm:py-5
                        lg:px-8
                        lg:py-6
                      "
                    >
                      <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                        <p>
                          Dias de punição:{" "}
                          {multa.diasPunicao} dias
                        </p>

                        <p>
                          Status da Multa: {multa.status}
                        </p>
                      </div>

                      <div className="space-y-1 sm:space-y-2 lg:space-y-3">
                        <p>
                          Tipo da Multa: {multa.tipo}
                        </p>

                        <p>
                          Data da Multa: {multa.data}
                        </p>
                      </div>
                    </div>
                  ))
                )}

              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
