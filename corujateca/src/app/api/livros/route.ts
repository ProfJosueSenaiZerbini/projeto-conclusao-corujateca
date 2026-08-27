import { NextResponse } from 'next/server';
import { db } from '@/app/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const titulo = searchParams.get('titulo');
    const genero = searchParams.get('genero');
    const autor = searchParams.get('autor');
    const ano = searchParams.get('ano');

    const livros = await db.livro.findMany({
      where: {
        inativo_livro: false,

        ...(titulo && {
          titulo_livro: {
            contains: titulo,
            mode: 'insensitive',
          },
        }),

        ...(genero && {
          genero_livro: {
            contains: genero,
            mode: 'insensitive',
          },
        }),

        ...(autor && {
          autor_livro: {
            contains: autor,
            mode: 'insensitive',
          },
        }),

        ...(ano && {
          anopub_livro: Number(ano),
        }),
      },
    });

    return NextResponse.json(livros, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar livros:', error);

    return NextResponse.json(
      { erro: 'Erro interno ao buscar livros.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      isbn,
      titulo_livro,
      autor_livro,
      editora_livro,
      anopub_livro,
      genero_livro,
      localizacao_livro,
      imgcapa_livro,
      sinopse_livro,
    } = body;

    if (!isbn || !titulo_livro) {
      return NextResponse.json(
        { erro: 'O ISBN e o Título do livro são obrigatórios.' },
        { status: 400 }
      );
    }

    const valorOuNull = (val: any) =>
      val && String(val).trim() !== '' ? String(val).trim() : null;

    const novoLivro = await db.livro.create({
      data: {
        isbn: String(isbn).trim(),
        titulo_livro: String(titulo_livro).trim(),
        autor_livro: valorOuNull(autor_livro) ?? 'Autor Não Informado',
        editora_livro: valorOuNull(editora_livro) ?? 'Editora Não Informada',
        anopub_livro: Number(anopub_livro) || new Date().getFullYear(),
        genero_livro: valorOuNull(genero_livro) ?? 'Geral',
        localizacao_livro: valorOuNull(localizacao_livro),
        imgcapa_livro: valorOuNull(imgcapa_livro),
        sinopse_livro: valorOuNull(sinopse_livro),
      },
    });

    return NextResponse.json(
      { mensagem: 'Livro cadastrado com sucesso!', livro: novoLivro },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao cadastrar livro:', error);

    return NextResponse.json(
      { erro: 'Erro interno no servidor ao tentar salvar o livro.' },
      { status: 500 }
    );
  }
}