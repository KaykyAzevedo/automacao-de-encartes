// Tema "Promoção do Dia" - formato de 2 itens, 1080x1350 (feed).
// Os marcadores {{CHAVE}} sao trocados pelo render.
export const PROMOCAO_DO_DIA_2 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <defs>
    <linearGradient id="ouro" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fbf1cf"/>
      <stop offset="28%" stop-color="#e3c073"/>
      <stop offset="52%" stop-color="#a97c2c"/>
      <stop offset="70%" stop-color="#f0dca0"/>
      <stop offset="100%" stop-color="#8a6323"/>
    </linearGradient>

    <linearGradient id="ouroLinha" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8a6323" stop-opacity="0.2"/>
      <stop offset="50%" stop-color="#e3c073"/>
      <stop offset="100%" stop-color="#8a6323" stop-opacity="0.2"/>
    </linearGradient>

    <linearGradient id="molduraCard" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f3dfa4"/>
      <stop offset="35%" stop-color="#9b722a"/>
      <stop offset="60%" stop-color="#e8cd8c"/>
      <stop offset="100%" stop-color="#7d5a1f"/>
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
      <feMerge>
        <feMergeNode in="desfoque"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="brilhoSuave" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3" result="desfoque"/>
      <feMerge>
        <feMergeNode in="desfoque"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
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
      <circle cx="0" cy="0" r="21" fill="none" stroke="#c9a24a" stroke-width="2"/>
      <path d="M0,-11 C-6.2,-11 -11,-6.2 -11,0 C-11,7 0,13 0,13 C0,13 11,7 11,0 C11,-6.2 6.2,-11 0,-11 Z"
            fill="none" stroke="#e3c073" stroke-width="2.2"/>
      <circle cx="0" cy="-0.5" r="3.6" fill="#e3c073"/>
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

  <rect width="1080" height="1350" fill="url(#fundo)"/>
  <rect width="1080" height="1350" filter="url(#texturaFundo)" opacity="0.5"/>

  <g fill="none" stroke="url(#ouroLinha)" stroke-width="7" stroke-linecap="round" filter="url(#brilhoOuro)">
    <path d="M-20,215 C40,110 150,26 320,-12"/>
    <path d="M1100,215 C1040,110 930,26 760,-12"/>
  </g>
  <g fill="none" stroke="#8a6323" stroke-width="2" opacity="0.55">
    <path d="M-20,243 C44,132 160,44 330,4"/>
    <path d="M1100,243 C1036,132 920,44 750,4"/>
  </g>

  <g fill="url(#ouro)">
    <use href="#folhas" transform="translate(540,52) scale(0.72)"/>
  </g>
  <text class="script" x="540" y="152" text-anchor="middle" font-size="96" fill="#ffffff">Empório</text>
  <g stroke="#ffffff" stroke-width="1.6" opacity="0.85">
    <line x1="404" y1="181" x2="452" y2="181"/>
    <line x1="628" y1="181" x2="676" y2="181"/>
  </g>
  <text class="sans" x="540" y="188" text-anchor="middle" font-size="23"
        letter-spacing="9" fill="#ffffff" font-weight="500">HORTIFRUTI</text>

  <g class="sans" fill="#ececec" font-size="21" letter-spacing="4.5" font-weight="500">
    <text x="66" y="238">{{SELO_1}}</text>
    <text x="66" y="270">{{SELO_2}}</text>
    <text x="66" y="302">{{SELO_3}}</text>
  </g>
  <line x1="66" y1="330" x2="104" y2="330" stroke="#c9a24a" stroke-width="2.5"/>
  <g fill="url(#ouro)"><use href="#folhas" transform="translate(128,182) scale(0.9) rotate(-18)"/></g>

  <g transform="translate(972,262) rotate(-13)" class="mao" fill="#e3c073" font-size="40" text-anchor="middle">
    <text y="-46">Qualidade</text>
    <text y="0">sempre</text>
    <text y="46">para você!</text>
  </g>

  <g>
    <line x1="300" y1="248" x2="500" y2="248" stroke="url(#ouroLinha)" stroke-width="1.6"/>
    <line x1="580" y1="248" x2="780" y2="248" stroke="url(#ouroLinha)" stroke-width="1.6"/>
    <g fill="url(#ouro)"><use href="#folhas" transform="translate(540,252) scale(0.8)"/></g>
    <circle cx="516" cy="248" r="2.6" fill="#e3c073"/>
    <circle cx="564" cy="248" r="2.6" fill="#e3c073"/>
  </g>
  <text class="serifa" x="540" y="306" text-anchor="middle" font-size="38"
        letter-spacing="17" fill="url(#ouro)" font-weight="600">{{TITULO}}</text>
  <text class="serifa" x="540" y="410" text-anchor="middle" font-size="104"
        letter-spacing="4" fill="url(#ouro)" font-weight="700"
        filter="url(#brilhoSuave)">{{SUBTITULO}}</text>
  <g fill="#fbf1cf" opacity="0.9">
    <use href="#estrela" transform="translate(322,352) scale(0.85)"/>
    <use href="#estrela" transform="translate(762,368) scale(0.7)"/>
    <use href="#estrela" transform="translate(596,432) scale(0.55)"/>
  </g>

  <g>
    <rect x="52" y="452" width="468" height="632" rx="30"
          fill="url(#fundoCard)" stroke="url(#molduraCard)" stroke-width="3.5"/>
    <rect x="52" y="452" width="468" height="632" rx="30"
          fill="none" stroke="#e3c073" stroke-width="1" opacity="0.35"
          filter="url(#brilhoOuro)"/>

    <rect x="80" y="478" width="412" height="352" rx="14"
          fill="#101010" stroke="#3a3021" stroke-width="1.5" stroke-dasharray="7 7"/>
    <image href="{{ITEM_1_FOTO}}" x="80" y="478" width="412" height="352"
           preserveAspectRatio="xMidYMid meet"/>

    <g fill="url(#ouro)"><use href="#folhas" transform="translate(286,850) scale(0.58)"/></g>
    <line x1="88" y1="880" x2="168" y2="880" stroke="url(#ouroLinha)" stroke-width="1.4"/>
    <line x1="404" y1="880" x2="484" y2="880" stroke="url(#ouroLinha)" stroke-width="1.4"/>
    <text class="serifa" x="286" y="896" text-anchor="middle" font-size="44"
          letter-spacing="3" fill="url(#ouro)" font-weight="700">{{ITEM_1_NOME}}</text>

    <rect x="80" y="928" width="412" height="130" rx="18"
          fill="#0b0b0b" stroke="url(#molduraCard)" stroke-width="2.5"/>
    <text class="peso" x="112" y="1020" font-size="52" fill="url(#ouro)">R$</text>
    <text class="peso" x="292" y="1030" text-anchor="middle" font-size="96"
          fill="#f7ead0">{{ITEM_1_PRECO}}</text>
    <text class="peso" x="462" y="1010" text-anchor="end" font-size="44"
          fill="#f7ead0">{{ITEM_1_UNIDADE}}</text>
  </g>

  <g>
    <rect x="560" y="452" width="468" height="632" rx="30"
          fill="url(#fundoCard)" stroke="url(#molduraCard)" stroke-width="3.5"/>
    <rect x="560" y="452" width="468" height="632" rx="30"
          fill="none" stroke="#e3c073" stroke-width="1" opacity="0.35"
          filter="url(#brilhoOuro)"/>

    <rect x="588" y="478" width="412" height="352" rx="14"
          fill="#101010" stroke="#3a3021" stroke-width="1.5" stroke-dasharray="7 7"/>
    <image href="{{ITEM_2_FOTO}}" x="588" y="478" width="412" height="352"
           preserveAspectRatio="xMidYMid meet"/>

    <g fill="url(#ouro)"><use href="#folhas" transform="translate(794,850) scale(0.58)"/></g>
    <line x1="596" y1="880" x2="676" y2="880" stroke="url(#ouroLinha)" stroke-width="1.4"/>
    <line x1="912" y1="880" x2="992" y2="880" stroke="url(#ouroLinha)" stroke-width="1.4"/>
    <text class="serifa" x="794" y="896" text-anchor="middle" font-size="44"
          letter-spacing="3" fill="url(#ouro)" font-weight="700">{{ITEM_2_NOME}}</text>

    <rect x="588" y="928" width="412" height="130" rx="18"
          fill="#0b0b0b" stroke="url(#molduraCard)" stroke-width="2.5"/>
    <text class="peso" x="620" y="1020" font-size="52" fill="url(#ouro)">R$</text>
    <text class="peso" x="800" y="1030" text-anchor="middle" font-size="96"
          fill="#f7ead0">{{ITEM_2_PRECO}}</text>
    <text class="peso" x="970" y="1010" text-anchor="end" font-size="44"
          fill="#f7ead0">{{ITEM_2_UNIDADE}}</text>
  </g>

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
        fill="none" stroke="#8a6323" stroke-width="1.6"/>
  <g fill="url(#ouro)">
    <use href="#folhas" transform="translate(92,1301) scale(0.52)"/>
    <use href="#folhas" transform="translate(988,1301) scale(0.52)"/>
  </g>
  <text class="sans" x="540" y="1308" text-anchor="middle" font-size="18"
        letter-spacing="3.2" fill="url(#ouro)" font-weight="500">PROMOÇÃO VÁLIDA {{VALIDADE}} OU ENQUANTO DURAR NOSSO ESTOQUE</text>
</svg>
`;
