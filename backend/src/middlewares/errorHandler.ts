import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../lib/errors";

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
