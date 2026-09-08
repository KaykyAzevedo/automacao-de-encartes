import { z } from "zod";

export const matchProductSchema = z.object({
  companyId: z
    .string({ message: "companyId é obrigatório" })
    .trim()
    .min(1, "companyId não pode ser vazio"),
  productName: z
    .string({ message: "productName é obrigatório" })
    .trim()
    .min(1, "productName não pode ser vazio"),
});

export type MatchProductInput = z.infer<typeof matchProductSchema>;
