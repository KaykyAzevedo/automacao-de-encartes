import { naoEncontrado } from "../lib/errors";
import { prisma } from "../lib/prisma";
import type {
  AtualizarThemeInput,
  CriarThemeInput,
} from "../schemas/theme.schema";
import { companyService } from "./company.service";

// Campos leves para listagem: os 4 SVGs sao @db.Text e podem ser
// grandes, entao a lista nao carrega o conteudo, so os metadados.
const CAMPOS_LISTA = {
  id: true,
  companyId: true,
  themeName: true,
  day: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const themeService = {
  async criar(userId: string, { companyId, ...dados }: CriarThemeInput) {
    await companyService.garantirPropriedade(userId, companyId);
    return prisma.theme.create({ data: { ...dados, companyId } });
  },

  async listarPorEmpresa(userId: string, companyId: string) {
    await companyService.garantirPropriedade(userId, companyId);
    return prisma.theme.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
      select: CAMPOS_LISTA,
    });
  },

  async buscar(userId: string, id: string) {
    // posse indireta pela empresa, como em lojas e produtos
    const tema = await prisma.theme.findFirst({
      where: { id, company: { userId } },
      include: { company: { select: { id: true, name: true } } },
    });
    if (!tema) throw naoEncontrado("Tema não encontrado");
    return tema;
  },

  async atualizar(userId: string, id: string, dados: AtualizarThemeInput) {
    await this.garantirPropriedade(userId, id);
    return prisma.theme.update({ where: { id }, data: dados });
  },

  async remover(userId: string, id: string) {
    await this.garantirPropriedade(userId, id);
    await prisma.theme.delete({ where: { id } });
  },

  async garantirPropriedade(userId: string, id: string) {
    const existe = await prisma.theme.findFirst({
      where: { id, company: { userId } },
      select: { id: true },
    });
    if (!existe) throw naoEncontrado("Tema não encontrado");
  },
};
