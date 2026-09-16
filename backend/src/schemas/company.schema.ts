import { z } from "zod";

export const ESTILOS = ["sofisticado", "agressivo"] as const;

export const criarCompanySchema = z.object({
  name: z
    .string({ message: "name é obrigatório" })
    .trim()
    .min(1, "name não pode ser vazio")
    .max(120, "name deve ter no máximo 120 caracteres"),
  style: z.enum(ESTILOS).default("sofisticado"),
  logo: z.string().url("logo deve ser uma URL válida").nullish(),
});

export const atualizarCompanySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "name não pode ser vazio")
      .max(120)
      .optional(),
    style: z.enum(ESTILOS).optional(),
    logo: z.string().url("logo deve ser uma URL válida").nullish(),
    // Etapa 33: "modelo padrao" do encarte de 8 itens - mesmo formato
    // livre de EncarteDraft.edits (o frontend e quem sabe o formato
    // real, EscalasTema); aqui so garante que e um objeto serializavel.
    // null "reseta" pro padrao do sistema.
    defaultEscalas: z.record(z.string(), z.unknown()).nullish(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });

export const companyIdSchema = z.object({
  id: z.string().trim().min(1, "id inválido"),
});

export type CriarCompanyInput = z.infer<typeof criarCompanySchema>;
export type AtualizarCompanyInput = z.infer<typeof atualizarCompanySchema>;
