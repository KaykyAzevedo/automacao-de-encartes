import { z } from "zod";

// aceita os formatos usados nos encartes: (21) 97510-3253, 21997510325, +55 21 ...
const telefone = z
  .string()
  .trim()
  .regex(
    /^[0-9()+\-\s]{8,20}$/,
    "cada número deve conter apenas números, espaços, parênteses, + e -"
  );

// Etapa 28: uma loja pode divulgar mais de um numero (WhatsApp de
// delivery, fixo, etc) - por isso uma lista, nao mais um campo unico.
const listaDeTelefones = z
  .array(telefone)
  .max(5, "no máximo 5 números por loja")
  .default([]);

export const criarStoreSchema = z.object({
  companyId: z
    .string({ message: "companyId é obrigatório" })
    .trim()
    .min(1, "companyId não pode ser vazio"),
  name: z
    .string({ message: "name é obrigatório" })
    .trim()
    .min(1, "name não pode ser vazio")
    .max(120, "name deve ter no máximo 120 caracteres"),
  address: z
    .string({ message: "address é obrigatório" })
    .trim()
    .min(1, "address não pode ser vazio")
    .max(255, "address deve ter no máximo 255 caracteres"),
  deliveryPhones: listaDeTelefones,
  logo: z.string().url("logo deve ser uma URL válida").nullish(),
});

export const atualizarStoreSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "name não pode ser vazio")
      .max(120)
      .optional(),
    address: z
      .string()
      .trim()
      .min(1, "address não pode ser vazio")
      .max(255)
      .optional(),
    deliveryPhones: listaDeTelefones.optional(),
    logo: z.string().url("logo deve ser uma URL válida").nullish(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });

export const storeIdSchema = z.object({
  id: z.string().trim().min(1, "id inválido"),
});

export const companyIdParamSchema = z.object({
  companyId: z.string().trim().min(1, "companyId inválido"),
});

export type CriarStoreInput = z.infer<typeof criarStoreSchema>;
export type AtualizarStoreInput = z.infer<typeof atualizarStoreSchema>;
