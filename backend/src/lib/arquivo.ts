import { randomUUID } from "node:crypto";

// Somente imagens: e o que a etapa de upload vai usar (fotos de
// produto, logo de empresa/loja).
export const MIME_PERMITIDOS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export const TAMANHO_MAXIMO_BYTES = 8 * 1024 * 1024; // 8 MB

// Nome do arquivo nunca vem do usuario: evita path traversal e
// colisao entre uploads de nomes iguais.
export function nomeArquivoSeguro(mimetype: string): string {
  const extensao = MIME_PERMITIDOS[mimetype];
  return `${randomUUID()}.${extensao}`;
}
