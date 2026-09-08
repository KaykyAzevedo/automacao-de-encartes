import { cabecalho, documento } from "./base";
import type { SlotNome } from "./nome";
import type { Tema } from "./tipos";

// Tema "Promoção do Dia" - preto e dourado, 1080x1350 (feed).
// Seis grades sobre o mesmo cabecalho e rodape.

interface Caixa {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Fatores de 0.5 a 1.5 (50% a 150%) vindos do editor visual (Etapa 18).
// Cada elemento escala em torno do proprio centro/base, sem mudar a
// posicao das bordas do card - so o conteudo cresce ou encolhe.
export interface EscalasTema {
  foto: number;
  nome: number;
  preco: number;
}

export const ESCALA_PADRAO: EscalasTema = { foto: 1, nome: 1, preco: 1 };

function moldura({ x, y, w, h }: Caixa, raio = 26): string {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${raio}"
        fill="url(#fundoCard)" stroke="url(#molduraCard)" stroke-width="3.2"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${raio}"
        fill="none" stroke="#ffd54a" stroke-width="1" opacity="0.32"
        filter="url(#brilhoOuro)"/>`;
}

// As fotos do banco sao quadradas (1080x1080), mas a caixa de cada
// grade quase nunca e quadrada - "slice" (cobrir cortando o excesso)
// da um zoom enorme numa caixa larga/baixa e corta o produto quase
// inteiro. "meet" (mostrar tudo, sobra vazio) e o certo aqui; o
// clipPath so evita que a foto vaze pra fora da propria caixa quando
// o slider aumenta a escala.
//
// `recortar=false` tira essa trava (usado so no destaque de 1 item):
// como as fotos ja sao PNG sem fundo, deixar a fruta "vazar" um pouco
// pra fora da propria caixa (e ate por cima da borda do card) da um
// efeito de destaque saltando da tela, sem mostrar nenhum retangulo -
// so a silhueta da fruta mesmo cruzando a borda.
function foto(
  n: number,
  caixa: Caixa,
  escala: number,
  recortar = true
): string {
  const { x, y, w, h } = caixa;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const imagem = `<image href="{{ITEM_${n}_FOTO}}" x="${x}" y="${y}" width="${w}" height="${h}"
             preserveAspectRatio="xMidYMid meet"/>`;

  if (!recortar) {
    return `
  <g transform="translate(${cx},${cy}) scale(${escala.toFixed(3)}) translate(${-cx},${-cy})">
    ${imagem}
  </g>`;
  }

  const clipId = `fotoClip${n}`;
  return `
  <clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/></clipPath>
  <g clip-path="url(#${clipId})">
    <g transform="translate(${cx},${cy}) scale(${escala.toFixed(3)}) translate(${-cx},${-cy})">
      ${imagem}
    </g>
  </g>`;
}

// Linhas curtas nas bordas em vez de ornamentos colados ao texto:
// em posicao fixa eles colidem com nomes curtos. (A folhinha dourada
// que ficava em cima do nome foi removida a pedido do usuario.)
function nome(
  n: number,
  cx: number,
  baseline: number,
  tamanho: number,
  bordaEsq: number,
  bordaDir: number,
  escala: number
): string {
  const compLinha = Math.min(80, (bordaDir - bordaEsq) * 0.16);
  return `
  <g transform="translate(${cx},${baseline}) scale(${escala.toFixed(3)}) translate(${-cx},${-baseline})">
    <line x1="${bordaEsq}" y1="${baseline - 16}" x2="${bordaEsq + compLinha}" y2="${baseline - 16}"
          stroke="url(#ouroLinha)" stroke-width="1.3"/>
    <line x1="${bordaDir - compLinha}" y1="${baseline - 16}" x2="${bordaDir}" y2="${baseline - 16}"
          stroke="url(#ouroLinha)" stroke-width="1.3"/>
    <text class="serifa" x="${cx}" y="${baseline}" text-anchor="middle" font-size="${tamanho}"
          letter-spacing="2.5" fill="url(#ouro)" font-weight="700">{{ITEM_${n}_NOME}}</text>
  </g>`;
}

// Preco em dourado brilhante preenchendo bem a caixa (pedido do
// usuario) em vez do numero creme/branco, discreto, de antes.
function preco(n: number, caixa: Caixa, corpo: number, escala: number): string {
  const { x, y, w, h } = caixa;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const meio = y + h / 2;
  return `
  <g transform="translate(${cx},${cy}) scale(${escala.toFixed(3)}) translate(${-cx},${-cy})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"
          fill="#0b0b0b" stroke="url(#molduraCard)" stroke-width="2.2"/>
    <text class="peso" x="${x + w * 0.09}" y="${meio + corpo * 0.2}" font-size="${(corpo * 0.55).toFixed(0)}"
          fill="url(#ouro)">R$</text>
    <text class="peso" x="${x + w * 0.53}" y="${meio + corpo * 0.32}" text-anchor="middle"
          font-size="${corpo}" fill="url(#ouro)" filter="url(#brilhoSuave)">{{ITEM_${n}_PRECO}}</text>
    <text class="peso" x="${x + w - w * 0.06}" y="${meio + corpo * 0.14}" text-anchor="end"
          font-size="${(corpo * 0.46).toFixed(0)}" fill="url(#ouro)">{{ITEM_${n}_UNIDADE}}</text>
  </g>`;
}

type ResultadoGrade = { svg: string; slots: SlotNome[] };
type FuncaoGrade = (escalas: EscalasTema) => ResultadoGrade;

// ---------- 1 destaque ----------
// Foto grande em cima (empilhado), nome e preco embaixo. O card comeca
// mais baixo que o cabecalho (com uma folga entre o titulo "DO DIA" e
// a borda do card) justamente pra foto poder vazar pra cima da borda
// SEM passar por cima do titulo - ela salta na folga, nao no texto.
function grade1(escalas: EscalasTema): ResultadoGrade {
  const card: Caixa = { x: 52, y: 470, w: 976, h: 526 };
  const fotoLado = 620;
  const fotoX = card.x + (card.w - fotoLado) / 2;
  // As fotos do banco tem uma margem interna grande (a fruta ocupa uns
  // 55-80% da altura do PNG, nao o quadrado inteiro) - so subir a
  // caixa um pouco nao bastava pra fruta cruzar a borda de verdade;
  // subimos o suficiente pra compensar essa margem tipica.
  const fotoY = card.y - 210;
  const fotoVisivelBaixo = fotoY + fotoLado * 0.81;
  const cx = card.x + card.w / 2;
  const nomeBaseline = fotoVisivelBaixo + 68;
  const precoCaixa: Caixa = {
    x: card.x + (card.w - 560) / 2,
    y: nomeBaseline + 38,
    w: 560,
    h: 88,
  };

  const svg = [
    moldura(card, 30),
    foto(
      1,
      { x: fotoX, y: fotoY, w: fotoLado, h: fotoLado },
      escalas.foto,
      false
    ),
    nome(
      1,
      cx,
      nomeBaseline,
      56,
      card.x + 80,
      card.x + card.w - 80,
      escalas.nome
    ),
    preco(1, precoCaixa, 70, escalas.preco),
  ].join("");
  return {
    svg,
    slots: [{ x: cx, tamanho: 56, larguraMax: 800, espacamento: 2.5 }],
  };
}

// ---------- 2 itens ----------
function grade2(escalas: EscalasTema): ResultadoGrade {
  const partes: string[] = [];
  const slots: SlotNome[] = [];
  const colunas = [52, 560];

  colunas.forEach((x, i) => {
    const n = i + 1;
    const card: Caixa = { x, y: 452, w: 468, h: 632 };
    const cx = x + 234;
    partes.push(
      moldura(card, 30),
      foto(n, { x: x + 28, y: 478, w: 412, h: 352 }, escalas.foto),
      nome(n, cx, 896, 44, x + 36, x + 432, escalas.nome),
      preco(n, { x: x + 28, y: 928, w: 412, h: 128 }, 102, escalas.preco)
    );
    slots.push({ x: cx, tamanho: 44, larguraMax: 330, espacamento: 2.5 });
  });

  return { svg: partes.join(""), slots };
}

// ---------- 4 itens: 2 x 2, foto em cima ----------
// Foto mais alta (340x230, era 420x178 - bem mais larga que alta) pra
// aproximar do quadrado das fotos do banco, sem cortar (meet): sobra
// so uma folga pequena nas laterais em vez de achatar a foto toda.
function grade4(escalas: EscalasTema): ResultadoGrade {
  const partes: string[] = [];
  const slots: SlotNome[] = [];
  const colunas = [52, 560];
  const linhas = [380, 760];

  linhas.forEach((y, li) => {
    colunas.forEach((x, ci) => {
      const n = li * 2 + ci + 1;
      const card: Caixa = { x, y, w: 468, h: 360 };
      const cx = x + 234;
      partes.push(
        moldura(card),
        foto(n, { x: x + 64, y: y + 12, w: 340, h: 230 }, escalas.foto),
        nome(n, cx, y + 280, 30, x + 30, x + 438, escalas.nome),
        preco(n, { x: x + 54, y: y + 296, w: 360, h: 56 }, 44, escalas.preco)
      );
      slots.push({ x: cx, tamanho: 30, larguraMax: 340, espacamento: 2.5 });
    });
  });

  return { svg: partes.join(""), slots };
}

// ---------- 6 itens: 2 x 3, foto ao lado ----------
function grade6(escalas: EscalasTema): ResultadoGrade {
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
        foto(n, { x: x + 16, y: y + 16, w: 166, h: 194 }, escalas.foto),
        nome(n, cx, y + 86, 26, textoX - 12, x + 452, escalas.nome),
        preco(
          n,
          { x: textoX - 12, y: y + 106, w: 264, h: 92 },
          69,
          escalas.preco
        )
      );
      slots.push({ x: cx, tamanho: 26, larguraMax: 250, espacamento: 2 });
    });
  });

  return { svg: partes.join(""), slots };
}

// ---------- 8 itens: 2 x 4, foto alternando de lado ----------
// Hierarquia do encarte: foto e preco em evidencia, nome e o menos
// importante. Foto cresceu (148->160) e o preco tambem (48->52); o
// nome encolheu (23->19) pra abrir espaco pros dois.
function grade8(escalas: EscalasTema): ResultadoGrade {
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
      const fotoX = fotoEsquerda ? x + 10 : x + 298;
      const textoX = fotoEsquerda ? x + 176 : x + 14;
      const cx = textoX + 139;

      partes.push(
        moldura(card, 18),
        foto(n, { x: fotoX, y: y + 6, w: 160, h: 160 }, escalas.foto),
        nome(n, cx, y + 56, 19, textoX, textoX + 278, escalas.nome),
        preco(n, { x: textoX, y: y + 74, w: 278, h: 86 }, 65, escalas.preco)
      );
      slots.push({ x: cx, tamanho: 19, larguraMax: 240, espacamento: 1.6 });
    });
  });

  return { svg: partes.join(""), slots };
}

// ---------- 10 itens: 2 x 5, bem comprimido ----------
// Mesma logica de hierarquia do grade8: foto maior (118->132), preco
// maior (40->43), nome menor (20->17) - sem mudar a altura do card
// (nao ha espaco vertical sobrando com 5 linhas nesse formato).
function grade10(escalas: EscalasTema): ResultadoGrade {
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
      const fotoX = fotoEsquerda ? x + 6 : x + 330;
      const textoX = fotoEsquerda ? x + 152 : x + 8;
      const cx = textoX + 149;

      partes.push(
        moldura(card, 16),
        foto(n, { x: fotoX, y: y + 3, w: 132, h: 132 }, escalas.foto),
        nome(n, cx, y + 48, 17, textoX, textoX + 298, escalas.nome),
        preco(n, { x: textoX, y: y + 62, w: 298, h: 66 }, 50, escalas.preco)
      );
      slots.push({ x: cx, tamanho: 17, larguraMax: 260, espacamento: 1.4 });
    });
  });

  return { svg: partes.join(""), slots };
}

function montar(
  id: string,
  rotulo: string,
  formato: number,
  compacto: boolean,
  gradeFn: FuncaoGrade,
  escalas: EscalasTema
): Tema {
  const grade = gradeFn(escalas);
  return {
    id,
    nome: rotulo,
    formato,
    svg: documento(cabecalho(compacto) + grade.svg),
    slotsNome: grade.slots,
  };
}

// Reconstroi os 6 formatos a partir das escalas atuais. Chamada de
// novo a cada mudanca de slider (Etapa 18): e so concatenacao de
// string, entao refazer isto a cada re-render e barato.
export function construirTemasPromocaoDoDia(
  escalas: EscalasTema = ESCALA_PADRAO
): Tema[] {
  return [
    montar(
      "promocao-do-dia-1",
      "Promoção do Dia · 1 destaque",
      1,
      true,
      grade1,
      escalas
    ),
    montar(
      "promocao-do-dia-2",
      "Promoção do Dia · 2 itens",
      2,
      false,
      grade2,
      escalas
    ),
    montar(
      "promocao-do-dia-4",
      "Promoção do Dia · 4 itens",
      4,
      true,
      grade4,
      escalas
    ),
    montar(
      "promocao-do-dia-6",
      "Promoção do Dia · 6 itens",
      6,
      true,
      grade6,
      escalas
    ),
    montar(
      "promocao-do-dia-8",
      "Promoção do Dia · 8 itens",
      8,
      true,
      grade8,
      escalas
    ),
    montar(
      "promocao-do-dia-10",
      "Promoção do Dia · 10 itens",
      10,
      true,
      grade10,
      escalas
    ),
  ];
}

// Conveniencia para quem nao precisa de escala customizada
// (/temas, /temas/preview, o mapa padrao do EncartePreviewer).
export const TEMAS_PROMOCAO_DO_DIA = construirTemasPromocaoDoDia();
