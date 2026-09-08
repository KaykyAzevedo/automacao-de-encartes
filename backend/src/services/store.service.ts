import { naoEncontrado } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type {
  AtualizarStoreInput,
  CriarStoreInput,
} from "../schemas/store.schema";
import { companyService } from "./company.service";

export const storeService = {
  async criar(userId: string, { companyId, ...dados }: CriarStoreInput) {
    // a loja so pode nascer dentro de uma empresa do proprio usuario
    await companyService.garantirPropriedade(userId, companyId);
    return prisma.store.create({
      data: {
        ...dados,
        deliveryPhone: dados.deliveryPhone ?? null,
        logo: dados.logo ?? null,
        companyId,
      },
    });
  },

  async listarPorEmpresa(userId: string, companyId: string) {
    await companyService.garantirPropriedade(userId, companyId);
    return prisma.store.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
    });
  },

  async buscar(userId: string, id: string) {
    const store = await prisma.store.findFirst({
      // a posse e indireta: a loja pertence a uma empresa do usuario
      where: { id, company: { userId } },
      include: {
        company: { select: { id: true, name: true, style: true } },
      },
    });
    if (!store) throw naoEncontrado("Loja não encontrada");
    return store;
  },

  async atualizar(userId: string, id: string, dados: AtualizarStoreInput) {
    await this.garantirPropriedade(userId, id);
    return prisma.store.update({ where: { id }, data: dados });
  },

  async remover(userId: string, id: string) {
    await this.garantirPropriedade(userId, id);
    await prisma.store.delete({ where: { id } });
  },

  async garantirPropriedade(userId: string, id: string) {
    const existe = await prisma.store.findFirst({
      where: { id, company: { userId } },
      select: { id: true },
    });
    if (!existe) throw naoEncontrado("Loja não encontrada");
  },
};
