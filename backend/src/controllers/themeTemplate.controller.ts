import type { NextFunction, Request, Response } from "express";

import { AppError, naoAutenticado } from "../lib/errors";
import {
  formatoMaisProximo,
  montarSvgComFundo,
  type FormatoTemplate,
} from "../lib/temaTemplate";
import { importarTemplateSchema } from "../schemas/themeTemplate.schema";
import { storageService } from "../services/storage.service";
import { themeService } from "../services/theme.service";

function usuarioDe(req: Request) {
  if (!req.usuario) throw naoAutenticado();
  return req.usuario;
}

// campo do multipart -> formato correspondente (só os 4 pedidos na
// Etapa 25; 2 e 6 ficam de fora até chegar arte própria pra eles)
const CAMPO_POR_FORMATO: Record<string, FormatoTemplate> = {
  format1: 1,
  format4: 4,
  format8: 8,
  format10: 10,
};

export const themeTemplateController = {
  // POST /api/themes/import-png - recebe até 4 PNGs (um por formato) +
  // companyId/themeName/day, sobe cada um via storageService, monta o
  // SVG (fundo + grade de placeholders) e cria o Theme. Formatos que
  // faltarem (incluindo 2 e 6, fora do pedido original) reaproveitam a
  // arte do formato já enviado mais próximo, senão o Theme fica
  // inválido (o schema exige os 6).
  async importar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req);
      const dados = importarTemplateSchema.parse(req.body);

      const arquivos = req.files as
        Record<string, Express.Multer.File[]> | undefined;
      const campos = Object.keys(CAMPO_POR_FORMATO).filter(
        (campo) => arquivos?.[campo]?.[0]
      );

      if (campos.length === 0) {
        throw new AppError(
          400,
          "Envie ao menos um PNG (campos format1, format4, format8 ou format10)"
        );
      }

      const svgPorFormato: Partial<Record<FormatoTemplate, string>> = {};
      for (const campo of campos) {
        const formato = CAMPO_POR_FORMATO[campo];
        const arquivo = arquivos![campo][0];
        const url = await storageService.salvar(
          arquivo.buffer,
          arquivo.mimetype
        );
        svgPorFormato[formato] = montarSvgComFundo(url, formato);
      }

      const disponiveis = campos.map((c) => CAMPO_POR_FORMATO[c]);
      const formatoDe = (alvo: FormatoTemplate): string => {
        if (svgPorFormato[alvo]) return svgPorFormato[alvo]!;
        // formato sem PNG proprio (2, 6, ou um dos 4 pedidos que nao
        // veio neste request): reusa o mais proximo ja enviado
        const proximo = formatoMaisProximo(disponiveis, alvo)!;
        return svgPorFormato[proximo]!;
      };

      const tema = await themeService.criar(usuario.id, {
        companyId: dados.companyId,
        themeName: dados.themeName,
        day: dados.day,
        format1Svg: formatoDe(1),
        format2Svg: formatoDe(2),
        format4Svg: formatoDe(4),
        format6Svg: formatoDe(6),
        format8Svg: formatoDe(8),
        format10Svg: formatoDe(10),
      });

      res.status(201).json({
        tema,
        // avisa quais formatos sao "emprestados" de outro, pra quem
        // chamou saber o que ainda precisa de arte propria
        formatosComArtePropria: disponiveis,
      });
    } catch (e) {
      next(e);
    }
  },
};
