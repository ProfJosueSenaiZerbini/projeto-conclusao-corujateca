// isso é provisório, é apenas para testes! quando o banco estiver conectado apague esta parte, ou apenas ajuste. isso é um código mockado apenas para testes

import { NextResponse } from "next/server";

export async function GET() {
  // Dados provisórios para o front-end carregar a tela normalmente
  const usuariosProvisorios = [
    { id: 1, nome: "Maria Luiza" },
    { id: 2, nome: "Stephanny Borrozzino" },
    { id: 3, nome: "Rogério Malto" },
    { id: 4, nome: "Enzo Barbino" },
    { id: 5, nome: "Alexandra Pereira" },
  ];

  return NextResponse.json(usuariosProvisorios, { status: 200 });
}
