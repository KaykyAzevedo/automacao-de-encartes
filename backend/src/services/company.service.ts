import { naoEncontrado } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type {
  AtualizarCompanyInput,
  CriarCompanyInput,
} from "../schemas/company.schema";

export const companyService = {
  criar(userId: string, dados: CriarCompanyInput) {
    return prisma.company.create({
      data: { ...dados, logo: dados.logo ?? null, userId },
    });
  },

  listar(userId: string) {
    return prisma.company.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { stores: true, products: true, themes: true } },
      },
    });
  },

  async buscar(userId: string, id: string) {
    const company = await prisma.company.findFirst({
      // filtra por userId junto: uma empresa de outro usuario
      // responde 404, sem revelar que ela existe
      where: { id, userId },
      include: {
        stores: true,
        themes: { select: { id: true, themeName: true, day: true } },
        _count: { select: { products: true, drafts: true } },
      },
    });
    if (!company) throw naoEncontrado("Empresa não encontrada");
    return company;
  },

  async atualizar(userId: string, id: string, dados: AtualizarCompanyInput) {
    await this.garantirPropriedade(userId, id);
    return prisma.company.update({ where: { id }, data: dados });
  },

  async remover(userId: string, id: string) {
    await this.garantirPropriedade(userId, id);
    await prisma.company.delete({ where: { id } });
  },

  async garantirPropriedade(userId: string, id: string) {
    const existe = await prisma.company.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existe) throw naoEncontrado("Empresa não encontrada");
  },
};
