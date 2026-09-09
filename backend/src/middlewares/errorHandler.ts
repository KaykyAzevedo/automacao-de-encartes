import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";

import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

const MENSAGENS_MULTER: Record<string, string> = {
  LIMIT_FILE_SIZE: "Arquivo maior que o limite permitido (8 MB)",
  LIMIT_UNEXPECTED_FILE: "Tipo de arquivo não permitido (use PNG, JPG ou WEBP)",
};

export function errorHandler(
  err: unknown,
  req: Request,
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
    // erro esperado (404, 401...), nao um bug - fica em debug pra nao
    // afogar o log de erro real com "empresa nao encontrada" etc
    (req.log ?? logger).debug({ status: err.status }, err.message);
    return res.status(err.status).json({ error: err.message });
  }

  // body-parser lanca um erro proprio (nao AppError) quando o corpo
  // nao e JSON valido, com status/statusCode=400 anexado ao objeto.
  // Sem este bloco, um JSON malformado do cliente virava 500 generico.
  if (
    err instanceof Error &&
    "type" in err &&
    err.type === "entity.parse.failed"
  ) {
    return res
      .status(400)
      .json({ error: "JSON inválido no corpo da requisição" });
  }

  // so chega aqui um bug de verdade (nao previsto pelos casos acima) -
  // esse sim precisa aparecer com destaque no log
  (req.log ?? logger).error({ err }, "Erro não tratado");
  return res.status(500).json({ error: "Erro interno do servidor" });
}

export function notFoundHandler(req: Request, res: Response) {
  res
    .status(404)
    .json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
}
