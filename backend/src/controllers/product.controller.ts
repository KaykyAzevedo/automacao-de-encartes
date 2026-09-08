import type { NextFunction, Request, Response } from "express";

import { naoAutenticado } from "../lib/errors";
import {
  atualizarProductSchema,
  criarProductSchema,
  listarProductsQuerySchema,
  productIdSchema,
  searchProductsQuerySchema,
} from "../schemas/product.schema";
import { productService } from "../services/product.service";

function usuarioDe(req: Request) {
  if (!req.usuario) throw naoAutenticado();
  return req.usuario;
}

export const productController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const dados = criarProductSchema.parse(req.body);
      res.status(201).json(await productService.criar(usuario.id, dados));
    } catch (e) {
      next(e);
    }
  },

  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const filtros = listarProductsQuerySchema.parse(req.query);
      res.json(await productService.listar(usuario.id, filtros));
    } catch (e) {
      next(e);
    }
  },

  async buscar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { companyId, query, limit } = searchProductsQuerySchema.parse(
        req.query
      );
      res.json(
        await productService.buscarSimilares(
          usuario.id,
          companyId,
          query,
          limit
        )
      );
    } catch (e) {
      next(e);
    }
  },

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = productIdSchema.parse(req.params);
      const dados = atualizarProductSchema.parse(req.body);
      res.json(await productService.atualizar(usuario.id, id, dados));
    } catch (e) {
      next(e);
    }
  },

  async remover(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { id } = productIdSchema.parse(req.params);
      await productService.remover(usuario.id, id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },
};
