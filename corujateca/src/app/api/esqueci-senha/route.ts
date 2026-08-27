import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const { senhaMaster, codigoIdentificacaoUsuario, novaSenhaUsuario } = body;

    // 1. Validação dos campos do formulário
    if (!senhaMaster) {
      return NextResponse.json(
        { erro: "A senha master é obrigatória." },
        { status: 400 }
      );
    }

    // Validação restrita APENAS pela variável de ambiente do .env
    const senhaMasterEnv = process.env.MASTER_SECRET;

    if (!senhaMasterEnv) {
      console.error("ERRO: A variável MASTER_SECRET não está configurada no arquivo .env");
      return NextResponse.json(
        { erro: "Configuração do servidor pendente. Contate o administrador." },
        { status: 500 }
      );
    }

    if (senhaMaster !== senhaMasterEnv) {
      return NextResponse.json(
        { erro: "Senha master incorreta." },
        { status: 401 }
      );
    }

    if (!codigoIdentificacaoUsuario || isNaN(Number(codigoIdentificacaoUsuario))) {
      return NextResponse.json(
        { erro: "Código de identificação (ID) inválido." },
        { status: 400 }
      );
    }

    if (!novaSenhaUsuario || novaSenhaUsuario.trim().length < 6) {
      return NextResponse.json(
        { erro: "A nova senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // 2. Atualiza a senha do bibliotecário pelo ID (id_bibliotecario)
    const queryUpdate = `
      UPDATE bibliotecario 
      SET senha_bibliotecario = $1 
      WHERE id_bibliotecario = $2 AND inativo_bibliotecario = false
      RETURNING id_bibliotecario
    `;

    const res = await client.query(queryUpdate, [
      novaSenhaUsuario.trim(),
      Number(codigoIdentificacaoUsuario),
    ]);

    if (res.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { erro: "Bibliotecário não encontrado ou inativo." },
        { status: 404 }
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      { mensagem: "Senha redefinida com sucesso!" },
      { status: 200 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Erro ao redefinir senha:", error?.message || error);
    return NextResponse.json(
      { erro: `Erro no servidor: ${error?.message || "Consulte os logs"}` },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}