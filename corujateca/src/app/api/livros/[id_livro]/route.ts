import { NextResponse } from 'next/server';
import { db } from '@/app/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id_livro: string }> }
) {
  try {
    const { id_livro } = await params;
    const idLivro = Number(id_livro);

    if (Number.isNaN(idLivro)) {
      return NextResponse.json(
        { erro: 'O ID do livro informado é inválido.' },
        { status: 400 }
      );
    }

    const livro = await db.livro.findUnique({
      where: {
        id_livro: idLivro,
      },
    });

    if (!livro) {
      return NextResponse.json(
        { erro: 'Livro não encontrado.' },
        { status: 404 }
      );
    }

    if (livro.inativo_livro) {
      return NextResponse.json(
        {
          erro: 'Este livro está inativo. Reative o livro antes de modificar suas informações.',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const dadosAtualizacao: {
      isbn?: string;
      titulo_livro?: string;
      autor_livro?: string;
      sinopse_livro?: string | null;
      editora_livro?: string;
      anopub_livro?: number;
      imgcapa_livro?: string | null;
      genero_livro?: string;
      localizacao_livro?: string | null;
    } = {};

    if (body.isbn !== undefined) {
      dadosAtualizacao.isbn = String(body.isbn).trim();
    }

    if (body.titulo_livro !== undefined) {
      dadosAtualizacao.titulo_livro = String(body.titulo_livro).trim();
    }

    if (body.autor_livro !== undefined) {
      dadosAtualizacao.autor_livro = String(body.autor_livro).trim();
    }

    if (body.sinopse_livro !== undefined) {
      dadosAtualizacao.sinopse_livro =
        body.sinopse_livro === null || String(body.sinopse_livro).trim() === ''
          ? null
          : String(body.sinopse_livro).trim();
    }

    if (body.editora_livro !== undefined) {
      dadosAtualizacao.editora_livro = String(body.editora_livro).trim();
    }

    if (body.anopub_livro !== undefined) {
      const ano = Number(body.anopub_livro);

      if (Number.isNaN(ano)) {
        return NextResponse.json(
          { erro: 'O ano de publicação informado é inválido.' },
          { status: 400 }
        );
      }

      dadosAtualizacao.anopub_livro = ano;
    }

    if (body.imgcapa_livro !== undefined) {
      dadosAtualizacao.imgcapa_livro =
        body.imgcapa_livro === null || String(body.imgcapa_livro).trim() === ''
          ? null
          : String(body.imgcapa_livro).trim();
    }

    if (body.genero_livro !== undefined) {
      dadosAtualizacao.genero_livro = String(body.genero_livro).trim();
    }

    if (body.localizacao_livro !== undefined) {
      dadosAtualizacao.localizacao_livro =
        body.localizacao_livro === null ||
        String(body.localizacao_livro).trim() === ''
          ? null
          : String(body.localizacao_livro).trim();
    }

    const livroAtualizado = await db.livro.update({
      where: {
        id_livro: idLivro,
      },
      data: dadosAtualizacao,
    });

    return NextResponse.json(
      {
        mensagem: 'Livro atualizado com sucesso!',
        livro: livroAtualizado,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar livro:', error);

    return NextResponse.json(
      { erro: 'Erro interno no servidor ao tentar atualizar o livro.' },
      { status: 500 }
    );
  }
}