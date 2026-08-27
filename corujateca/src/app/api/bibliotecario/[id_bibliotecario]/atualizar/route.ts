import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id_bibliotecario: string }> }
) {
  const { id_bibliotecario } = await params;
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { nome, ddd, telefone } = body;

    // 1. Validação de ID e Nome
    if (!id_bibliotecario || isNaN(Number(id_bibliotecario))) {
      return NextResponse.json(
        { erro: "ID do bibliotecário inválido." },
        { status: 400 }
      );
    }

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return NextResponse.json(
        { erro: "O nome do bibliotecário é obrigatório." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // 2. Atualiza os dados na tabela 'bibliotecario'
    const queryBibliotecario = `
      UPDATE bibliotecario 
      SET nome_bibliotecario = $1 
      WHERE id_bibliotecario = $2 AND inativo_bibliotecario = false
      RETURNING id_bibliotecario, nome_bibliotecario
    `;

    const resBibliotecario = await client.query(queryBibliotecario, [
      nome.trim(),
      Number(id_bibliotecario),
    ]);

    if (resBibliotecario.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { erro: "Bibliotecário não encontrado ou inativo." },
        { status: 404 }
      );
    }

    // 3. Atualiza ou insere o telefone na tabela 'tel_bibliotecario'
    const dddLimpo = ddd ? String(ddd).replace(/\D/g, "") : "";
    const telLimpo = telefone ? String(telefone).replace(/\D/g, "") : "";

    if (dddLimpo && telLimpo) {
      const queryVerificaTel = `
        SELECT id_tel_bibliotecario FROM tel_bibliotecario 
        WHERE fk_bibliotecario_id_bibliotecario = $1
      `;
      const resTel = await client.query(queryVerificaTel, [Number(id_bibliotecario)]);

      if (resTel.rows.length > 0) {
        // Se já existe registro de telefone, atualiza
        const queryUpdateTel = `
          UPDATE tel_bibliotecario 
          SET ddd_bibliotecario = $1, numtel_bibliotecario = $2 
          WHERE fk_bibliotecario_id_bibliotecario = $3
        `;
        await client.query(queryUpdateTel, [
          dddLimpo,
          telLimpo,
          Number(id_bibliotecario),
        ]);
      } else {
        // Se não tinha telefone antes, insere
        const queryInsertTel = `
          INSERT INTO tel_bibliotecario (ddd_bibliotecario, numtel_bibliotecario, fk_bibliotecario_id_bibliotecario) 
          VALUES ($1, $2, $3)
        `;
        await client.query(queryInsertTel, [
          dddLimpo,
          telLimpo,
          Number(id_bibliotecario),
        ]);
      }
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        mensagem: "Bibliotecário atualizado com sucesso!",
        bibliotecario: resBibliotecario.rows[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Erro no servidor:", error?.message || error);
    return NextResponse.json(
      { erro: `Erro no banco de dados: ${error?.message || "Consulte o log do servidor"}` },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id_bibliotecario: string }> }
) {
  return PUT(request, context);
}