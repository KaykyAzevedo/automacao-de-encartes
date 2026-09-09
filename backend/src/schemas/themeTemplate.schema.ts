import { z } from "zod";

import { DIAS_SEMANA } from "./theme.schema";

// POST /api/themes/import-png: multipart/form-data. Os arquivos vem em
// req.files (um por campo format1/format4/format8/format10); estes
// campos de texto vem em req.body, preenchidos pelo multer antes do
// controller rodar.
export const importarTemplateSchema = z.object({
  companyId: z
    .string({ message: "companyId é obrigatório" })
    .trim()
    .min(1, "companyId não pode ser vazio"),
  themeName: z
    .string({ message: "themeName é obrigatório" })
    .trim()
    .min(1, "themeName não pode ser vazio")
    .max(80, "themeName deve ter no máximo 80 caracteres"),
  day: z.enum(DIAS_SEMANA, {
    message: `day deve ser um de: ${DIAS_SEMANA.join(", ")}`,
  }),
});

export type ImportarTemplateInput = z.infer<typeof importarTemplateSchema>;
