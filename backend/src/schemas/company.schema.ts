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
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });

export const companyIdSchema = z.object({
  id: z.string().trim().min(1, "id inválido"),
});

export type CriarCompanyInput = z.infer<typeof criarCompanySchema>;
export type AtualizarCompanyInput = z.infer<typeof atualizarCompanySchema>;
