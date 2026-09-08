import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/errors";
import { storageService } from "../services/storage.service";

export const uploadController = {
  async enviar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, "Nenhum arquivo enviado (campo 'file')");
      }
      const url = await storageService.salvar(
        req.file.buffer,
        req.file.mimetype
      );
      res.status(201).json({ url });
    } catch (e) {
      next(e);
    }
  },
};
