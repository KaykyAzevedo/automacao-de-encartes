// Etapa 30: catalogo de fontes que o usuario pode escolher por
// elemento (nome, preco, unidade) no editor visual. Cada uma e uma
// classe CSS ja definida em lib/temas/base.ts (<style>), ligada a uma
// fonte do Google Fonts carregada em lib/fontes.ts - so precisa achar
// uma fonte nova aqui, importar la, e adicionar uma linha aqui, sem
// mexer em mais nada.
//
// Todas do Google Fonts: licenca OFL/Apache, uso comercial livre sem
// custo (ver docs/DEVELOPER_GUIDE.md) e cobertura completa de acentos
// em portugues.
export const FONTES_DISPONIVEIS = [
  { id: "serifa", rotulo: "Cinzel — elegante", classe: "serifa" },
  { id: "peso", rotulo: "Anton — impacto", classe: "peso" },
  { id: "sans", rotulo: "Montserrat — limpa", classe: "sans" },
  { id: "bebas", rotulo: "Bebas Neue — condensada", classe: "bebas" },
  { id: "oswald", rotulo: "Oswald — moderna", classe: "oswald" },
  { id: "mao", rotulo: "Caveat — à mão", classe: "mao" },
  { id: "script", rotulo: "Pinyon Script — caligrafia", classe: "script" },
] as const;

export type FonteId = (typeof FONTES_DISPONIVEIS)[number]["id"];

const CLASSE_POR_ID: Record<FonteId, string> = Object.fromEntries(
  FONTES_DISPONIVEIS.map((f) => [f.id, f.classe])
) as Record<FonteId, string>;

export function classeDaFonte(id: FonteId): string {
  return CLASSE_POR_ID[id];
}
