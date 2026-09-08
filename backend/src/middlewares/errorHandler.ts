import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";

import { AppError } from "../lib/errors";

const MENSAGENS_MULTER: Record<string, string> = {
  LIMIT_FILE_SIZE: "Arquivo maior que o limite permitido (8 MB)",
  LIMIT_UNEXPECTED_FILE: "Tipo de arquivo não permitido (use PNG, JPG ou WEBP)",
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Dados inválidos",
      details: err.issues.map((i) => ({
        campo: i.path.join(".") || "(raiz)",
        mensagem: i.message,
      })),
    });
  }

  if (err instanceof MulterError) {
    return res
      .status(400)
      .json({ error: MENSAGENS_MULTER[err.code] ?? err.message });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Erro interno do servidor" });
}

export function notFoundHandler(req: Request, res: Response) {
  res
    .status(404)
    .json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
}
