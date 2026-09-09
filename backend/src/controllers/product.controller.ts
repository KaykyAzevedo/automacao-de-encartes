import type { NextFunction, Request, Response } from "express";

import { AppError, naoAutenticado } from "../lib/errors";
import {
  atualizarProductSchema,
  criarProductSchema,
  listarProductsQuerySchema,
  productIdSchema,
  searchProductsQuerySchema,
  uploadPhotoSchema,
} from "../schemas/product.schema";
import { matchProductSchema } from "../schemas/productMatch.schema";
import { productMatchService } from "../services/productMatchService";
import { productService } from "../services/product.service";
import { storageService } from "../services/storage.service";

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

  async match(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const { companyId, productName } = matchProductSchema.parse(req.body);
      res.json(
        await productMatchService.findProductByName(
          usuario.id,
          companyId,
          productName
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

  async uploadFoto(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      if (!req.file) {
        throw new AppError(400, "Nenhum arquivo enviado (campo 'file')");
      }
      const { productId } = uploadPhotoSchema.parse(req.body);
      const url = await storageService.salvar(
        req.file.buffer,
        req.file.mimetype
      );
      const produto = await productService.adicionarFotoUsuario(
        usuario.id,
        productId,
        url
      );
      res.status(201).json(produto);
    } catch (e) {
      next(e);
    }
  },
};
