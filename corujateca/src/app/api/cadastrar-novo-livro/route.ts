"use client";

import { FormEvent, useState } from "react";

type LivroForm = {
  isbn: string;
  titulo_livro: string;
  autor_livro: string;
  editora_livro: string;
  anopub_livro: string;
  genero_livro: string;
  localizacao_livro: string;
  imgcapa_livro: string;
  sinopse_livro: string;
};

const estadoInicial: LivroForm = {
  isbn: "",
  titulo_livro: "",
  autor_livro: "",
  editora_livro: "",
  anopub_livro: "",
  genero_livro: "",
  localizacao_livro: "",
  imgcapa_livro: "",
  sinopse_livro: "",
};

const generos = [
  { value: "Romance", label: "Romance" },
  { value: "Religião e Mitologia", label: "Religião e Mitologia" },
  { value: "Ficção Científica", label: "Ficção Científica" },
  { value: "Arte e Cultura", label: "Arte e Cultura" },
  { value: "Fantasia", label: "Fantasia" },
  { value: "Biografias e Memórias", label: "Biografias e Memórias" },
  { value: "Thriller e Mistério", label: "Thriller e Mistério" },
  { value: "Quadrinhos e Mangá", label: "Quadrinhos e Mangá" },
  { value: "Terror", label: "Terror" },
  { value: "Infantojuvenil", label: "Infantojuvenil" },
  { value: "Aventura", label: "Aventura" },
  { value: "Ciência e Conhecimento", label: "Ciência e Conhecimento" },
  { value: "Poesia e Crônicas", label: "Poesia e Crônicas" },
  { value: "História", label: "História" },
  {
    value: "Guia, Manual e Gastronomia",
    label: "Guia, Manual e Gastronomia",
  },
  { value: "Política", label: "Política" },
  {
    value: "Autoajuda e Desenvolvimento Pessoal",
    label: "Autoajuda e Desenvolvimento Pessoal",
  },
  { value: "Economia", label: "Economia" },
  { value: "Literatura", label: "Literatura" },
];

export default function CadastrarLivroPage() {
  const [form, setForm] = useState<LivroForm>(estadoInicial);
  const [carregando, setCarregando] = useState(false);
  const [buscandoIsbn, setBuscandoIsbn] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔍 Função para buscar dados do livro na API do Google Books
  const buscarDadosPorIsbn = async () => {
    const isbnLimpo = form.isbn.replace(/[^0-9X]/gi, "");

    if (!isbnLimpo) {
      setMensagem("Por favor, digite um ISBN válido para buscar.");
      return;
    }

    setBuscandoIsbn(true);
    setMensagem("");

    try {
      const resposta = await fetch(`/api/google-books?isbn=${isbnLimpo}`);
      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Erro ao buscar dados do livro.");
      }

      setForm((prev) => ({
        ...prev,
        isbn: isbnLimpo,
        titulo_livro: dados.titulo_livro || prev.titulo_livro,
        autor_livro: dados.autor_livro || prev.autor_livro,
        editora_livro: dados.editora_livro || prev.editora_livro,
        anopub_livro: dados.anopub_livro
          ? String(dados.anopub_livro)
          : prev.anopub_livro,
        imgcapa_livro: dados.imgcapa_livro || prev.imgcapa_livro,
        sinopse_livro: dados.sinopse_livro || prev.sinopse_livro,
      }));

      setMensagem("Campos preenchidos automaticamente via Google Books!");
    } catch (erro) {
      const msg =
        erro instanceof Error ? erro.message : "Falha ao buscar ISBN.";

      setMensagem(msg);
    } finally {
      setBuscandoIsbn(false);
    }
  };

  const enviarLivroParaBackend = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setCarregando(true);
    setMensagem("");

    try {
      const dadosParaEnviar = {
        ...form,
        anopub_livro: Number(form.anopub_livro),
      };

      const resposta = await fetch("/api/livros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosParaEnviar),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(resultado.erro || "Erro ao cadastrar o livro.");
      }

      setMensagem("Livro cadastrado com sucesso!");
      setForm(estadoInicial);
    } catch (erro) {
      const mensagemErro =
        erro instanceof Error ? erro.message : "Falha ao cadastrar livro.";

      setMensagem(mensagemErro);
    } finally {
      setCarregando(false);
    }
  };
}