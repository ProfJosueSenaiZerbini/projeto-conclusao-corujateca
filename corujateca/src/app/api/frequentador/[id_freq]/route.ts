import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id_freq: string }> }
) {
  try {
    const { id_freq } = await params;
    const idFreq = parseInt(id_freq, 10);

    if (isNaN(idFreq)) {
      return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
    }

    const queryText = `
      SELECT
        f.id_freq,
        f.nome_freq,
        f.inativo_freq,
        f.suspensao_freq,
        t.ddd_freq,
        t.numtel_freq,
        (
          SELECT COUNT(*)
          FROM emprestimo e
          WHERE e.fk_frequentador_id_freq = f.id_freq
            AND e.inativo_emprestimo = false
        ) AS total_emprestimos,
        (
          SELECT COUNT(*)
          FROM multa m
          WHERE m.fk_frequentador_id_frequentador = f.id_freq
            AND m.inativo_multa = false
        ) AS total_multas
      FROM frequentador f
      LEFT JOIN tel_freq t ON t.fk_frequentador_id_freq = f.id_freq
      WHERE f.id_freq = $1
    `;

    const result = await pool.query(queryText, [idFreq]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { erro: "Frequentador não encontrado." },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json(
      {
        id: user.id_freq,
        nome: user.nome_freq,
        inativo: user.inativo_freq,
        suspenso: user.suspensao_freq,
        ddd: user.ddd_freq || "",
        telefone: user.numtel_freq || "",
        totalEmprestimos: Number(user.total_emprestimos),
        totalMultas: Number(user.total_multas),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao buscar detalhes do frequentador:", error.message || error);
    return NextResponse.json(
      { erro: "Erro ao buscar os detalhes do frequentador." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id_freq: string }> }
) {
  const client = await pool.connect();

  try {
    const { id_freq } = await params;
    const idFreq = parseInt(id_freq, 10);

    if (isNaN(idFreq)) {
      return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
    }

    const body = await request.json();
    const { nome, ddd, telefone } = body;

    if (!nome || !nome.trim()) {
      return NextResponse.json(
        { erro: "O nome é obrigatório." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // 1. Atualiza Nome
    await client.query(
      `UPDATE frequentador 
       SET nome_freq = $1 
       WHERE id_freq = $2`,
      [nome, idFreq]
    );

    // 2. Atualiza Telefone
    if (ddd !== undefined && telefone !== undefined && ddd !== "" && telefone !== "") {
      const dddLimpo = String(ddd).replace(/\D/g, "");
      const telLimpo = String(telefone).replace(/\D/g, "");

      const checkTel = await client.query(
        `SELECT id_tel_freq FROM tel_freq WHERE fk_frequentador_id_freq = $1`,
        [idFreq]
      );

      if (checkTel.rows.length > 0) {
        await client.query(
          `UPDATE tel_freq 
           SET ddd_freq = $1, numtel_freq = $2 
           WHERE fk_frequentador_id_freq = $3`,
          [dddLimpo, telLimpo, idFreq]
        );
      } else {
        await client.query(
          `INSERT INTO tel_freq (ddd_freq, numtel_freq, fk_frequentador_id_freq) 
           VALUES ($1, $2, $3)`,
          [dddLimpo, telLimpo, idFreq]
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json(
      { mensagem: "Frequentador atualizado com sucesso!" },
      { status: 200 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("ERRO DETALHADO DO BANCO:", error.message || error);

    return NextResponse.json(
      { erro: `Erro ao atualizar no banco: ${error.message || "Erro desconhecido"}` },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
