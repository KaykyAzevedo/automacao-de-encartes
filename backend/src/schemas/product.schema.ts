import { z } from "zod";

export const criarProductSchema = z.object({
  companyId: z
    .string({ message: "companyId é obrigatório" })
    .trim()
    .min(1, "companyId não pode ser vazio"),
  name: z
    .string({ message: "name é obrigatório" })
    .trim()
    .min(1, "name não pode ser vazio")
    .max(120, "name deve ter no máximo 120 caracteres"),
  photoS3Url: z
    .string({ message: "photoS3Url é obrigatório" })
    .trim()
    .url("photoS3Url deve ser uma URL válida"),
  userPhotos: z
    .array(z.string().url("cada item de userPhotos deve ser uma URL válida"))
    .max(20, "userPhotos aceita no máximo 20 fotos")
    .optional(),
});

export const atualizarProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "name não pode ser vazio")
      .max(120)
      .optional(),
    photoS3Url: z
      .string()
      .trim()
      .url("photoS3Url deve ser uma URL válida")
      .optional(),
    userPhotos: z
      .array(z.string().url("cada item de userPhotos deve ser uma URL válida"))
      .max(20, "userPhotos aceita no máximo 20 fotos")
      .optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });

export const listarProductsQuerySchema = z.object({
  companyId: z.string().trim().min(1).optional(),
  search: z.string().trim().optional(),
});

export const searchProductsQuerySchema = z.object({
  companyId: z
    .string({ message: "companyId é obrigatório" })
    .trim()
    .min(1, "companyId não pode ser vazio"),
  query: z
    .string({ message: "query é obrigatório" })
    .trim()
    .min(1, "query não pode ser vazio"),
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

export const productIdSchema = z.object({
  id: z.string().trim().min(1, "id inválido"),
});

// POST /api/products/upload-photo: multipart/form-data, productId vem
// junto no body (multer.single("file") preenche req.body com os
// outros campos de texto do form antes do controller rodar).
export const uploadPhotoSchema = z.object({
  productId: z
    .string({ message: "productId é obrigatório" })
    .trim()
    .min(1, "productId não pode ser vazio"),
});

export type CriarProductInput = z.infer<typeof criarProductSchema>;
export type AtualizarProductInput = z.infer<typeof atualizarProductSchema>;
