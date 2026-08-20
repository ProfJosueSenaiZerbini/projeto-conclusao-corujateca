import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcrypt"; // Import do bcrypt (ou 'bcryptjs' se preferir)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET() {
  try {
    // Traz o nome, status e também o telefone cadastrado (se houver) via LEFT JOIN
    const queryText = `
      SELECT 
        f.id_freq, 
        f.nome_freq, 
        f.inativo_freq, 
        f.suspensao_freq,
        t.ddd_freq,
        t.numtel_freq
      FROM frequentador f
      LEFT JOIN tel_freq t ON f.id_freq = t.fk_frequentador_id_freq
      WHERE f.inativo_freq = false 
      ORDER BY f.nome_freq ASC
    `;
    const result = await pool.query(queryText);

    const usuariosFormatados = result.rows.map((user) => ({
      id: user.id_freq,
      nome: user.nome_freq,
      inativo: user.inativo_freq,
      suspenso: user.suspensao_freq,
      telefone: user.numtel_freq ? `(${user.ddd_freq}) ${user.numtel_freq}` : null,
    }));

    return NextResponse.json(usuariosFormatados, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar frequentadores:", error);
    return NextResponse.json(
      { erro: "Erro ao buscar a lista de frequentadores no banco de dados." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Pega um cliente do pool para gerenciar a transação
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { nome, senha, ddd, telefone } = body;

    // Validação de campos obrigatórios
    if (!nome || !senha) {
      return NextResponse.json(
        { erro: "Nome e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Gerando o hash da senha usando o bcrypt com salt rounds = 10
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inicia a transação no banco
    await client.query("BEGIN");

    // 1. Insere na tabela 'frequentador' salvando o HASH da senha
    const queryFrequentador = `
      INSERT INTO frequentador (nome_freq, senha_freq) 
      VALUES ($1, $2) 
      RETURNING id_freq, nome_freq
    `;
    const resFrequentador = await client.query(queryFrequentador, [nome, senhaHash]);
    const novoUsuario = resFrequentador.rows[0];

    // 2. Insere na tabela 'tel_freq' caso ddd e telefone tenham sido enviados
    if (ddd && telefone) {
      const queryTelefone = `
        INSERT INTO tel_freq (ddd_freq, numtel_freq, fk_frequentador_id_freq) 
        VALUES ($1, $2, $3)
      `;
      await client.query(queryTelefone, [ddd, telefone, novoUsuario.id_freq]);
    }

    // Confirma as duas inserções
    await client.query("COMMIT");

    return NextResponse.json(
      {
        id: novoUsuario.id_freq,
        nome: novoUsuario.nome_freq,
      },
      { status: 201 }
    );
  } catch (error) {
    // Se der qualquer erro, desfaz a inserção do usuário
    await client.query("ROLLBACK");
    console.error("Erro ao cadastrar frequentador:", error);
    return NextResponse.json(
      { erro: "Erro ao cadastrar frequentador no banco de dados." },
      { status: 500 }
    );
  } finally {
    // Libera a conexão de volta para o pool
    client.release();
  }

  
}

