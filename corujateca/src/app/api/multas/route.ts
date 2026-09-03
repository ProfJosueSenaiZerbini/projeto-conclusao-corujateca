import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { db } from "@/app/db";

function formatarData(data: Date | string | null) {
  if (!data) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(data));
}

function obterDataAtual() {
  const dataAtual = new Date();
  return new Date(
    Date.UTC(
      dataAtual.getFullYear(),
      dataAtual.getMonth(),
      dataAtual.getDate(),
    ),
  );
}

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const usuario = searchParams.get("usuario")?.trim();
    const data = searchParams.get("data");

    const dataInicio = data ? new Date(`${data}T00:00:00.000Z`) : undefined;
    const dataFim = data ? new Date(`${data}T23:59:59.999Z`) : undefined;

    const [multas, frequentadores, bibliotecarios] = await Promise.all([
      db.multa.findMany({
      where: {
        inativo_multa: false,
        ...(usuario
          ? { frequentador: { nome_freq: { contains: usuario, mode: "insensitive" } } }
          : {}),
        ...(dataInicio && dataFim
          ? { dta_inicio_multa: { gte: dataInicio, lte: dataFim } }
          : {}),
      },
      include: { frequentador: true },
      orderBy: { dta_inicio_multa: "desc" },
      }),
      db.frequentador.findMany({
        where: { inativo_freq: false },
        select: { id_freq: true, nome_freq: true },
        orderBy: { nome_freq: "asc" },
      }),
      db.bibliotecario.findMany({
        where: { inativo_bibliotecario: false },
        select: { id_bibliotecario: true, nome_bibliotecario: true },
        orderBy: { nome_bibliotecario: "asc" },
      }),
    ]);

    const multasFormatadas = multas.map((multa) => ({
      id: multa.id_multa,
      usuario: multa.frequentador.nome_freq,
      diasPunicao: Math.max(
        1,
        Math.ceil(
          (new Date(multa.dta_termino_multa).getTime() -
            new Date(multa.dta_inicio_multa).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ),
      status: multa.inativo_multa ? "Cancelada" : "Pendente",
      tipo: multa.tipomulta,
      data: formatarData(multa.dta_inicio_multa),
    }));

    const contarPorTipo = (tipo: string) =>
      multas.filter((multa) => multa.tipomulta.toUpperCase() === tipo).length;

    return NextResponse.json({
      multas: multasFormatadas,
      frequentadores,
      bibliotecarios,
      tipos: ["ATRASO", "DEPREDAÇÃO", "EXTRAVIO"],
      totais: {
        atraso: contarPorTipo("ATRASO"),
        depredacao: contarPorTipo("DEPREDAÇÃO"),
        extravio: contarPorTipo("EXTRAVIO"),
      },
    });
  } catch (error) {
    console.error("Erro ao consultar multas:", error);
    return NextResponse.json(
      { erro: "Erro ao carregar as multas." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const idMulta = Number(body.id_multa);

    if (!idMulta) {
      return NextResponse.json(
        { erro: "O id da multa é obrigatório." },
        { status: 400 },
      );
    }

    const multa = await db.multa.findUnique({ where: { id_multa: idMulta } });

    if (!multa) {
      return NextResponse.json({ erro: "Multa não encontrada." }, { status: 404 });
    }

    await db.$transaction([
      db.multa.update({
        where: { id_multa: idMulta },
        data: { inativo_multa: true },
      }),
      db.frequentador.update({
        where: { id_freq: multa.fk_frequentador_id_frequentador },
        data: { suspensao_freq: false },
      }),
    ]);

    revalidatePath("/bibliotecario/multas");

    return NextResponse.json({ mensagem: "Multa cancelada com sucesso." });
  } catch (error) {
    console.error("Erro ao cancelar multa:", error);
    return NextResponse.json(
      { erro: "Erro ao cancelar a multa." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (!text) {
      return NextResponse.json(
        { erro: 'O corpo da requisição está vazio. Envie um JSON válido.' },
        { status: 400 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(text) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { erro: "O corpo da requisição deve ser um JSON válido." },
        { status: 400 },
      );
    }

    const {
      dta_termino_multa,
      tipomulta,
      fk_bibliotecario_id_bibliotecario,
      fk_frequentador_id_frequentador,
    } = body;

    const tiposPermitidos = ["ATRASO", "DEPREDAÇÃO", "EXTRAVIO"];
    const tipoTratado = String(tipomulta || "").trim().toUpperCase();
    const inicio = obterDataAtual();
    const terminoInformado = new Date(String(dta_termino_multa));
    const bibliotecarioId = Number(fk_bibliotecario_id_bibliotecario);
    const frequentadorId = Number(fk_frequentador_id_frequentador);
    const prazoAutomatico =
      tipoTratado === "DEPREDAÇÃO"
        ? 15
        : tipoTratado === "EXTRAVIO"
          ? 30
          : undefined;
    const termino = prazoAutomatico
      ? new Date(inicio.getTime() + prazoAutomatico * 24 * 60 * 60 * 1000)
      : terminoInformado;

    if (
      !tiposPermitidos.includes(tipoTratado) ||
      (tipoTratado === "ATRASO" &&
        (!dta_termino_multa || Number.isNaN(terminoInformado.getTime()))) ||
      !Number.isInteger(bibliotecarioId) ||
      bibliotecarioId <= 0 ||
      !Number.isInteger(frequentadorId) ||
      frequentadorId <= 0 ||
      termino < inicio
    ) {
      return NextResponse.json(
        { erro: "Informe dados válidos para a multa." },
        { status: 400 },
      );
    }

    const [novaMulta] = await db.$transaction([
      db.multa.create({
        data: {
          dta_inicio_multa: inicio,
          dta_termino_multa: termino,
          tipomulta: tipoTratado,
          fk_bibliotecario_id_bibliotecario: bibliotecarioId,
          fk_frequentador_id_frequentador: frequentadorId,
        },
      }),
      db.frequentador.update({
        where: { id_freq: frequentadorId },
        data: { suspensao_freq: true },
      }),
    ]);

    return NextResponse.json(
      { mensagem: 'Multa aplicada e frequentador suspenso com sucesso!', multa: novaMulta },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Erro ao cadastrar multa:', error);
    return NextResponse.json(
      {
        erro: 'Erro no servidor',
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}