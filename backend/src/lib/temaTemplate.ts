// Etapa 25: monta um SVG de tema a partir de uma arte de fundo (PNG) +
// uma grade generica de placeholders, pronta pro fluxo de import de
// PNG->tema (script de linha de comando, seed e pagina de admin usam
// esta mesma logica, pra nao divergir).
//
// O posicionamento da grade e um ponto de partida razoavel, nao o
// layout final - depois que a arte de verdade chega, o ideal e ajustar
// visualmente comparando com a referencia (mesmo fluxo ja usado pros
// outros temas desta sessao).

export const FORMATOS_VALIDOS = [1, 2, 4, 6, 8, 10] as const;
export type FormatoTemplate = (typeof FORMATOS_VALIDOS)[number];

const LARGURA = 1080;
const ALTURA = 1350;
const MARGEM = 60;
// deixa espaco no topo pro cabecalho/titulo, tipico de todos os temas
const TOPO_GRADE = 300;

const COLUNAS_POR_FORMATO: Record<FormatoTemplate, number> = {
  1: 1,
  2: 2,
  4: 2,
  6: 2,
  8: 2,
  10: 2,
};

// Dado um conjunto de formatos que ja tem arte propria, acha o mais
// proximo do formato alvo - usado pra preencher 2 e 6 itens (fora do
// pedido original) sem deixar o Theme invalido (o schema exige as 6).
export function formatoMaisProximo(
  disponiveis: FormatoTemplate[],
  alvo: FormatoTemplate
): FormatoTemplate | null {
  if (disponiveis.length === 0) return null;
  return disponiveis.reduce((melhor, atual) =>
    Math.abs(atual - alvo) < Math.abs(melhor - alvo) ? atual : melhor
  );
}

// Gera o SVG de um formato, com a foto de fundo esticada pro canvas
// inteiro e uma grade de placeholders {{ITEM_N_...}} (mesma convencao
// de frontend/src/lib/temas/render.ts) por cima.
export function montarSvgComFundo(
  fundoUrl: string,
  formato: FormatoTemplate
): string {
  const colunas = COLUNAS_POR_FORMATO[formato];
  const linhas = Math.ceil(formato / colunas);
  const alturaGrade = ALTURA - TOPO_GRADE - MARGEM;
  const larguraCelula = (LARGURA - MARGEM * 2) / colunas;
  const alturaCelula = alturaGrade / linhas;

  let itens = "";
  for (let i = 0; i < formato; i++) {
    const coluna = i % colunas;
    const linha = Math.floor(i / colunas);
    const x = MARGEM + coluna * larguraCelula;
    const y = TOPO_GRADE + linha * alturaCelula;
    const n = i + 1;
    const fotoAltura = alturaCelula * 0.62;

    itens += `
    <g>
      <image href="{{ITEM_${n}_FOTO}}" x="${x + 12}" y="${y + 12}" width="${larguraCelula - 24}" height="${fotoAltura}" preserveAspectRatio="xMidYMid slice"/>
      <text x="${x + larguraCelula / 2}" y="${y + fotoAltura + 40}" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#ffffff">{{ITEM_${n}_NOME}}</text>
      <text x="${x + larguraCelula / 2}" y="${y + fotoAltura + 78}" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="bold" fill="#ffffff">R$ {{ITEM_${n}_PRECO}} {{ITEM_${n}_UNIDADE}}</text>
    </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGURA} ${ALTURA}" width="${LARGURA}" height="${ALTURA}">
  <image href="${fundoUrl}" x="0" y="0" width="${LARGURA}" height="${ALTURA}" preserveAspectRatio="xMidYMid slice"/>
  ${itens}
</svg>`;
}
