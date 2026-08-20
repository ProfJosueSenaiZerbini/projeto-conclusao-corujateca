'use client';

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

type Usuario = {
  id: number;
  nome: string;
};

export default function UsuariosBibli() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [totalUsuarios, setTotalUsuarios] = useState<number>(75);

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const resposta = await fetch("/api/usuarios");
        if (resposta.ok) {
          const dados = await resposta.json();
          setUsuarios(dados);
          setTotalUsuarios(dados.length);
        }
      } catch (erro) {
        console.error("Erro ao carregar usuários:", erro);
      }
    }
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter((user) =>
    user.nome.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  return (
    <>
      <div className="flex-1 w-full flex flex-col bg-[var(--color-background)] font-sans text-[var(--color-text-primary)]">
        {/* Header oficial do projeto */}
        <Header />

        {/* Layout Principal */}
        <div className="flex flex-1">
          {/* Navegação Lateral Dinâmica */}
          <Nav />

          {/* Área Principal */}
          <main className="flex-1 ml-20 md:ml-64 p-8 space-y-6">
            
            {/* Card Contagem de Usuários */}
            <div className="bg-[var(--brand-500)] text-white p-6 rounded-2xl flex justify-between items-center max-w-2xl shadow-md">
              <h2 className="text-2xl font-normal leading-snug">
                Quantidade de<br />Usuários:
              </h2>
              <span className="text-6xl font-bold">{totalUsuarios}</span>
            </div>

            {/* Ações com as cores do protótipo */}
            <div className="flex gap-6 max-w-2xl">
              <button className="flex-1 bg-[#6B7A4B] text-white font-medium py-3 px-6 rounded-2xl hover:brightness-110 transition shadow-sm">
                Cadastrar Novo Usuário
              </button>
              <button className="flex-1 bg-[#98462B] text-white font-medium py-3 px-6 rounded-2xl hover:brightness-110 transition shadow-sm">
                Reativar Usuário
              </button>
            </div>

            {/* Campo de Busca */}
            <div className="space-y-2 max-w-2xl">
              <label className="block font-bold text-[var(--color-text-primary)] text-lg">
                Pesquisar por Multas
              </label>
              <input
                type="text"
                placeholder="Nome do Usuário"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="w-full bg-white border border-[var(--brand-400)] rounded-xl px-4 py-2 text-[var(--brand-800)] placeholder-[var(--brand-500)] focus:outline-none focus:ring-2 focus:ring-[#6B7A4B]"
              />
            </div>

            {/* Tabela de Usuários */}
            <div className="max-w-2xl border border-[var(--brand-800)] rounded-t-xl overflow-hidden bg-white shadow-md">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--brand-800)] text-[var(--color-text-inverse)] border-b border-[var(--brand-800)] text-left">
                    <th className="p-3 border-r border-[var(--brand-700)] font-bold text-lg w-1/2">
                      Nome do Usuário
                    </th>
                    <th className="p-3 font-bold text-lg text-center w-1/2">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--brand-300)]">
                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-[var(--brand-200)]/40 transition">
                        <td className="p-3 border-r border-[var(--brand-300)] uppercase font-medium text-[var(--brand-800)]">
                          {usuario.nome}
                        </td>
                        <td className="p-2">
                          <div className="flex justify-center gap-2">
                            <button className="bg-[#6B7A4B] text-white px-3 py-1 rounded-lg hover:brightness-110 transition text-sm font-medium">
                              Detalhes
                            </button>
                            <button className="bg-[var(--brand-500)] text-white px-3 py-1 rounded-lg hover:brightness-110 transition text-sm font-medium">
                              Atualizar
                            </button>
                            <button className="bg-[#98462B] text-white px-3 py-1 rounded-lg hover:brightness-110 transition text-sm font-medium">
                              Deletar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    [1, 2, 3, 4, 5].map((idx) => (
                      <tr key={idx} className="border-b border-[var(--brand-300)] h-12 hover:bg-[var(--brand-200)]/30">
                        <td className="p-3 border-r border-[var(--brand-300)] uppercase font-medium text-[var(--brand-800)]">
                          {idx === 1 ? "NOME DO USUARIO" : ""}
                        </td>
                        <td className="p-2">
                          {idx === 1 && (
                            <div className="flex justify-center gap-2">
                              <button className="bg-[#6B7A4B] text-white px-3 py-1 rounded-lg text-sm font-medium">
                                Detalhes
                              </button>
                              <button className="bg-[var(--brand-500)] text-white px-3 py-1 rounded-lg text-sm font-medium">
                                Atualizar
                              </button>
                              <button className="bg-[#98462B] text-white px-3 py-1 rounded-lg text-sm font-medium">
                                Deletar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </main>
        </div>

        {/* Rodapé oficial */}
        <Footer />
      </div>
    </>
  );
}