import {
  Anton,
  Bebas_Neue,
  Caveat,
  Cinzel,
  Inter,
  Montserrat,
  Oswald,
  Pinyon_Script,
} from "next/font/google";

// Aproximacoes livres das fontes do encarte original. O script do logo
// e a serifa do titulo sao as que mais pesam no reconhecimento da marca.
export const fonteScript = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--fonte-script",
  display: "swap",
});

export const fonteSerifa = Cinzel({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--fonte-serifa",
  display: "swap",
});

export const fontePeso = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--fonte-peso",
  display: "swap",
});

export const fonteSans = Montserrat({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--fonte-sans",
  display: "swap",
});

export const fonteMao = Caveat({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--fonte-mao",
  display: "swap",
});

// Etapa 30: mais 2 opcoes pro seletor de fonte por elemento (nome,
// preco, unidade) na tela de gerar encarte - condensadas, boas pra
// numero de preco e destaque, sem repetir o peso "Anton" que ja
// existia. Todas do Google Fonts, licenca OFL (uso comercial livre).
export const fonteBebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--fonte-bebas",
  display: "swap",
});

export const fonteOswald = Oswald({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--fonte-oswald",
  display: "swap",
});

// Etapa 26: fonte da INTERFACE do app (botoes, menus, textos de tela)
// - nao confundir com as fontes acima, usadas so dentro dos templates
// SVG do encarte em si (lib/temas/base.ts). Aplicada globalmente via
// tailwind.config.ts (theme.fontFamily.sans), nao precisa de classe
// manual em cada componente.
export const fonteInterface = Inter({
  subsets: ["latin"],
  variable: "--fonte-interface",
  display: "swap",
});

export const classesDeFonte = [
  fonteScript.variable,
  fonteSerifa.variable,
  fontePeso.variable,
  fonteSans.variable,
  fonteMao.variable,
  fonteInterface.variable,
  fonteBebas.variable,
  fonteOswald.variable,
].join(" ");
