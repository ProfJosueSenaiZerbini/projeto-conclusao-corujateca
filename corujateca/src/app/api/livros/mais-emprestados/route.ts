import { NextResponse } from "next/server";
import { db } from "@/app/db";

function obterInicioDaSemana() {
  const agora = new Date();

  const diaDaSemana = agora.getDay();

  const inicio = new Date(agora);

  inicio.setDate(agora.getDate() - diaDaSemana);
  inicio.setHours(0, 0, 0, 0);

  return inicio;
}

function obterFimDaSemana() {
  const inicio = obterInicioDaSemana();

  const fim = new Date(inicio);

  fim.setDate(inicio.getDate() + 7);

  return fim;
}

export async function GET() {
  try {
    const inicioDaSemana = obterInicioDaSemana();
    const fimDaSemana = obterFimDaSemana();

    const emprestimos = await db.emprestimo.findMany({
      where: {
        inativo_emprestimo: false,

        dta_emprestimo: {
          gte: inicioDaSemana,
          lt: fimDaSemana,
        },

        dta_devolucao_real: {
          not: null,
        },
      },

      include: {
        exemplar: {
          include: {
            livro: true,
          },
        },
      },
    });

    const contagemPorLivro = new Map<
      number,
      {
        livro: (typeof emprestimos)[number]["exemplar"]["livro"];
        quantidade: number;
      }
    >();

    for (const emprestimo of emprestimos) {
      const livro = emprestimo.exemplar.livro;

      if (livro.inativo_livro) {
        continue;
      }

      const livroExistente = contagemPorLivro.get(livro.id_livro);

      if (livroExistente) {
        livroExistente.quantidade += 1;
      } else {
        contagemPorLivro.set(livro.id_livro, {
          livro,
          quantidade: 1,
        });
      }
    }

    const livrosMaisEmprestados = Array.from(
      contagemPorLivro.values(),
    )
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 12)
      .map((item) => item.livro);

    return NextResponse.json(
      {
        livros: livrosMaisEmprestados,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar livros mais emprestados:", error);

    return NextResponse.json(
      { erro: "Erro interno ao buscar livros mais emprestados." },
      { status: 500 },
    );
  }
}