import type { NextFunction, Request, Response } from "express";

import { naoAutenticado } from "../lib/errors";
import {
  atualizarThemeSchema,
  companyIdParamSchema,
  criarThemeSchema,
  themeIdSchema,
} from "../schemas/theme.schema";
import { themeService } from "../services/theme.service";

function usuarioDe(req: Request) {
  if (!req.usuario) throw naoAutenticado();
  return req.usuario;
}

export const themeController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const dados = criarThemeSchema.parse(req.body);
      const tema = await themeService.criar(usuario.id, dados);
      res.status(201).json(tema);
    } catch (e) {
      next(e);
    }
  },

  async listarPorEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { companyId } = companyIdParamSchema.parse(req.params);
      res.json(await themeService.listarPorEmpresa(usuario.id, companyId));
    } catch (e) {
      next(e);
    }
  },

  async buscar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = themeIdSchema.parse(req.params);
      res.json(await themeService.buscar(usuario.id, id));
    } catch (e) {
      next(e);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = themeIdSchema.parse(req.params);
      const dados = atualizarThemeSchema.parse(req.body);
      res.json(await themeService.atualizar(usuario.id, id, dados));
    } catch (e) {
      next(e);
    }
  },

  async remover(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = themeIdSchema.parse(req.params);
      await themeService.remover(usuario.id, id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};
