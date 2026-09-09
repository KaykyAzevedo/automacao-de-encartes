import Fuse from "fuse.js";

import { naoEncontrado } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { normalizar } from "../lib/texto";
import type {
  AtualizarProductInput,
  CriarProductInput,
} from "../schemas/product.schema";
import { companyService } from "./company.service";

export const productService = {
  async criar(userId: string, { companyId, ...dados }: CriarProductInput) {
    await companyService.garantirPropriedade(userId, companyId);
    return prisma.product.create({
      data: { ...dados, userPhotos: dados.userPhotos ?? [], companyId },
    });
  },

  async listar(
    userId: string,
    filtros: { companyId?: string; search?: string }
  ) {
    if (filtros.companyId) {
      await companyService.garantirPropriedade(userId, filtros.companyId);
    }

    const produtos = await prisma.product.findMany({
      where: {
        company: { userId },
        ...(filtros.companyId ? { companyId: filtros.companyId } : {}),
      },
      orderBy: { name: "asc" },
      include: { company: { select: { id: true, name: true } } },
    });

    if (!filtros.search) return produtos;

    // filtro simples por substring, ja ignorando acento e caixa
    const alvo = normalizar(filtros.search);
    return produtos.filter((p) => normalizar(p.name).includes(alvo));
  },

  // Usado pelo fuzzy matching da lista de produtos: recebe o nome como
  // o usuario digitou e devolve os candidatos mais parecidos do acervo.
  async buscarSimilares(
    userId: string,
    companyId: string,
    query: string,
    limite: number
  ) {
    await companyService.garantirPropriedade(userId, companyId);

    const produtos = await prisma.product.findMany({
      where: { companyId },
      select: { id: true, name: true, photoS3Url: true, userPhotos: true },
    });
    if (produtos.length === 0) return [];

    const indexados = produtos.map((p) => ({
      ...p,
      busca: normalizar(p.name),
    }));

    const fuse = new Fuse(indexados, {
      keys: ["busca"],
      includeScore: true,
      // 0.4 calibrado: mantem tolerancia a erro de digitacao
      // ("morngo" -> Morango) sem casar produto que nao existe no acervo
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    return fuse
      .search(normalizar(query), { limit: limite })
      .map(({ item, score }) => {
        const { busca: _busca, ...produto } = item;
        return {
          ...produto,
          // Fuse: 0 = perfeito. Invertido aqui para "similaridade",
          // que e mais intuitivo para quem consome a API.
          similarity: Number((1 - (score ?? 0)).toFixed(4)),
        };
      });
  },

  async atualizar(userId: string, id: string, dados: AtualizarProductInput) {
    await this.garantirPropriedade(userId, id);
    return prisma.product.update({ where: { id }, data: dados });
  },

  async remover(userId: string, id: string) {
    await this.garantirPropriedade(userId, id);
    await prisma.product.delete({ where: { id } });
  },

  // Etapa 21: adiciona ao array em vez de substituir - cada upload do
  // usuario fica disponivel como opcao a mais (nao troca a foto do
  // banco publico, que continua existindo como alternativa).
  async adicionarFotoUsuario(userId: string, id: string, url: string) {
    await this.garantirPropriedade(userId, id);
    return prisma.product.update({
      where: { id },
      data: { userPhotos: { push: url } },
    });
  },

  async garantirPropriedade(userId: string, id: string) {
    const existe = await prisma.product.findFirst({
      where: { id, company: { userId } },
      select: { id: true },
    });
    if (!existe) throw naoEncontrado("Produto não encontrado");
  },
};
