import bcrypt from "bcrypt";

import { db } from "@/app/db";
import type { UserRole, UserSession } from "@/lib/auth";

export async function comparePassword(inputPassword: string, storedPassword: string): Promise<boolean> {
  if (!storedPassword) {
    return false;
  }

  if (storedPassword.startsWith("$2")) {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  return inputPassword === storedPassword;
}

export async function authenticateUser(
  role: UserRole,
  id: number,
  password: string
): Promise<{ ok: true; user: UserSession } | { ok: false; message: string }> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "Código de identificação inválido." };
  }

  if (!password || password.trim().length === 0) {
    return { ok: false, message: "A senha é obrigatória." };
  }

  try {
    if (role === "bibliotecario") {
      const bibliotecario = await db.bibliotecario.findUnique({
        where: { id_bibliotecario: id },
      });

      if (!bibliotecario) {
        return { ok: false, message: "Bibliotecário não encontrado." };
      }

      if (bibliotecario.inativo_bibliotecario) {
        return { ok: false, message: "Este bibliotecário está inativo." };
      }

      const senhaCorreta = await comparePassword(password, bibliotecario.senha_bibliotecario);

      if (!senhaCorreta) {
        return { ok: false, message: "Senha incorreta." };
      }

      return {
        ok: true,
        user: {
          id: bibliotecario.id_bibliotecario,
          nome: bibliotecario.nome_bibliotecario,
          role: "bibliotecario",
        },
      };
    }

    const frequentador = await db.frequentador.findUnique({
      where: { id_freq: id },
    });

    if (!frequentador) {
      return { ok: false, message: "Frequentador não encontrado." };
    }

    if (frequentador.inativo_freq) {
      return { ok: false, message: "Este frequentador está inativo." };
    }

    const senhaCorreta = await comparePassword(password, frequentador.senha_freq);

    if (!senhaCorreta) {
      return { ok: false, message: "Senha incorreta." };
    }

    return {
      ok: true,
      user: {
        id: frequentador.id_freq,
        nome: frequentador.nome_freq,
        role: "frequentador",
      },
    };
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    return { ok: false, message: "Erro ao validar login no servidor." };
  }
}
