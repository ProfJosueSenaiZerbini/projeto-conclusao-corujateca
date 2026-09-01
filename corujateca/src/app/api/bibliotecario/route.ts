import { NextResponse } from "next/server";

import { db } from "@/app/db";

export async function GET() {
  try {
    const bibliotecarios = await db.bibliotecario.findMany({
      where: { inativo_bibliotecario: false },
      orderBy: { nome_bibliotecario: "asc" },
    });

    return NextResponse.json(bibliotecarios, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar bibliotecários:", error);
    return NextResponse.json(
      { erro: "Erro ao buscar bibliotecários no banco de dados." },
      { status: 500 }
    );
  }
}
