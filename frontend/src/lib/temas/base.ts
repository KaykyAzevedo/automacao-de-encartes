// Partes compartilhadas por todos os formatos do tema "Promoção do Dia".
// Cada formato monta seu SVG a partir daqui e desenha so a grade de itens.

export const DEFS = `
  <defs>
    <linearGradient id="ouro" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff8df"/>
      <stop offset="26%" stop-color="#ffd54a"/>
      <stop offset="52%" stop-color="#e0a318"/>
      <stop offset="72%" stop-color="#fff0ae"/>
      <stop offset="100%" stop-color="#b8860f"/>
    </linearGradient>

    <linearGradient id="ouroLinha" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b8860f" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#ffd54a"/>
      <stop offset="100%" stop-color="#b8860f" stop-opacity="0.25"/>
    </linearGradient>

    <linearGradient id="molduraCard" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff2c2"/>
      <stop offset="35%" stop-color="#d4990f"/>
      <stop offset="60%" stop-color="#ffe27a"/>
      <stop offset="100%" stop-color="#a3760a"/>
    </linearGradient>

    <linearGradient id="fundoCard" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#181818"/>
      <stop offset="55%" stop-color="#0e0e0e"/>
      <stop offset="100%" stop-color="#141414"/>
    </linearGradient>

    <radialGradient id="fundo" cx="50%" cy="38%" r="78%">
      <stop offset="0%" stop-color="#1c1c1c"/>
      <stop offset="60%" stop-color="#0d0d0d"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>

    <filter id="brilhoOuro" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="7" result="desfoque"/>
      <feMerge><feMergeNode in="desfoque"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <filter id="brilhoSuave" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3" result="desfoque"/>
      <feMerge><feMergeNode in="desfoque"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <filter id="texturaFundo">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
    </filter>

    <g id="folhas">
      <path d="M0,0 C-5,-9 -17,-12 -27,-5 C-17,3 -5,7 0,0 Z"/>
      <path d="M0,0 C5,-9 17,-12 27,-5 C17,3 5,7 0,0 Z"/>
      <path d="M0,-1 C-2,-9 -1,-15 0,-19 C1,-15 2,-9 0,-1 Z"/>
    </g>

    <g id="estrela">
      <path d="M0,-13 Q1.6,-1.6 13,0 Q1.6,1.6 0,13 Q-1.6,1.6 -13,0 Q-1.6,-1.6 0,-13 Z"/>
    </g>

    <g id="pino">
      <circle cx="0" cy="0" r="21" fill="none" stroke="#ffd54a" stroke-width="2"/>
      <path d="M0,-11 C-6.2,-11 -11,-6.2 -11,0 C-11,7 0,13 0,13 C0,13 11,7 11,0 C11,-6.2 6.2,-11 0,-11 Z"
            fill="none" stroke="#ffd54a" stroke-width="2.2"/>
      <circle cx="0" cy="-0.5" r="3.6" fill="#ffd54a"/>
    </g>

    <g id="zap">
      <circle cx="0" cy="0" r="11" fill="none" stroke="#cfcfcf" stroke-width="1.8"/>
      <path d="M-4.4,4.6 L-5.6,7.2 L-2.8,6.1" fill="none" stroke="#cfcfcf" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M-3,-3.4 C-3.4,-1 -1.6,1.8 1,3 C2.4,3.6 3.4,2.6 3.6,1.6 L1.6,0.6 L0.6,1.8 C-0.4,1.2 -1.4,0.2 -1.8,-0.8 L-0.6,-1.8 L-1.6,-3.8 C-2.4,-3.8 -2.9,-3.6 -3,-3.4 Z" fill="#cfcfcf"/>
    </g>
  </defs>

  <style>
    .script { font-family: var(--fonte-script), cursive; }
    .serifa { font-family: var(--fonte-serifa), serif; }
    .peso   { font-family: var(--fonte-peso), sans-serif; }
    .sans   { font-family: var(--fonte-sans), sans-serif; }
    .mao    { font-family: var(--fonte-mao), cursive; }
  </style>
`;

export const FUNDO = `
  <rect width="1080" height="1350" fill="url(#fundo)"/>
  <rect width="1080" height="1350" filter="url(#texturaFundo)" opacity="0.5"/>

  <g fill="none" stroke="url(#ouroLinha)" stroke-width="7" stroke-linecap="round" filter="url(#brilhoOuro)">
    <path d="M-20,215 C40,110 150,26 320,-12"/>
    <path d="M1100,215 C1040,110 930,26 760,-12"/>
  </g>
  <g fill="none" stroke="#b8860f" stroke-width="2" opacity="0.55">
    <path d="M-20,243 C44,132 160,44 330,4"/>
    <path d="M1100,243 C1036,132 920,44 750,4"/>
  </g>
`;

// Duas alturas de cabecalho: a versao alta sobra espaco quando ha 1 ou 2
// itens; a compacta libera altura para as grades de 4, 6 e 8.
export function cabecalho(compacto: boolean): string {
  if (!compacto) {
    return `
  <image href="/marca/logo-emporio-branco.png" x="350" y="8" width="380" height="208"
         preserveAspectRatio="xMidYMid meet"/>

  <g class="sans" fill="#ececec" font-size="21" letter-spacing="4.5" font-weight="500">
    <text x="66" y="238">{{SELO_1}}</text>
    <text x="66" y="270">{{SELO_2}}</text>
    <text x="66" y="302">{{SELO_3}}</text>
  </g>
  <line x1="66" y1="330" x2="104" y2="330" stroke="#ffd54a" stroke-width="2.5"/>
  <g fill="url(#ouro)"><use href="#folhas" transform="translate(128,182) scale(0.9) rotate(-18)"/></g>

  <g transform="translate(972,262) rotate(-13)" class="mao" fill="#ffd54a" font-size="40" text-anchor="middle">
    <text y="-46">Qualidade</text>
    <text y="0">sempre</text>
    <text y="46">para você!</text>
  </g>

  <line x1="300" y1="248" x2="500" y2="248" stroke="url(#ouroLinha)" stroke-width="1.6"/>
  <line x1="580" y1="248" x2="780" y2="248" stroke="url(#ouroLinha)" stroke-width="1.6"/>
  <g fill="url(#ouro)"><use href="#folhas" transform="translate(540,252) scale(0.8)"/></g>
  <circle cx="516" cy="248" r="2.6" fill="#ffd54a"/>
  <circle cx="564" cy="248" r="2.6" fill="#ffd54a"/>

  <text class="serifa" x="540" y="306" text-anchor="middle" font-size="38"
        letter-spacing="17" fill="url(#ouro)" font-weight="600">{{TITULO}}</text>
  <text class="serifa" x="540" y="410" text-anchor="middle" font-size="104"
        letter-spacing="4" fill="url(#ouro)" font-weight="700"
        filter="url(#brilhoSuave)">{{SUBTITULO}}</text>
  <g fill="#fbf1cf" opacity="0.9">
    <use href="#estrela" transform="translate(322,352) scale(0.85)"/>
    <use href="#estrela" transform="translate(762,368) scale(0.7)"/>
  </g>
`;
  }

  return `
  <image href="/marca/logo-emporio-branco.png" x="390" y="6" width="300" height="164"
         preserveAspectRatio="xMidYMid meet"/>

  <g class="sans" fill="#ececec" font-size="18" letter-spacing="4" font-weight="500">
    <text x="60" y="196">{{SELO_1}}</text>
    <text x="60" y="223">{{SELO_2}}</text>
    <text x="60" y="250">{{SELO_3}}</text>
  </g>
  <line x1="60" y1="274" x2="92" y2="274" stroke="#ffd54a" stroke-width="2.2"/>

  <g transform="translate(978,218) rotate(-13)" class="mao" fill="#ffd54a" font-size="33" text-anchor="middle">
    <text y="-38">Qualidade</text>
    <text y="0">sempre</text>
    <text y="38">para você!</text>
  </g>

  <line x1="316" y1="204" x2="496" y2="204" stroke="url(#ouroLinha)" stroke-width="1.4"/>
  <line x1="584" y1="204" x2="764" y2="204" stroke="url(#ouroLinha)" stroke-width="1.4"/>
  <g fill="url(#ouro)"><use href="#folhas" transform="translate(540,208) scale(0.68)"/></g>

  <text class="serifa" x="540" y="256" text-anchor="middle" font-size="30"
        letter-spacing="13" fill="url(#ouro)" font-weight="600">{{TITULO}}</text>
  <text class="serifa" x="540" y="336" text-anchor="middle" font-size="80"
        letter-spacing="3" fill="url(#ouro)" font-weight="700"
        filter="url(#brilhoSuave)">{{SUBTITULO}}</text>
  <g fill="#fbf1cf" opacity="0.9">
    <use href="#estrela" transform="translate(348,292) scale(0.7)"/>
    <use href="#estrela" transform="translate(740,304) scale(0.58)"/>
  </g>
`;
}

export const RODAPE = `
  <g fill="url(#ouro)"><use href="#pino" transform="translate(132,1178)"/></g>
  <text class="serifa" x="176" y="1160" font-size="34" letter-spacing="2"
        fill="url(#ouro)" font-weight="700">{{LOJA_1_NOME}}</text>
  <text class="sans" x="176" y="1196" font-size="21" letter-spacing="1.2"
        fill="#e6e6e6">{{LOJA_1_ENDERECO}}</text>
  <g><use href="#zap" transform="translate(187,1230)"/></g>
  <text class="sans" x="206" y="1237" font-size="19" letter-spacing="1.2"
        fill="#e6e6e6">WHATSAPP: {{LOJA_1_WHATSAPP}}</text>

  <line x1="540" y1="1136" x2="540" y2="1206" stroke="url(#ouroLinha)" stroke-width="1.4"/>
  <g fill="url(#ouro)"><use href="#folhas" transform="translate(540,1236) scale(0.6)"/></g>

  <g fill="url(#ouro)"><use href="#pino" transform="translate(598,1178)"/></g>
  <text class="serifa" x="642" y="1160" font-size="34" letter-spacing="2"
        fill="url(#ouro)" font-weight="700">{{LOJA_2_NOME}}</text>
  <text class="sans" x="642" y="1196" font-size="21" letter-spacing="1.2"
        fill="#e6e6e6">{{LOJA_2_ENDERECO}}</text>
  <g><use href="#zap" transform="translate(653,1230)"/></g>
  <text class="sans" x="672" y="1237" font-size="19" letter-spacing="1.2"
        fill="#e6e6e6">WHATSAPP: {{LOJA_2_WHATSAPP}}</text>

  <rect x="52" y="1276" width="976" height="50" rx="25"
        fill="none" stroke="#b8860f" stroke-width="1.6"/>
  <g fill="url(#ouro)">
    <use href="#folhas" transform="translate(92,1301) scale(0.52)"/>
    <use href="#folhas" transform="translate(988,1301) scale(0.52)"/>
  </g>
  <text class="sans" x="540" y="1308" text-anchor="middle" font-size="18"
        letter-spacing="3.2" fill="url(#ouro)" font-weight="500">PROMOÇÃO VÁLIDA {{VALIDADE}} OU ENQUANTO DURAR NOSSO ESTOQUE</text>
`;

export function documento(conteudo: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">${DEFS}${FUNDO}${conteudo}${RODAPE}</svg>`;
}

// Usado só pelo tema "8 itens clássico": a moldura, a logo, o título,
// as folhas decorativas e o rodapé já vêm prontos numa imagem de fundo
// (réplica exata de uma arte pronta do usuário) - sem FUNDO nem RODAPE
// compartilhados aqui, só as defs (gradiente "ouro", classes de fonte)
// que o conteúdo dinâmico (foto, nome, preço, data) precisa pra se
// desenhar por cima com a mesma cara do resto da família de temas.
export function documentoComFundoFixo(conteudo: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">${DEFS}${conteudo}</svg>`;
}
