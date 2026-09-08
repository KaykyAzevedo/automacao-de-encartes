import {
  Anton,
  Caveat,
  Cinzel,
  Montserrat,
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

export const classesDeFonte = [
  fonteScript.variable,
  fonteSerifa.variable,
  fontePeso.variable,
  fonteSans.variable,
  fonteMao.variable,
].join(" ");
