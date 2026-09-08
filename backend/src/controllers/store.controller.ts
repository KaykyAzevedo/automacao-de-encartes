import type { NextFunction, Request, Response } from "express";

import { naoAutenticado } from "../lib/errors";
import {
  atualizarStoreSchema,
  companyIdParamSchema,
  criarStoreSchema,
  storeIdSchema,
} from "../schemas/store.schema";
import { storeService } from "../services/store.service";

function usuarioDe(req: Request) {
  if (!req.usuario) throw naoAutenticado();
  return req.usuario;
}

export const storeController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const dados = criarStoreSchema.parse(req.body);
      const store = await storeService.criar(usuario.id, dados);
      res.status(201).json(store);
    } catch (e) {
      next(e);
    }
  },

  async listarPorEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { companyId } = companyIdParamSchema.parse(req.params);
      res.json(await storeService.listarPorEmpresa(usuario.id, companyId));
    } catch (e) {
      next(e);
    }
  },

  async buscar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = storeIdSchema.parse(req.params);
      res.json(await storeService.buscar(usuario.id, id));
    } catch (e) {
      next(e);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = storeIdSchema.parse(req.params);
      const dados = atualizarStoreSchema.parse(req.body);
      res.json(await storeService.atualizar(usuario.id, id, dados));
    } catch (e) {
      next(e);
    }
  },

  async remover(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = storeIdSchema.parse(req.params);
      await storeService.remover(usuario.id, id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};
