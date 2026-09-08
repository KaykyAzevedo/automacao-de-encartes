import { z } from "zod";

// Espelha a validacao do backend, para o erro aparecer antes
// da requisicao. O backend continua sendo a fonte de verdade.
export const ESTILOS = ["sofisticado", "agressivo"] as const;

export const empresaSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da empresa")
    .max(120, "No máximo 120 caracteres"),
  style: z.enum(ESTILOS, { message: "Escolha um estilo" }),
  logo: z
    .string()
    .trim()
    .url("Informe uma URL válida (https://...)")
    .or(z.literal(""))
    .nullish(),
});

export const lojaSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da loja")
    .max(120, "No máximo 120 caracteres"),
  address: z
    .string()
    .trim()
    .min(1, "Informe o endereço")
    .max(255, "No máximo 255 caracteres"),
  deliveryPhone: z
    .string()
    .trim()
    .regex(
      /^[0-9()+\-\s]{8,20}$/,
      "Use apenas números, espaços, parênteses, + e -"
    )
    .or(z.literal(""))
    .nullish(),
  logo: z
    .string()
    .trim()
    .url("Informe uma URL válida (https://...)")
    .or(z.literal(""))
    .nullish(),
});

// Converte o erro do Zod em { campo: mensagem }, do jeito que os
// formularios consomem.
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const issue of erro.issues) {
    const campo = issue.path.join(".") || "_";
    saida[campo] ??= issue.message;
  }
  return saida;
}
