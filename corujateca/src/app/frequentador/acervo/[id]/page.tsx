"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type Livro = {
  id_livro: number;
  titulo_livro?: string;
  titulo?: string;
  autor_livro?: string;
  autor?: string;
  genero_livro?: string;
  genero?: string;
  cor_genero?: string | null;
  editora_livro?: string;
  editora?: string;
  anopub_livro?: number;
  ano_publicacao?: number;
  ano?: number;
  qtd_paginas?: number;
  paginas?: number;
  qtd_copias?: number;
  copias?: number;
  status_livro?: string;
  status?: string;
  localizacao_livro?: string;
  localizacao?: string;
  sinopse_livro?: string;
  sinopse?: string;
  imgcapa_livro?: string | null;
  capa?: string | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

const coresGenero: Record<string, string> = {
  romance: "var(--color-romance)",
  religião: "var(--color-religion-mythology)",
  religiao: "var(--color-religion-mythology)",
  mitologia: "var(--color-religion-mythology)",
  "religião e mitologia": "var(--color-religion-mythology)",
  "religiao e mitologia": "var(--color-religion-mythology)",
  "ficção": "var(--color-science-fiction)",
  "ficcao": "var(--color-science-fiction)",
  "arte e cultura": "var(--color-art-culture)",
  fantasia: "var(--color-fantasy)",
  biografias: "var(--color-biographies-memoirs)",
  memórias: "var(--color-biographies-memoirs)",
  memorias: "var(--color-biographies-memoirs)",
  thriller: "var(--color-thriller-mystery)",
  mistério: "var(--color-thriller-mystery)",
  misterio: "var(--color-thriller-mystery)",
  "quadrinhos e mangá": "var(--color-comics-manga)",
  "quadrinhos e manga": "var(--color-comics-manga)",
  terror: "var(--color-horror)",
  infantojuvenil: "var(--color-children-young-adult)",
  aventura: "var(--color-adventure)",
  "ciência e conhecimento": "var(--color-science-knowledge)",
  "ciencia e conhecimento": "var(--color-science-knowledge)",
  "poesia e crônicas": "var(--color-poetry-chronicles)",
  "poesia e cronicas": "var(--color-poetry-chronicles)",
  história: "var(--color-history)",
  historia: "var(--color-history)",
  "guia, manual e gastronomia": "var(--color-guide-manual-gastronomy)",
  política: "var(--color-politics)",
  politica: "var(--color-politics)",
  "autoajuda e desenvolvimento pessoal":
    "var(--color-selfHelp-personal-development)",
  economia: "var(--color-economy)",
  literatura: "var(--color-literature)",
};

export default function DetalhesLivroFrequentadorPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;

  const [livro, setLivro] = useState<Livro | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarLivro() {
      if (!id) return;

      try {
        setCarregando(true);
        setErro("");

        const res = await fetch(`/api/livros/${id}`);
        if (!res.ok) {
          throw new Error("Erro ao buscar informações do livro.");
        }

        const dados = await res.json();
        const livroDados = dados.livro || dados;
        setLivro(livroDados);
      } catch (err) {
        console.error("Erro na requisição do livro:", err);
        setErro("Não foi possível carregar os dados deste livro.");
      } finally {
        setCarregando(false);
      }
    }

    carregarLivro();
  }, [id]);

  const titulo = livro?.titulo_livro || livro?.titulo;
  const autor = livro?.autor_livro || livro?.autor;
  const genero = livro?.genero_livro || livro?.genero;
  const editora = livro?.editora_livro || livro?.editora;
  const ano = livro?.anopub_livro || livro?.ano_publicacao || livro?.ano;
  const paginas = livro?.qtd_paginas ?? livro?.paginas;
  const copias = livro?.qtd_copias ?? livro?.copias ?? 0;
  const status = livro?.status_livro || livro?.status;
  const localizacao = livro?.localizacao_livro || livro?.localizacao;
  const sinopse = livro?.sinopse_livro || livro?.sinopse;
  const capa = livro?.imgcapa_livro || livro?.capa;

  const generoChave = genero?.trim().toLowerCase() ?? "";
  const corGenero =
    livro?.cor_genero || coresGenero[generoChave] || "var(--color-brand-500)";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <Header />

      <div className="flex flex-1">
        <Nav />

        <main className="flex-1 min-w-0 p-6 md:p-10">
          <div className="max-w-4xl mx-auto bg-gray-100/85 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <Link
                href="/frequentador/acervo"
                className="inline-flex items-center text-black font-semibold text-base hover:opacity-75 transition-opacity"
              >
                ← Voltar
              </Link>
            </div>

            {carregando ? (
              <div className="p-12 text-center text-gray-600 animate-pulse font-medium">
                Carregando informações do livro...
              </div>
            ) : erro ? (
              <div className="p-12 text-center text-red-600 font-medium">
                {erro}
              </div>
            ) : livro ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  <div className="md:col-span-5 flex flex-col items-center gap-3">
                    <div className="w-full aspect-[3/4] bg-gray-400 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
                      {capa ? (
                        <img
                          src={capa}
                          alt={titulo || "Capa do livro"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-700 font-medium">Sem Capa</span>
                      )}
                    </div>

                    <div className="w-full bg-[#3e3e3e] text-white text-center py-2 px-4 rounded-full font-bold text-xs uppercase tracking-wider">
                      {status || "Disponível"}
                    </div>
                  </div>

                  <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-extrabold text-black uppercase mb-2">
                        {titulo || "Título Indefinido"}
                      </h1>

                      {genero && (
                        <span
                          style={{ backgroundColor: corGenero }}
                          className="inline-block text-[var(--color-text-primary)] text-xs font-bold uppercase px-4 py-1.5 rounded-full mb-4 leading-none"
                        >
                          {genero}
                        </span>
                      )}

                      <div className="space-y-1.5 text-black text-sm md:text-base">
                        <p>
                          <span className="font-semibold">Autor:</span>{" "}
                          {autor || "Não informado"}
                        </p>
                        <p>
                          <span className="font-semibold">Ano de publicação:</span>{" "}
                          {ano || "Não informado"}
                        </p>
                        <p>
                          <span className="font-semibold">Quantidade de páginas:</span>{" "}
                          {paginas ?? "Não informado"}
                        </p>
                        <p>
                          <span className="font-semibold">Editora:</span>{" "}
                          {editora || "Não informada"}
                        </p>
                        <p>
                          <span className="font-semibold">Quantidade de cópias:</span>{" "}
                          <span className={copias === 0 ? "text-red-600 font-bold" : ""}>
                            {copias} {copias === 0 ? "(Indisponível)" : ""}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-black text-base pt-2">
                  <span className="font-semibold">Localização:</span>{" "}
                  {localizacao || "Não informada"}
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold text-black">Sinopse</h2>
                  <p className="text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-line">
                    {sinopse || "Nenhuma sinopse cadastrada para este livro."}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}