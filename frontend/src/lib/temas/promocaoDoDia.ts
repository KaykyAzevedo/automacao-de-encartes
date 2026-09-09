import { cabecalho, documento, documentoComFundoFixo } from "./base";
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
//
// Centralizacao vertical via dominant-baseline="central" (usa a
// metrica real da fonte) em vez de um deslocamento manual a partir da
// baseline. Mesmo assim a fonte ".peso" sobra ~6% do corpo pra baixo
// do centro real (medido pixel a pixel) - o ajusteFino compensa isso
// pros numeros ficarem simetricos de verdade, pra cima e pra baixo.
function preco(
  n: number,
  caixa: Caixa,
  corpo: number,
  escala: number,
  corNumero = "url(#ouro)",
  brilho = true,
  // false no tema "8 itens classico": a caixinha do preco ja vem
  // desenhada na imagem de fundo, nao precisa redesenhar por cima.
  comCaixa = true
): string {
  const { x, y, w, h } = caixa;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const meio = y + h / 2;
  const ajusteFino = corpo * 0.06;
  return `
  <g transform="translate(${cx},${cy}) scale(${escala.toFixed(3)}) translate(${-cx},${-cy})">
    ${
      comCaixa
        ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"
          fill="#0b0b0b" stroke="url(#molduraCard)" stroke-width="2.2"/>`
        : ""
    }
    <text class="peso" x="${x + w * 0.09}" y="${meio - ajusteFino}" dominant-baseline="central"
          font-size="${(corpo * 0.55).toFixed(0)}" fill="url(#ouro)">R$</text>
    <text class="peso" x="${x + w * 0.53}" y="${meio - ajusteFino}" dominant-baseline="central" text-anchor="middle"
          font-size="${corpo}" fill="${corNumero}"${brilho ? ' filter="url(#brilhoSuave)"' : ""}>{{ITEM_${n}_PRECO}}</text>
    <text class="peso" x="${x + w - w * 0.06}" y="${meio - ajusteFino}" dominant-baseline="central" text-anchor="end"
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

// ---------- 8 itens "classico": replica pixel a pixel de uma arte
// pronta do usuario ----------
// Bem diferente do resto da familia: aqui a moldura dos cards, a logo,
// o titulo e as folhas decorativas ja vem prontos numa imagem de fundo
// (public/temas/promocao-do-dia-8-itens-classico.png, exportada em
// branco pelo usuario) - o codigo aqui desenha por cima o que muda de
// fato: foto, nome, moldura do preco + preco/unidade, endereco das
// duas lojas e a data.
const FUNDO_CLASSICO_8_ITENS = "/temas/promocao-do-dia-8-itens-classico.png";

// A imagem de referencia e 1092x1440 (nao e exatamente a proporcao
// 4:5/1080x1350 do resto dos temas). "meet" dentro do viewBox 1080x1350
// escala pela altura (fator 1350/1440) e sobra uma faixinha preta dos
// dois lados - invisivel, o fundo da imagem ja e preto. Toda posicao
// abaixo foi medida pixel a pixel na imagem ORIGINAL (1092x1440) e
// convertida por esse fator - nx()/ny()/nd() fazem essa conversao.
const ESCALA_FUNDO_CLASSICO = 1350 / 1440;
const OFFSET_X_FUNDO_CLASSICO = (1080 - 1092 * ESCALA_FUNDO_CLASSICO) / 2;

function nx(nativeX: number): number {
  return OFFSET_X_FUNDO_CLASSICO + nativeX * ESCALA_FUNDO_CLASSICO;
}
function ny(nativeY: number): number {
  return nativeY * ESCALA_FUNDO_CLASSICO;
}
function nd(nativeDelta: number): number {
  return nativeDelta * ESCALA_FUNDO_CLASSICO;
}

function grade8(escalas: EscalasTema): ResultadoGrade {
  const partes: string[] = [
    `<image href="${FUNDO_CLASSICO_8_ITENS}" x="0" y="0" width="1080" height="1350"
            preserveAspectRatio="xMidYMid meet"/>`,
  ];
  const slots: SlotNome[] = [];

  // Cantos superiores esquerdos de cada card, medidos na imagem original.
  const colunasNativas = [20, 557];
  const linhasNativas = [350, 548, 746, 944];
  const alturaCardNativa = 175;

  linhasNativas.forEach((yCard, li) => {
    colunasNativas.forEach((xCard, ci) => {
      const n = li * 2 + ci + 1;

      const fotoCaixa: Caixa = {
        x: nx(xCard + 10),
        y: ny(yCard + 8),
        w: nd(220),
        h: nd(alturaCardNativa - 16),
      };
      const textoEsq = nx(xCard + 245);
      const textoDir = nx(xCard + 480);
      const cx = (textoEsq + textoDir) / 2;
      const nomeBaseline = ny(yCard + 51);
      const precoCaixa: Caixa = {
        x: nx(xCard + 249),
        y: ny(yCard + 80),
        w: nd(228),
        h: nd(90),
      };

      partes.push(
        foto(n, fotoCaixa, escalas.foto),
        // nome() padrao (linhas, sem folha) - essa versao da imagem de
        // fundo nao traz mais essa faixa pronta, ao contrario da
        // primeira que o usuario mandou
        nome(n, cx, nomeBaseline, 19, textoEsq, textoDir, escalas.nome),
        // com moldura propria agora (comCaixa=true) - a caixinha de
        // preco tambem nao vem mais pronta na imagem
        preco(n, precoCaixa, 48, escalas.preco, "#f7ead0", false, true)
      );
      slots.push({
        x: cx,
        tamanho: 19,
        larguraMax: textoDir - textoEsq - 16,
        espacamento: 1.6,
      });
    });
  });

  // Endereco das duas lojas: essa versao da imagem de fundo deixou o
  // vao entre a grade e a barra de validade completamente vazio (a
  // primeira versao trazia isso pronto) - mesmo padrao visual do
  // RODAPE compartilhado (pino, nome, endereco, whatsapp, divisoria),
  // so deslocado pra caber nesse vao especifico.
  const yEndereco = 1076;
  partes.push(`
    <g fill="url(#ouro)"><use href="#pino" transform="translate(132,${yEndereco + 42})"/></g>
    <text class="serifa" x="176" y="${yEndereco + 24}" font-size="30" letter-spacing="2"
          fill="url(#ouro)" font-weight="700">{{LOJA_1_NOME}}</text>
    <text class="sans" x="176" y="${yEndereco + 58}" font-size="19" letter-spacing="1.1"
          fill="#e6e6e6">{{LOJA_1_ENDERECO}}</text>
    <g><use href="#zap" transform="translate(187,${yEndereco + 90})"/></g>
    <text class="sans" x="206" y="${yEndereco + 97}" font-size="17" letter-spacing="1.1"
          fill="#e6e6e6">WHATSAPP: {{LOJA_1_WHATSAPP}}</text>

    <line x1="540" y1="${yEndereco}" x2="540" y2="${yEndereco + 68}" stroke="url(#ouroLinha)" stroke-width="1.4"/>

    <g fill="url(#ouro)"><use href="#pino" transform="translate(598,${yEndereco + 42})"/></g>
    <text class="serifa" x="642" y="${yEndereco + 24}" font-size="30" letter-spacing="2"
          fill="url(#ouro)" font-weight="700">{{LOJA_2_NOME}}</text>
    <text class="sans" x="642" y="${yEndereco + 58}" font-size="19" letter-spacing="1.1"
          fill="#e6e6e6">{{LOJA_2_ENDERECO}}</text>
    <g><use href="#zap" transform="translate(653,${yEndereco + 90})"/></g>
    <text class="sans" x="672" y="${yEndereco + 97}" font-size="17" letter-spacing="1.1"
          fill="#e6e6e6">WHATSAPP: {{LOJA_2_WHATSAPP}}</text>
  `);

  // Data: unico texto do rodape que a barra de validade deixa vazio.
  partes.push(
    `<text class="sans" x="${nx(547)}" y="${ny(1310)}" dominant-baseline="central" text-anchor="middle"
           font-size="17" letter-spacing="2.8" fill="url(#ouro)" font-weight="500">PROMOÇÃO VÁLIDA {{VALIDADE}} OU ENQUANTO DURAR NOSSO ESTOQUE</text>`
  );

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

// O "8 itens classico" nao usa cabecalho()/FUNDO/RODAPE compartilhados
// (a imagem de fundo ja traz tudo isso pronto - ver grade8()), entao
// monta o documento direto em vez de passar por montar().
function montarComFundoFixo(
  id: string,
  rotulo: string,
  formato: number,
  gradeFn: FuncaoGrade,
  escalas: EscalasTema
): Tema {
  const grade = gradeFn(escalas);
  return {
    id,
    nome: rotulo,
    formato,
    svg: documentoComFundoFixo(grade.svg),
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
    montarComFundoFixo(
      "promocao-do-dia-8",
      "Promoção do Dia · 8 itens",
      8,
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
