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
    const dataAtual = new Date();
    const inicioDoDia = new Date(
      Date.UTC(
        dataAtual.getFullYear(),
        dataAtual.getMonth(),
        dataAtual.getDate(),
      ),
    );

    const resultado = await db.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id_freq
        FROM frequentador
        WHERE id_freq = ${fkFrequentador}
        FOR UPDATE
      `;

      // Validação: Verifica se o frequentador possui multas ativas
      const multasAtivas = await tx.multa.count({
        where: {
          fk_frequentador_id_frequentador: fkFrequentador,
          inativo_multa: false,
          dta_termino_multa: { gt: inicioDoDia },
        },
      });

      if (multasAtivas > 0) {
        return { tipo: "multa-ativa" as const };
      }

      const emprestimosAtivos = await tx.emprestimo.count({
        where: {
          fk_frequentador_id_freq: fkFrequentador,
          inativo_emprestimo: false,
          dta_devolucao_real: null,
        },
      });

      if (emprestimosAtivos >= 2) {
        return { tipo: "limite-atingido" as const };
      }

      const exemplarAtualizado = await tx.exemplar.updateMany({
        where: {
          id_exemplar: exemplar.id_exemplar,
          inativo_exemplar: false,
          status_exemplar: "Dispon_vel",
        },
        data: { status_exemplar: "Em_posse" },
      });

      if (exemplarAtualizado.count === 0) {
        return { tipo: "exemplar-indisponivel" as const };
      }

      const novoEmprestimo = await tx.emprestimo.create({
        data: {
          dta_emprestimo: dataEmprestimo,
          dta_devolucao: dataDevolucao,
          fk_bibliotecario_id_bibliotecario: bibliotecarioId,
          fk_exemplar_id_exemplar: exemplar.id_exemplar,
          fk_frequentador_id_freq: fkFrequentador,
        },
      });

      return { tipo: "criado" as const, emprestimo: novoEmprestimo };
    });

    if (resultado.tipo === "multa-ativa") {
      return NextResponse.json(
        {
          error:
            "O frequentador possui uma multa ativa.",
        },
        { status: 409 },
      );
    }

    if (resultado.tipo === "limite-atingido") {
      return NextResponse.json(
        { error: "Cada frequentador pode ter no máximo 2 empréstimos ativos." },
        { status: 409 },
      );
    }

    if (resultado.tipo === "exemplar-indisponivel") {
      return NextResponse.json(
        { error: "Este exemplar não está mais disponível para empréstimo." },
        { status: 409 },
      );
    }

    revalidatePath("/bibliotecario/emprestimos");
    revalidatePath("/bibliotecario/acervo");
    revalidatePath(`/bibliotecario/acervo/${exemplar.fk_livro_id_livro}`);

    return NextResponse.json(
      { emprestimo: resultado.emprestimo },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar empréstimo:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar empréstimo." },
      { status: 500 },
    );
  }
}