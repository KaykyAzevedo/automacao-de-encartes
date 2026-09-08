import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";
import { naoAutenticado } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { usuarioLocal } from "../lib/usuarioLocal";

// O NextAuth grava a sessao no banco (tabela Session) e envia o token
// por cookie. O backend valida lendo esse mesmo registro, sem precisar
// repetir a logica de token.
const COOKIES_DE_SESSAO = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: { id: string; email: string; name: string | null };
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    if (env.modoAuth === "local") {
      const user = await usuarioLocal();
      req.usuario = { id: user.id, email: user.email, name: user.name };
      return next();
    }

    const token = COOKIES_DE_SESSAO.map((c) => req.cookies?.[c]).find(Boolean);
    if (!token) throw naoAutenticado();

    const sessao = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!sessao) throw naoAutenticado();

    if (sessao.expires < new Date()) {
      await prisma.session.delete({ where: { sessionToken: token } });
      throw naoAutenticado();
    }

    req.usuario = {
      id: sessao.user.id,
      email: sessao.user.email,
      name: sessao.user.name,
    };
    next();
  } catch (e) {
    next(e);
  }
}
