import type { NextFunction, Request, Response } from "express";

import { naoAutenticado } from "../lib/errors";
import {
  atualizarCompanySchema,
  companyIdSchema,
  criarCompanySchema,
} from "../schemas/company.schema";
import { companyService } from "../services/company.service";

function usuarioDe(req: Request) {
  if (!req.usuario) throw naoAutenticado();
  return req.usuario;
}

export const companyController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const dados = criarCompanySchema.parse(req.body);
      const company = await companyService.criar(usuario.id, dados);
      res.status(201).json(company);
    } catch (e) {
      next(e);
    }
  },

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      res.json(await companyService.listar(usuario.id));
    } catch (e) {
      next(e);
    }
  },

  async buscar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = companyIdSchema.parse(req.params);
      res.json(await companyService.buscar(usuario.id, id));
    } catch (e) {
      next(e);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = companyIdSchema.parse(req.params);
      const dados = atualizarCompanySchema.parse(req.body);
      res.json(await companyService.atualizar(usuario.id, id, dados));
    } catch (e) {
      next(e);
    }
  },

  async remover(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = companyIdSchema.parse(req.params);
      await companyService.remover(usuario.id, id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};
