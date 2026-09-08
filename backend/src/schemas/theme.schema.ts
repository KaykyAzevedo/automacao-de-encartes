import { z } from "zod";

// Dias da semana usados para escolher o tema do dia; o nome criativo
// ("Quartou", "Promoção do Dia") fica em themeName, livre.
export const DIAS_SEMANA = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
] as const;

// Validacao basica de SVG: nao faz parsing XML completo, so confere
// que o conteudo comeca com <svg e termina com </svg>.
const svgValido = z
  .string({ message: "campo obrigatório" })
  .trim()
  .min(1, "não pode ser vazio")
  .refine((v) => /^<svg[\s>]/i.test(v), {
    message: "deve começar com uma tag <svg>",
  })
  .refine((v) => /<\/svg>\s*$/i.test(v), {
    message: "deve terminar com </svg>",
  });

export const criarThemeSchema = z.object({
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
  format1Svg: svgValido,
  format4Svg: svgValido,
  format8Svg: svgValido,
  format10Svg: svgValido,
});

export const atualizarThemeSchema = z
  .object({
    themeName: z.string().trim().min(1).max(80).optional(),
    day: z.enum(DIAS_SEMANA).optional(),
    format1Svg: svgValido.optional(),
    format4Svg: svgValido.optional(),
    format8Svg: svgValido.optional(),
    format10Svg: svgValido.optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });

export const themeIdSchema = z.object({
  id: z.string().trim().min(1, "id inválido"),
});

export const companyIdParamSchema = z.object({
  companyId: z.string().trim().min(1, "companyId inválido"),
});

export type CriarThemeInput = z.infer<typeof criarThemeSchema>;
export type AtualizarThemeInput = z.infer<typeof atualizarThemeSchema>;
