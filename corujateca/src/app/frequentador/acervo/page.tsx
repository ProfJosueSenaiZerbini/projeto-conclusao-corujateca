"use client";

import { useEffect, useState } from "react";

import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LivroCarousel from "@/app/frequentador/acervo/components/LivroCarousel";

type Livro = {
  id_livro: number;
  titulo_livro: string;
  autor_livro: string;
  genero_livro: string;
  imgcapa_livro: string | null;
};

export default function AcervoFreq() {
  const [titulo, setTitulo] = useState("");
  const [genero, setGenero] = useState("");
  const [ano, setAno] = useState("");
  const [autor, setAutor] = useState("");

  const [livros, setLivros] = useState<Livro[]>([]);
  const [livrosTodos, setLivrosTodos] = useState<Livro[]>([]);
  const [livrosGeneroSemana, setLivrosGeneroSemana] = useState<Livro[]>([]);
  const [livrosMaisEmprestados, setLivrosMaisEmprestados] = useState<Livro[]>(
    [],
  );

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [pesquisaRealizada, setPesquisaRealizada] = useState(false);

  useEffect(() => {
    async function carregarDadosAcervo() {
      try {
        setErro("");

        const [
          respostaTodos,
          respostaGenero,
          respostaMaisEmprestados,
        ] = await Promise.all([
          fetch("/api/livros"),
          fetch("/api/livros/genero-semana"),
          fetch("/api/livros/mais-emprestados"),
        ]);

        if (!respostaTodos.ok) {
          throw new Error("Erro ao buscar todos os livros.");
        }

        if (!respostaGenero.ok) {
          throw new Error("Erro ao buscar o gênero da semana.");
        }

        if (!respostaMaisEmprestados.ok) {
          throw new Error("Erro ao buscar os livros mais emprestados.");
        }

        const dadosTodos = await respostaTodos.json();
        const dadosGenero = await respostaGenero.json();
        const dadosMaisEmprestados =
          await respostaMaisEmprestados.json();

        setLivrosTodos(dadosTodos);
        setLivrosGeneroSemana(dadosGenero.livros);
        setLivrosMaisEmprestados(dadosMaisEmprestados.livros);
      } catch (error) {
        console.error(error);
        setErro("Não foi possível carregar os livros.");
      }
    }

    carregarDadosAcervo();
  }, []);

  async function buscarLivros() {
    try {
      setCarregando(true);
      setErro("");
      setPesquisaRealizada(true);

      const params = new URLSearchParams();

      if (titulo.trim()) {
        params.append("titulo", titulo.trim());
      }

      if (genero.trim()) {
        params.append("genero", genero.trim());
      }

      if (ano.trim()) {
        params.append("ano", ano.trim());
      }

      if (autor.trim()) {
        params.append("autor", autor.trim());
      }

      const resposta = await fetch(
        `/api/livros?${params.toString()}`,
      );

      if (!resposta.ok) {
        throw new Error("Erro ao buscar livros.");
      }

      const dados = await resposta.json();

      setLivros(dados);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível buscar os livros.");
      setLivros([]);
    } finally {
      setCarregando(false);
    }
  }

  function limparPesquisa() {
    setTitulo("");
    setGenero("");
    setAno("");
    setAutor("");

    setLivros([]);
    setPesquisaRealizada(false);
    setErro("");
  }

  return (
    <div>
      <Header />

      <div className="flex">
        <Nav />

        <main className="flex-1 min-w-0 p-6 md:p-14 bg-(--color-background)">
          <section className="mb-3">
            <p className="text-base sm:text-lg text-[var(--color-text-primary)]">
              Bem-vindo,{" "}
              <strong className="font-bold">
                NOME DO USUÁRIO!
              </strong>
            </p>
          </section>

          <section className="mb-6">
            <p className="text-sm mb-2">
              Interessado em algum livro?
            </p>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Título"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="
                  w-full
                  border
                  rounded-lg
                  px-3
                  py-2
                "
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Gênero"
                  value={genero}
                  onChange={(e) => setGenero(e.target.value)}
                  className="
                    border
                    rounded-lg
                    px-3
                    py-2
                  "
                />

                <input
                  type="number"
                  placeholder="Ano"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  className="
                    border
                    rounded-lg
                    px-3
                    py-2
                  "
                />

                <input
                  type="text"
                  placeholder="Autor"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  className="
                    border
                    rounded-lg
                    px-3
                    py-2
                  "
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={buscarLivros}
                  disabled={carregando}
                  className="
                    mt-2
                    px-6
                    py-3
                    rounded-lg
                    bg-[var(--color-brand-500)]
                    text-[var(--color-text-inverse)]
                    font-bold
                    hover:bg-[var(--color-brand-400)]
                    transition-colors
                  "
                >
                  {carregando ? "Buscando..." : "Pesquisar"}
                </button>

                {pesquisaRealizada && (
                  <button
                    type="button"
                    onClick={limparPesquisa}
                    className="
                      mt-2
                      px-6
                      py-3
                      rounded-lg
                      border
                      border-[var(--color-brand-500)]
                      text-[var(--color-brand-500)]
                      font-bold
                    "
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>
          </section>

          {erro && (
            <p className="mb-4 text-[var(--color-text-primary)]">
              {erro}
            </p>
          )}

          <div className="bg-[var(--color-brand-100)] p-8 rounded-xl">
            {!pesquisaRealizada ? (
              <>
                {/* Gênero da Semana */}

                <LivroCarousel
                  titulo="Gênero da Semana"
                  livros={livrosGeneroSemana}
                />

                {/* Mais Emprestados */}

                <LivroCarousel
                  titulo="Mais Emprestados"
                  livros={livrosMaisEmprestados}
                />

                {/* Todos */}

                <LivroCarousel
                  titulo="Todos"
                  livros={livrosTodos}
                />
              </>
            ) : (
              <>
                {/* Resultados da Pesquisa */}

                {livros.length > 0 ? (
                  <LivroCarousel
                    titulo="Resultados da pesquisa"
                    livros={livros}
                  />
                ) : (
                  !carregando && (
                    <p className="text-[var(--color-text-primary)]">
                      Nenhum livro encontrado.
                    </p>
                  )
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}