// "Brocolis USA" e "BROCOLIS usa" precisam casar: tira acento e caixa,
// colapsa espacos. Usado tanto na busca simples quanto no fuzzy.
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
