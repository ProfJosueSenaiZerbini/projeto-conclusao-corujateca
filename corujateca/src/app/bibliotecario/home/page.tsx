"use client";

import { LibraryBig, Stamp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import { getSession, UserSession } from "@/lib/auth";

export default function HomeBibli() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);

  const [livrosEmprestados, setLivrosEmprestados] = useState(0);
  const [multasAtivas, setMultasAtivas] = useState(0);

  const [emprestimosHoje, setEmprestimosHoje] = useState<EmprestimoHoje[]>([]);

  type EmprestimoHoje = {
    id: number;
    titulo: string;
    autor: string;
    dataEmprestimo: string;
    dataDevolucao: string;
    nomeUsuario: string;
  };

  useEffect(() => {
    const currentSession = getSession();

    if (!currentSession) {
      router.replace("/login");
      return;
    }

    if (currentSession.role !== "bibliotecario") {
      router.replace("/login?error=acesso-negado");
      return;
    }

    setSession(currentSession);
  }, [router]);

  useEffect(() => {
    async function carregarResumo() {
      try {
        const resposta = await fetch("/api/bibliotecario/resumo");

        if (!resposta.ok) {
          throw new Error("Erro ao buscar resumo do bibliotecário.");
        }

        const dados = await resposta.json();

        setLivrosEmprestados(dados.livrosEmprestados);
        setMultasAtivas(dados.multasAtivas);
      } catch (error) {
        console.error("Erro ao buscar resumo do bibliotecário:", error);

        setLivrosEmprestados(0);
        setMultasAtivas(0);
      }
    }

    carregarResumo();
  }, []);

  useEffect(() => {
    async function carregarEmprestimosHoje() {
      try {
        const resposta = await fetch(
          "/api/bibliotecario/emprestimos-hoje",
        );

        if (!resposta.ok) {
          throw new Error(
            "Erro ao buscar empréstimos que vencem hoje.",
          );
        }

        const dados = await resposta.json();

        setEmprestimosHoje(dados.emprestimos);
      } catch (error) {
        console.error(
          "Erro ao buscar empréstimos que vencem hoje:",
          error,
        );

        setEmprestimosHoje([]);
      }
    }

    carregarEmprestimosHoje();
  }, []);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Nav />

        <main className="flex-1 min-w-0 p-10 md:p-10">

          <section className="mb-6">
            <p className="text-base sm:text-lg text-[var(--color-text-primary)]">
              Bem-vindo,{" "}
              <strong className="font-bold">
                {session.nome}
              </strong>
            </p>
          </section>


          <section className="grid grid-cols-2 gap-1.5 mb-4">

            <div
              className="
                rounded-xl
                shadow-md
                bg-[var(--color-brand-500)]
                text-[var(--color-text-inverse)]
                flex
                flex-col
                items-center
                justify-center
                text-center
                min-h-28
                sm:min-h-32
                p-3
              "
            >
              <p className="text-sm sm:text-base md:text-lg leading-tight">
                Quantidade de
                <br />
                Livros Emprestados:
              </p>

              <strong className="text-3xl sm:text-4xl font-bold mt-2">
                {livrosEmprestados}
              </strong>
            </div>


            {/* Quantidade de multas */}
            <div
              className="
                rounded-xl
                shadow-md
                bg-[var(--color-brand-500)]
                text-[var(--color-text-inverse)]
                flex
                flex-col
                items-center
                justify-center
                text-center
                min-h-28
                sm:min-h-32
                p-3
              "
            >
              <p className="text-sm sm:text-base md:text-lg leading-tight">
                Quantidade de
                <br />
                Multas Ativas:
              </p>

              <strong className="text-3xl sm:text-4xl font-bold mt-2">
                {multasAtivas}
              </strong>
            </div>

          </section>


          <section
            className="
              bg-[var(--color-brand-200)]
              shadow-md
              rounded-2xl
              p-3
              sm:p-4
              mb-6
            "
          >
            <h2
              className="
                text-base
                sm:text-lg
                font-bold
                text-[var(--color-text-primary)]
                mb-2
              "
            >
              Empréstimos que vencem hoje
            </h2>

            <div
              className="
    max-h-[320px]
    overflow-y-auto
    space-y-3
    pr-1
  "
            >
              {emprestimosHoje.length === 0 ? (
                <article
                  className="
        bg-[var(--color-brand-400)]
        text-[var(--color-text-inverse)]
        rounded-2xl
        p-4
      "
                >
                  <p className="text-sm">
                    Nenhum empréstimo vence hoje.
                  </p>
                </article>
              ) : (
                emprestimosHoje.map((emprestimo) => (
                  <article
                    key={emprestimo.id}
                    className="
          bg-[var(--color-brand-400)]
          text-[var(--color-text-inverse)]
          rounded-2xl
          p-3
          grid
          grid-cols-1
          sm:grid-cols-[1fr_auto]
          gap-y-2
          sm:gap-x-6
        "
                  >
                    <div className="flex flex-col min-w-0">
                      <strong className="text-sm sm:text-base leading-tight">
                        {emprestimo.titulo}
                      </strong>

                      <span className="text-xs leading-tight">
                        {emprestimo.autor}
                      </span>
                    </div>

                    <div className="text-xs leading-snug sm:min-w-max">
                      <p>
                        <strong>Data de Expiração:</strong>{" "}
                        {emprestimo.dataDevolucao}
                      </p>

                      <p>
                        <strong>Data do Empréstimo:</strong>{" "}
                        {emprestimo.dataEmprestimo}
                      </p>
                    </div>

                    <span className="text-sm sm:col-span-1">
                      {emprestimo.nomeUsuario}
                    </span>
                  </article>
                ))
              )}
            </div>

          </section>

          <section
            className="
              grid
              grid-cols-1
              sm:grid-cols-[1.7fr_1fr]
              gap-2
            "
          >

            {/* Coluna esquerda */}
            <div
              className="
                flex
                flex-col
                gap-2
              "
            >

              <Link href="/bibliotecario/acervo" className="
                cursor-pointer
                shadow-md
                  w-full
                  min-h-12
                  bg-[var(--color-brand-200)]
                  rounded-2xl
                  flex
                  items-center
                  px-4
                  text-base
                  sm:text-lg
                  font-bold
                  text-left
                  text-[var(--color-text-primary)]
                  hover:bg-[var(--color-brand-100)]
                  transition-colors
                ">

                <LibraryBig size={20} className="mr-2" />
                <span>Acervo</span>
              </Link>


              <Link href="/bibliotecario/emprestimos" className="
                shadow-md
                cursor-pointer  
                w-full
                  min-h-12
                  bg-[var(--color-brand-200)]
                  rounded-2xl
                  flex
                  items-center
                  px-4
                  text-base
                  sm:text-lg
                  font-bold
                  text-left
                  text-[var(--color-text-primary)]
                  hover:bg-[var(--color-brand-100)]
                  transition-colors
                ">
                <Stamp size={20} className="mr-2" />
                <span>Empréstimos</span>
              </Link>

            </div>

            <Link href="/bibliotecario/ajuda" className="
               cursor-pointer
               shadow-md
                min-h-28
                sm:min-h-full
                bg-[var(--color-brand-200)]
                rounded-2xl
                flex
                items-center
                justify-center
                text-center
                text-base
                sm:text-lg
                font-bold
                leading-tight
                text-[var(--color-text-primary)]
                hover:bg-[var(--color-brand-100)]
                transition-colors
              ">
              <span>
                Precisa
                <br />
                de
                <br />
                Ajuda?
              </span>
            </Link>

          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
}