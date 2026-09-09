import { z } from "zod";

// Espelha FormatoEncarte no frontend (frontend/src/types/index.ts).
const FORMATOS_VALIDOS = [1, 2, 4, 6, 8, 10] as const;

const itemProcessadoSchema = z.object({
  name: z.string(),
  price: z.string(),
  unit: z.string(),
  photoUrl: z.string(),
});

export const criarEncarteDraftSchema = z.object({
  companyId: z
    .string({ message: "companyId é obrigatório" })
    .trim()
    .min(1, "companyId não pode ser vazio"),
  name: z
    .string({ message: "name é obrigatório" })
    .trim()
    .min(1, "name não pode ser vazio")
    .max(120, "name deve ter no máximo 120 caracteres"),
  productList: z
    .string({ message: "productList é obrigatório" })
    .min(1, "productList não pode ser vazio"),
  selectedThemeId: z.string().trim().min(1).nullish(),
  selectedFormat: z.number().refine((v) => FORMATOS_VALIDOS.includes(v as 1), {
    message: `selectedFormat deve ser um de: ${FORMATOS_VALIDOS.join(", ")}`,
  }),
  parsedProducts: z.array(itemProcessadoSchema).default([]),
  edits: z.record(z.string(), z.unknown()).default({}),
});

export const atualizarEncarteDraftSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    productList: z.string().min(1).optional(),
    selectedThemeId: z.string().trim().min(1).nullish(),
    selectedFormat: z
      .number()
      .refine((v) => FORMATOS_VALIDOS.includes(v as 1), {
        message: `selectedFormat deve ser um de: ${FORMATOS_VALIDOS.join(", ")}`,
      })
      .optional(),
    parsedProducts: z.array(itemProcessadoSchema).optional(),
    edits: z.record(z.string(), z.unknown()).optional(),
    pngUrl: z.string().url("pngUrl deve ser uma URL válida").nullish(),
    jpgUrl: z.string().url("jpgUrl deve ser uma URL válida").nullish(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });

export const encarteDraftIdSchema = z.object({
  id: z.string().trim().min(1, "id inválido"),
});

export const listarEncarteDraftQuerySchema = z.object({
  companyId: z.string().trim().min(1).optional(),
});

export type CriarEncarteDraftInput = z.infer<typeof criarEncarteDraftSchema>;
export type AtualizarEncarteDraftInput = z.infer<
  typeof atualizarEncarteDraftSchema
>;
