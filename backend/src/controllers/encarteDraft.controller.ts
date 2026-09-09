import type { NextFunction, Request, Response } from "express";

import { naoAutenticado } from "../lib/errors";
import {
  atualizarEncarteDraftSchema,
  criarEncarteDraftSchema,
  encarteDraftIdSchema,
  listarEncarteDraftQuerySchema,
} from "../schemas/encarteDraft.schema";
import { encarteDraftService } from "../services/encarteDraft.service";

function usuarioDe(req: Request) {
  if (!req.usuario) throw naoAutenticado();
  return req.usuario;
}

export const encarteDraftController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const dados = criarEncarteDraftSchema.parse(req.body);
      const draft = await encarteDraftService.criar(usuario.id, dados);
      res.status(201).json(draft);
    } catch (e) {
      next(e);
    }
  },

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { companyId } = listarEncarteDraftQuerySchema.parse(req.query);
      res.json(await encarteDraftService.listar(usuario.id, companyId));
    } catch (e) {
      next(e);
    }
  },

  async buscar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = encarteDraftIdSchema.parse(req.params);
      res.json(await encarteDraftService.buscar(usuario.id, id));
    } catch (e) {
      next(e);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = encarteDraftIdSchema.parse(req.params);
      const dados = atualizarEncarteDraftSchema.parse(req.body);
      res.json(await encarteDraftService.atualizar(usuario.id, id, dados));
    } catch (e) {
      next(e);
    }
  },

  async remover(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = encarteDraftIdSchema.parse(req.params);
      await encarteDraftService.remover(usuario.id, id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};
