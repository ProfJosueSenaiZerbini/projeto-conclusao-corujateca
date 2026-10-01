"use client";

import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getSession, UserSession } from "@/lib/auth";

export default function ConfiguracoesFrequent() {

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

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />

        <div className="flex flex-1">
          <Nav />

          <main className="
                        flex-1
                        min-w-0
                        p-6
                        flex flex-col items-center justify-center
                      ">

            <Image
              src="/images/pfp.png"
              alt="Coruja de perfil"
              className='mb-8 rounded-full mt-8'
              width={170}
              height={170}
            />
            <p className="text-3xl mb-3">{session?.nome}</p>
            <p className="text-1xl mb-1">Código de identificação: {session?.id}</p>
            <p className="text-1xl mb-8">Telefone: ({session?.ddd}) {session?.telefone}</p>


            <button className="cursor-pointer w-64 bg-button-secondary text-text-inverse font-medium py-3 mb-8 rounded-2xl hover:brightness-110 transition shadow-sm">
              Excluir Conta
            </button>

          </main>

        </div>

        <Footer />
      </div>
    </>
  );
}