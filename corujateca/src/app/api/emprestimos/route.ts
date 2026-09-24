import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { db } from "@/app/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fkFrequentador = Number(body.fk_frequentador_id_freq);
    const idEnviado = Number(body.fk_exemplar_id_exemplar);
    const prazoDias = Number(body.prazo_dias);
    const senhaInformada =
      typeof body.senha === "string" ? body.senha.trim() : "";
    
    let bibliotecarioId = Number(body.fk_bibliotecario_id_bibliotecario);

    if (!fkFrequentador) {
      return NextResponse.json({ error: "Selecione o frequentador." }, { status: 400 });
    }

    if (!idEnviado) {
      return NextResponse.json({ error: "Selecione o exemplar." }, { status: 400 });
    }

    if (!senhaInformada) {
      return NextResponse.json({ error: "Informe a senha do frequentador." }, { status: 400 });
    }

    if (!Number.isInteger(prazoDias) || prazoDias <= 0) {
      return NextResponse.json(
        { error: "Informe a quantidade de dias do empréstimo." },
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

    const senhaValida = await bcrypt.compare(senhaInformada, frequentador.senha_freq);

    if (!senhaValida) {
      return NextResponse.json(
        { error: "Senha incorreta." },
        { status: 401 },
      );
    }

    let exemplar = await db.exemplar.findFirst({
      where: {
        id_exemplar: idEnviado,
        inativo_exemplar: false,
        status_exemplar: "Dispon_vel",
      },
      include: { livro: true },
    });

    if (!exemplar) {
      exemplar = await db.exemplar.findFirst({
        where: {
          fk_livro_id_livro: idEnviado,
          inativo_exemplar: false,
          status_exemplar: "Dispon_vel",
        },
        include: { livro: true },
      });
    }

    if (!exemplar) {
      return NextResponse.json(
        { error: "Não há cópias disponíveis deste livro para empréstimo no momento." },
        { status: 409 },
      );
    }

    if (!bibliotecarioId || isNaN(bibliotecarioId)) {
      bibliotecarioId = 7;
    }

    const dataEmprestimo = new Date();
    const dataDevolucao = new Date(dataEmprestimo);
    dataDevolucao.setDate(dataEmprestimo.getDate() + prazoDias);

    // Transação limpa apenas com as tabelas reais do seu schema
    const [novoEmprestimo] = await db.$transaction([
      db.emprestimo.create({
        data: {
          dta_emprestimo: dataEmprestimo,
          dta_devolucao: dataDevolucao,
          fk_bibliotecario_id_bibliotecario: bibliotecarioId,
          fk_exemplar_id_exemplar: exemplar.id_exemplar,
          fk_frequentador_id_freq: fkFrequentador,
        },
      }),
      db.exemplar.update({
        where: { id_exemplar: exemplar.id_exemplar },
        data: { status_exemplar: "Em_posse" },
      }),
    ]);

    revalidatePath("/bibliotecario/emprestimos");
    revalidatePath("/bibliotecario/acervo");
    revalidatePath(`/bibliotecario/acervo/${exemplar.fk_livro_id_livro}`);

    return NextResponse.json({ emprestimo: novoEmprestimo }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar empréstimo:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar empréstimo." },
      { status: 500 },
    );
  }
}