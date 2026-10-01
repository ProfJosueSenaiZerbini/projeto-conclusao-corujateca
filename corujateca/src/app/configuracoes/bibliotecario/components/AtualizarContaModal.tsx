"use client";

import { useEffect, useState } from "react";

type AtualizarContaModalProps = {
    aberto: boolean;
    idBibliotecario: number;
    nomeAtual: string;
    dddAtual: string;
    telefoneAtual: string;
    onFechar: () => void;
    onSucesso: (dados: {
        nome: string;
        ddd: string;
        telefone: string;
    }) => void;
};

export default function AtualizarContaModal({
    aberto,
    idBibliotecario,
    nomeAtual,
    dddAtual,
    telefoneAtual,
    onFechar,
    onSucesso,
}: AtualizarContaModalProps) {
    const [nome, setNome] = useState("");
    const [ddd, setDdd] = useState("");
    const [telefone, setTelefone] = useState("");

    const [carregando, setCarregando] =
        useState(false);

    const [erro, setErro] = useState("");

    const [confirmando, setConfirmando] =
        useState(false);

    /*
     * Quando o modal abre, carrega os dados atuais.
     */
    useEffect(() => {
        if (aberto) {
            setNome(nomeAtual);
            setDdd(dddAtual);
            setTelefone(telefoneAtual);

            setErro("");
            setConfirmando(false);
        }
    }, [
        aberto,
        nomeAtual,
        dddAtual,
        telefoneAtual,
    ]);

    if (!aberto) {
        return null;
    }

    /*
     * Primeira etapa:
     * usuário clica em concluir.
     *
     * Em vez de atualizar imediatamente,
     * mostramos a confirmação.
     */
    function solicitarConfirmacao() {
        setErro("");

        if (!nome.trim()) {
            setErro("O nome é obrigatório.");
            return;
        }

        if (!ddd.trim()) {
            setErro("O DDD é obrigatório.");
            return;
        }

        if (!telefone.trim()) {
            setErro("O telefone é obrigatório.");
            return;
        }

        setConfirmando(true);
    }

    /*
     * Segunda etapa:
     * usuário confirmou a alteração.
     */
    async function atualizarConta() {
        try {
            setCarregando(true);
            setErro("");

            const resposta = await fetch(
                `/api/bibliotecario/${idBibliotecario}/atualizar`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nome: nome.trim(),
                        ddd: ddd.trim(),
                        telefone: telefone.trim(),
                    }),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados?.erro ||
                    "Não foi possível atualizar a conta."
                );
            }

            /*
             * Atualiza os dados da sessão na página.
             */
            onSucesso({
                nome: dados.nome,
                ddd: dados.ddd,
                telefone: dados.telefone,
            });

            setConfirmando(false);

            onFechar();
        } catch (error) {
            console.error(error);

            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar a conta."
            );

            setConfirmando(false);
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                {!confirmando ? (
                    <>
                        <h2 className="mb-6 text-2xl font-bold text-gray-800">
                            Atualizar Conta
                        </h2>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label
                                    htmlFor="nome"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Nome
                                </label>

                                <input
                                    id="nome"
                                    type="text"
                                    value={nome}
                                    onChange={(e) =>
                                        setNome(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[var(--color-brand-500)]"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="ddd"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    DDD
                                </label>

                                <input
                                    id="ddd"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={2}
                                    value={ddd}
                                    onChange={(e) =>
                                        setDdd(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[var(--color-brand-500)]"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="telefone"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Telefone
                                </label>

                                <input
                                    id="telefone"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={9}
                                    value={telefone}
                                    onChange={(e) =>
                                        setTelefone(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-[var(--color-brand-500)]"
                                />
                            </div>
                        </div>

                        {erro && (
                            <p className="mt-4 text-sm font-medium text-red-600">
                                {erro}
                            </p>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={onFechar}
                                disabled={carregando}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={solicitarConfirmacao}
                                disabled={carregando}
                                className="flex-1 rounded-lg bg-[var(--color-button-primary)] px-4 py-3 font-medium text-[var(--color-text-inverse)] hover:brightness-110"
                            >
                                Concluir
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="mb-4 text-2xl font-bold text-gray-800">
                            Confirmar alteração
                        </h2>

                        <p className="text-gray-700">
                            Tem certeza de que deseja atualizar os
                            dados da sua conta?
                        </p>

                        <div className="mt-6 rounded-lg bg-gray-100 p-4 text-sm text-gray-700">
                            <p>
                                <strong>Nome:</strong> {nome}
                            </p>

                            <p>
                                <strong>Telefone:</strong> ({ddd}){" "}
                                {telefone}
                            </p>
                        </div>

                        {erro && (
                            <p className="mt-4 text-sm font-medium text-red-600">
                                {erro}
                            </p>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmando(false)}
                                disabled={carregando}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Voltar
                            </button>

                            <button
                                type="button"
                                onClick={atualizarConta}
                                disabled={carregando}
                                className="flex-1 rounded-lg bg-[var(--color-button-primary)] px-4 py-3 font-medium text-[var(--color-text-inverse)] hover:brightness-110"
                            >
                                {carregando
                                    ? "Atualizando..."
                                    : "Sim, atualizar"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
