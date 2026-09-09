import type { Prisma } from "../generated/prisma/client";
import { naoEncontrado } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type {
  AtualizarEncarteDraftInput,
  CriarEncarteDraftInput,
} from "../schemas/encarteDraft.schema";
import { companyService } from "./company.service";

// Campos leves para listagem: productList/parsedProducts podem ser
// grandes (listas coladas inteiras + fotos), a lista de rascunhos so
// precisa do suficiente pra montar um card.
const CAMPOS_LISTA = {
  id: true,
  companyId: true,
  name: true,
  selectedFormat: true,
  pngUrl: true,
  jpgUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const encarteDraftService = {
  async criar(userId: string, { companyId, ...dados }: CriarEncarteDraftInput) {
    await companyService.garantirPropriedade(userId, companyId);
    return prisma.encarteDraft.create({
      data: {
        ...dados,
        companyId,
        userId,
        // zod garante o formato (array de item / objeto livre); o
        // Prisma so quer o cast pro tipo generico de JSON dele
        parsedProducts: dados.parsedProducts as Prisma.InputJsonValue,
        edits: dados.edits as Prisma.InputJsonValue,
      },
    });
  },

  // companyId opcional (Etapa 20 pede "lista todos os drafts do
  // user", com companyId so como filtro) - ownership sempre por
  // userId direto, sem precisar confirmar a empresa aqui.
  listar(userId: string, companyId?: string) {
    return prisma.encarteDraft.findMany({
      where: { userId, ...(companyId ? { companyId } : {}) },
      orderBy: { updatedAt: "desc" },
      select: CAMPOS_LISTA,
    });
  },

  async buscar(userId: string, id: string) {
    const draft = await prisma.encarteDraft.findFirst({
      where: { id, userId },
    });
    if (!draft) throw naoEncontrado("Rascunho não encontrado");
    return draft;
  },

  async atualizar(
    userId: string,
    id: string,
    dados: AtualizarEncarteDraftInput
  ) {
    await this.garantirPropriedade(userId, id);
    return prisma.encarteDraft.update({
      where: { id },
      data: {
        ...dados,
        parsedProducts: dados.parsedProducts as
          Prisma.InputJsonValue | undefined,
        edits: dados.edits as Prisma.InputJsonValue | undefined,
      },
    });
  },

  async remover(userId: string, id: string) {
    await this.garantirPropriedade(userId, id);
    await prisma.encarteDraft.delete({ where: { id } });
  },

  async garantirPropriedade(userId: string, id: string) {
    const existe = await prisma.encarteDraft.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existe) throw naoEncontrado("Rascunho não encontrado");
  },
};
