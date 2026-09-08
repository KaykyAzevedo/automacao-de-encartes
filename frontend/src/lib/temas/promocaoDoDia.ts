import { cabecalho, documento } from "./base";
import type { SlotNome } from "./nome";
import type { Tema } from "./tipos";

// Tema "Promoção do Dia" - preto e dourado, 1080x1350 (feed).
// Cinco grades sobre o mesmo cabecalho e rodape.

interface Caixa {
  x: number;
  y: number;
  w: number;
  h: number;
}

function moldura({ x, y, w, h }: Caixa, raio = 26): string {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${raio}"
        fill="url(#fundoCard)" stroke="url(#molduraCard)" stroke-width="3.2"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${raio}"
        fill="none" stroke="#e3c073" stroke-width="1" opacity="0.32"
        filter="url(#brilhoOuro)"/>`;
}

function foto(n: number, { x, y, w, h }: Caixa): string {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"
        fill="#101010" stroke="#3a3021" stroke-width="1.4" stroke-dasharray="7 7"/>
  <image href="{{ITEM_${n}_FOTO}}" x="${x}" y="${y}" width="${w}" height="${h}"
         preserveAspectRatio="xMidYMid meet"/>`;
}

// Linhas curtas nas bordas em vez de ornamentos colados ao texto:
// em posicao fixa eles colidem com nomes curtos.
function nome(
  n: number,
  cx: number,
  baseline: number,
  tamanho: number,
  bordaEsq: number,
  bordaDir: number,
  comFolha: boolean
): string {
  const compLinha = Math.min(80, (bordaDir - bordaEsq) * 0.16);
  return `${
    comFolha
      ? `<g fill="url(#ouro)"><use href="#folhas" transform="translate(${cx},${(baseline - tamanho * 1.05).toFixed(0)}) scale(${(0.5 + tamanho / 200).toFixed(2)})"/></g>`
      : ""
  }
  <line x1="${bordaEsq}" y1="${baseline - 16}" x2="${bordaEsq + compLinha}" y2="${baseline - 16}"
        stroke="url(#ouroLinha)" stroke-width="1.3"/>
  <line x1="${bordaDir - compLinha}" y1="${baseline - 16}" x2="${bordaDir}" y2="${baseline - 16}"
        stroke="url(#ouroLinha)" stroke-width="1.3"/>
  <text class="serifa" x="${cx}" y="${baseline}" text-anchor="middle" font-size="${tamanho}"
        letter-spacing="2.5" fill="url(#ouro)" font-weight="700">{{ITEM_${n}_NOME}}</text>`;
}

function preco(n: number, { x, y, w, h }: Caixa, corpo: number): string {
  const meio = y + h / 2;
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"
        fill="#0b0b0b" stroke="url(#molduraCard)" stroke-width="2.2"/>
  <text class="peso" x="${x + w * 0.09}" y="${meio + corpo * 0.2}" font-size="${(corpo * 0.55).toFixed(0)}"
        fill="url(#ouro)">R$</text>
  <text class="peso" x="${x + w * 0.53}" y="${meio + corpo * 0.32}" text-anchor="middle"
        font-size="${corpo}" fill="#f7ead0">{{ITEM_${n}_PRECO}}</text>
  <text class="peso" x="${x + w - w * 0.06}" y="${meio + corpo * 0.14}" text-anchor="end"
        font-size="${(corpo * 0.46).toFixed(0)}" fill="#f7ead0">{{ITEM_${n}_UNIDADE}}</text>`;
}

// ---------- 1 destaque ----------
function grade1(): { svg: string; slots: SlotNome[] } {
  const card: Caixa = { x: 52, y: 430, w: 976, h: 650 };
  const svg = [
    moldura(card, 30),
    foto(1, { x: 88, y: 458, w: 904, h: 412 }),
    nome(1, 540, 962, 68, 88, 992, true),
    preco(1, { x: 200, y: 985, w: 680, h: 92 }, 88),
  ].join("");
  return {
    svg,
    slots: [{ x: 540, tamanho: 68, larguraMax: 700, espacamento: 2.5 }],
  };
}

// ---------- 2 itens ----------
function grade2(): { svg: string; slots: SlotNome[] } {
  const partes: string[] = [];
  const slots: SlotNome[] = [];
  const colunas = [52, 560];

  colunas.forEach((x, i) => {
    const n = i + 1;
    const card: Caixa = { x, y: 452, w: 468, h: 632 };
    const cx = x + 234;
    partes.push(
      moldura(card, 30),
      foto(n, { x: x + 28, y: 478, w: 412, h: 352 }),
      nome(n, cx, 896, 44, x + 36, x + 432, true),
      preco(n, { x: x + 28, y: 928, w: 412, h: 128 }, 92)
    );
    slots.push({ x: cx, tamanho: 44, larguraMax: 330, espacamento: 2.5 });
  });

  return { svg: partes.join(""), slots };
}

// ---------- 4 itens: 2 x 2, foto em cima ----------
function grade4(): { svg: string; slots: SlotNome[] } {
  const partes: string[] = [];
  const slots: SlotNome[] = [];
  const colunas = [52, 560];
  const linhas = [382, 754];

  linhas.forEach((y, li) => {
    colunas.forEach((x, ci) => {
      const n = li * 2 + ci + 1;
      const card: Caixa = { x, y, w: 468, h: 348 };
      const cx = x + 234;
      partes.push(
        moldura(card),
        foto(n, { x: x + 24, y: y + 20, w: 420, h: 178 }),
        nome(n, cx, y + 244, 34, x + 30, x + 438, false),
        preco(n, { x: x + 24, y: y + 262, w: 420, h: 68 }, 50)
      );
      slots.push({ x: cx, tamanho: 34, larguraMax: 330, espacamento: 2.5 });
    });
  });

  return { svg: partes.join(""), slots };
}

// ---------- 6 itens: 2 x 3, foto ao lado ----------
function grade6(): { svg: string; slots: SlotNome[] } {
  const partes: string[] = [];
  const slots: SlotNome[] = [];
  const colunas = [52, 560];
  const linhas = [382, 632, 882];

  linhas.forEach((y, li) => {
    colunas.forEach((x, ci) => {
      const n = li * 2 + ci + 1;
      const card: Caixa = { x, y, w: 468, h: 226 };
      const textoX = x + 200;
      const cx = textoX + 124;
      partes.push(
        moldura(card, 20),
        foto(n, { x: x + 16, y: y + 16, w: 166, h: 194 }),
        nome(n, cx, y + 86, 26, textoX - 12, x + 452, false),
        preco(n, { x: textoX - 12, y: y + 106, w: 264, h: 92 }, 54)
      );
      slots.push({ x: cx, tamanho: 26, larguraMax: 250, espacamento: 2 });
    });
  });

  return { svg: partes.join(""), slots };
}

// ---------- 8 itens: 2 x 4, foto alternando de lado ----------
function grade8(): { svg: string; slots: SlotNome[] } {
  const partes: string[] = [];
  const slots: SlotNome[] = [];
  const colunas = [52, 560];
  const linhas = [382, 570, 758, 946];

  linhas.forEach((y, li) => {
    colunas.forEach((x, ci) => {
      const n = li * 2 + ci + 1;
      const card: Caixa = { x, y, w: 468, h: 172 };
      // coluna da esquerda com a foto a esquerda, direita espelhada,
      // como no encarte original
      const fotoEsquerda = ci === 0;
      const fotoX = fotoEsquerda ? x + 14 : x + 306;
      const textoX = fotoEsquerda ? x + 164 : x + 14;
      const cx = textoX + 145;

      partes.push(
        moldura(card, 18),
        foto(n, { x: fotoX, y: y + 12, w: 148, h: 148 }),
        nome(n, cx, y + 58, 23, textoX, textoX + 290, false),
        preco(n, { x: textoX, y: y + 74, w: 290, h: 84 }, 48)
      );
      slots.push({ x: cx, tamanho: 23, larguraMax: 250, espacamento: 1.8 });
    });
  });

  return { svg: partes.join(""), slots };
}

// ---------- 10 itens: 2 x 5, bem comprimido ----------
function grade10(): { svg: string; slots: SlotNome[] } {
  const partes: string[] = [];
  const slots: SlotNome[] = [];
  const colunas = [52, 560];
  const linhas = [372, 518, 664, 810, 956];

  linhas.forEach((y, li) => {
    colunas.forEach((x, ci) => {
      const n = li * 2 + ci + 1;
      const card: Caixa = { x, y, w: 468, h: 138 };
      // mesmo padrao do grade8 (foto alternando de lado), so mais
      // compacto para caber a quinta linha antes do rodape
      const fotoEsquerda = ci === 0;
      const fotoX = fotoEsquerda ? x + 10 : x + 340;
      const textoX = fotoEsquerda ? x + 138 : x + 10;
      const cx = textoX + 160;

      partes.push(
        moldura(card, 16),
        foto(n, { x: fotoX, y: y + 10, w: 118, h: 118 }),
        nome(n, cx, y + 50, 20, textoX, textoX + 320, false),
        preco(n, { x: textoX, y: y + 64, w: 320, h: 64 }, 40)
      );
      slots.push({ x: cx, tamanho: 20, larguraMax: 280, espacamento: 1.6 });
    });
  });

  return { svg: partes.join(""), slots };
}

function montar(
  id: string,
  rotulo: string,
  formato: number,
  compacto: boolean,
  grade: { svg: string; slots: SlotNome[] }
): Tema {
  return {
    id,
    nome: rotulo,
    formato,
    svg: documento(cabecalho(compacto) + grade.svg),
    slotsNome: grade.slots,
  };
}

export const PROMOCAO_DO_DIA_1 = montar(
  "promocao-do-dia-1",
  "Promoção do Dia · 1 destaque",
  1,
  false,
  grade1()
);

export const PROMOCAO_DO_DIA_2 = montar(
  "promocao-do-dia-2",
  "Promoção do Dia · 2 itens",
  2,
  false,
  grade2()
);

export const PROMOCAO_DO_DIA_4 = montar(
  "promocao-do-dia-4",
  "Promoção do Dia · 4 itens",
  4,
  true,
  grade4()
);

export const PROMOCAO_DO_DIA_6 = montar(
  "promocao-do-dia-6",
  "Promoção do Dia · 6 itens",
  6,
  true,
  grade6()
);

export const PROMOCAO_DO_DIA_8 = montar(
  "promocao-do-dia-8",
  "Promoção do Dia · 8 itens",
  8,
  true,
  grade8()
);

export const PROMOCAO_DO_DIA_10 = montar(
  "promocao-do-dia-10",
  "Promoção do Dia · 10 itens",
  10,
  true,
  grade10()
);

export const TEMAS_PROMOCAO_DO_DIA = [
  PROMOCAO_DO_DIA_1,
  PROMOCAO_DO_DIA_2,
  PROMOCAO_DO_DIA_4,
  PROMOCAO_DO_DIA_6,
  PROMOCAO_DO_DIA_8,
  PROMOCAO_DO_DIA_10,
];
