import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { db } from "@/app/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fkFrequentador = Number(body.fk_frequentador_id_freq);
    const fkExemplar = Number(body.fk_exemplar_id_exemplar);
    const prazoDias = Number(body.prazo_dias) || 7;

    if (!fkFrequentador || !fkExemplar) {
      return NextResponse.json(
        { error: "Frequentador e exemplar são obrigatórios." },
        { status: 400 },
      );
    }

    const frequentador = await db.frequentador.findUnique({
      where: { id_freq: fkFrequentador },
    });

    if (!frequentador) {
      return NextResponse.json(
        { error: "Frequentador não encontrado." },
        { status: 404 },
      );
    }

    const exemplar = await db.exemplar.findUnique({
      where: { id_exemplar: fkExemplar },
      include: { livro: true },
    });

    if (
      !exemplar ||
      exemplar.inativo_exemplar ||
      exemplar.status_exemplar !== "Dispon_vel"
    ) {
      return NextResponse.json(
        { error: "Este exemplar não está disponível para empréstimo." },
        { status: 409 },
      );
    }

    const bibliotecario = await db.bibliotecario.findFirst({
      where: { inativo_bibliotecario: false },
    });

    if (!bibliotecario) {
      return NextResponse.json(
        { error: "Nenhum bibliotecário ativo encontrado." },
        { status: 404 },
      );
    }

    const dataEmprestimo = new Date();
    const dataDevolucao = new Date(dataEmprestimo);
    dataDevolucao.setDate(dataEmprestimo.getDate() + prazoDias);

    // Criação do empréstimo e atualização do status do exemplar acontecem
    // dentro de uma transação para evitar que dois pedidos simultâneos
    // "peguem" o mesmo exemplar antes que o status seja atualizado.
    const [novoEmprestimo] = await db.$transaction([
      db.emprestimo.create({
        data: {
          dta_emprestimo: dataEmprestimo,
          dta_devolucao: dataDevolucao,
          fk_bibliotecario_id_bibliotecario: bibliotecario.id_bibliotecario,
          fk_exemplar_id_exemplar: fkExemplar,
          fk_frequentador_id_freq: fkFrequentador,
        },
      }),
      db.exemplar.update({
        where: { id_exemplar: fkExemplar },
        data: { status_exemplar: "Em_posse" },
      }),
    ]);

    revalidatePath("/bibliotecario/emprestimos");

    return NextResponse.json({ emprestimo: novoEmprestimo }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar empréstimo:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar empréstimo." },
      { status: 500 },
    );
  }
}
