import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function GET() {
  try {
    // Busca apenas usuários ativos e ordena pelo nome correto
    const queryText = `
      SELECT id_freq, nome_freq, inativo_freq, suspensao_freq 
      FROM frequentador 
      WHERE inativo_freq = false 
      ORDER BY nome_freq ASC
    `;
    const result = await pool.query(queryText);

    // Mapeia para corresponder às propriedades esperadas no front (id e nome)
    const usuariosFormatados = result.rows.map((user) => ({
      id: user.id_freq,
      nome: user.nome_freq,
      inativo: user.inativo_freq,
      suspenso: user.suspensao_freq,
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
  try {
    const body = await request.json();
    const { nome, senha } = body;

    if (!nome) {
      return NextResponse.json(
        { erro: "O nome é obrigatório." },
        { status: 400 }
      );
    }

    // Insere utilizando as colunas do schema (nome_freq e senha_freq)
    const queryText = `
      INSERT INTO frequentador (nome_freq, senha_freq) 
      VALUES ($1, $2) 
      RETURNING id_freq, nome_freq
    `;
    
    // Define uma senha padrão caso o front-end não envie uma no cadastro rápido
    const senhaFinal = senha || "123456"; 

    const result = await pool.query(queryText, [nome, senhaFinal]);
    const novoUsuario = result.rows[0];

    return NextResponse.json(
      {
        id: novoUsuario.id_freq,
        nome: novoUsuario.nome_freq,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar frequentador:", error);
    return NextResponse.json(
      { erro: "Erro ao cadastrar frequentador no banco de dados." },
      { status: 500 }
    );
  }
}