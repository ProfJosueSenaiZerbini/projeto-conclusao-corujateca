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
  const [totalUsuarios, setTotalUsuarios] = useState<number>(5);

  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function carregarUsuarios() {
    try {
      const resposta = await fetch("/api/frequentador");
      if (resposta.ok) {
        const dados = await resposta.json();
        setUsuarios(dados);
        setTotalUsuarios(dados.length);
      }
    } catch (erro) {
      console.error("Erro ao carregar usuários:", erro);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault();
    if (!novoNome.trim()) return;

    setCarregando(true);
    try {
      const res = await fetch("/api/frequentador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome }),
      });

      if (res.ok) {
        setNovoNome("");
        setModalAberto(false);
        carregarUsuarios();
      } else {
        alert("Erro ao cadastrar usuário.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  const usuariosFiltrados = usuarios.filter((user) =>
    user.nome.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1">
        <Nav />

        {/* Main com flex, justify-center e items-center para centralizar perfeitamente */}
        <main className="flex-1 min-w-0 p-8 flex justify-center items-center">
          
          {/* Bloco central com largura média controlada */}
          <div className="w-full max-w-3xl space-y-6">
            
            {/* Card Contagem de Usuários */}
            <div className="bg-brand-500 text-text-inverse p-6 rounded-2xl flex justify-between items-center shadow-md">
              <h2 className="text-2xl font-normal leading-snug">
                Quantidade de<br />Usuários:
              </h2>
              <span className="text-6xl font-bold">{totalUsuarios}</span>
            </div>

            {/* Ações */}
            <div className="flex gap-6">
              <button 
                onClick={() => setModalAberto(true)}
                className="flex-1 bg-button-primary text-text-inverse font-medium py-3 px-6 rounded-2xl hover:brightness-110 transition shadow-sm text-center"
              >
                Cadastrar Novo Usuário
              </button>
              <button className="flex-1 bg-button-secondary text-text-inverse font-medium py-3 px-6 rounded-2xl hover:brightness-110 transition shadow-sm text-center">
                Reativar Usuário
              </button>
            </div>

            {/* Campo de Busca */}
            <div className="space-y-2">
              <label className="block font-bold text-text-primary text-lg">
                Pesquisar por Usuário
              </label>
              <input
                type="text"
                placeholder="Nome do Usuário"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="w-full bg-white border border-brand-400 rounded-xl px-4 py-2 text-brand-800 placeholder-brand-500 focus:outline-none focus:ring-2 focus:ring-button-primary"
              />
            </div>

            {/* Tabela de Usuários */}
            <div className="border border-brand-800 rounded-t-xl overflow-hidden bg-white shadow-md">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-brand-800 text-text-inverse border-b border-brand-800 text-left">
                    <th className="p-3 border-r border-brand-700 font-bold text-lg w-1/2">
                      Nome do Usuário
                    </th>
                    <th className="p-3 font-bold text-lg text-center w-1/2">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-300">
                  {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-brand-200/40 transition">
                        <td className="p-3 border-r border-brand-300 uppercase font-medium text-brand-800">
                          {usuario.nome}
                        </td>
                        <td className="p-2">
                          <div className="flex justify-center gap-2">
                            <button className="bg-button-primary text-text-inverse px-3 py-1 rounded-lg hover:brightness-110 transition text-sm font-medium">
                              Detalhes
                            </button>
                            <button className="bg-brand-500 text-text-inverse px-3 py-1 rounded-lg hover:brightness-110 transition text-sm font-medium">
                              Atualizar
                            </button>
                            <button className="bg-button-secondary text-text-inverse px-3 py-1 rounded-lg hover:brightness-110 transition text-sm font-medium">
                              Deletar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-gray-500">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </main>
      </div>

      {/* Modal de Cadastrar Frequentador */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-brand-800">Cadastrar Novo Frequentador</h3>
            
            <form onSubmit={handleCadastrar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Ana Souza"
                  className="w-full border border-brand-400 rounded-xl p-2 text-brand-800 focus:outline-none focus:ring-2 focus:ring-button-primary"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="px-4 py-2 rounded-xl bg-button-primary text-white hover:brightness-110 disabled:opacity-50"
                >
                  {carregando ? "Salvando..." : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}