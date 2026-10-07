"use client";

import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getSession, clearSession, UserSession } from "@/lib/auth";

export default function ConfiguracoesFrequent() {
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [excluindoConta, setExcluindoConta] = useState(false);
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const currentSession = getSession();

    if (!currentSession) {
      router.replace("/login");
      return;
    }

    if (currentSession.role !== "frequentador") {
      router.replace("/login?error=acesso-negado");
      return;
    }

    setSession(currentSession);
  }, [router]);

  const excluirConta = async () => {
    setExcluindoConta(true);

    try {
      const resposta = await fetch("/api/conta", {
        method: "DELETE",
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Não foi possível excluir a conta.");
      }

      clearSession();

      router.replace("/login");
    } catch (erro) {
      console.error("Erro ao excluir conta:", erro);

      alert(
        erro instanceof Error
          ? erro.message
          : "Não foi possível excluir a conta.",
      );

      setExcluindoConta(false);
      setModalExcluirAberto(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Nav />

        <main
          className="
          flex-1
          min-w-0
          p-6
          flex flex-col items-center justify-center
        "
        >
          <Image
            src="/images/pfp.png"
            alt="Coruja de perfil"
            className="mb-8 rounded-full mt-8"
            width={170}
            height={170}
          />

          <p className="text-3xl mb-3">{session?.nome}</p>

          <p className="text-1xl mb-1">
            Código de identificação: {session?.id}
          </p>

          <p className="text-1xl mb-8">
            Telefone: ({session?.ddd}) {session?.telefone}
          </p>

          <button
            onClick={() => setModalExcluirAberto(true)}
            className="cursor-pointer w-64 bg-button-secondary text-text-inverse font-medium py-3 mb-8 rounded-2xl hover:brightness-110 transition shadow-sm"
          >
            Excluir Conta
          </button>
        </main>

        {modalExcluirAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-background p-8 shadow-xl">
              <h2 className="text-2xl font-semibold text-text-primary mb-4">
                Excluir conta?
              </h2>

              <p className="text-base text-text-secondary leading-relaxed mb-8">
                Tem certeza de que deseja excluir sua conta? Essa ação não
                poderá ser desfeita.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalExcluirAberto(false)}
                  disabled={excluindoConta}
                  className="cursor-pointer px-5 py-3 rounded-2xl font-medium bg-button-secondary text-text-inverse hover:brightness-110 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={excluirConta}
                  disabled={excluindoConta}
                  className="cursor-pointer px-5 py-3 rounded-2xl font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  {excluindoConta ? "Excluindo..." : "Excluir conta"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
