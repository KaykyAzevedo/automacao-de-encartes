import type { ThemeCompleto } from "@/hooks/useThemes";
import type { FormatoEncarte } from "@/types";

import type { SlotNome } from "./nome";
import type { Tema } from "./tipos";

const CAMPO_POR_FORMATO: Record<
  FormatoEncarte,
  | "format1Svg"
  | "format2Svg"
  | "format4Svg"
  | "format6Svg"
  | "format8Svg"
  | "format10Svg"
> = {
  1: "format1Svg",
  2: "format2Svg",
  4: "format4Svg",
  6: "format6Svg",
  8: "format8Svg",
  10: "format10Svg",
};

// Um Theme (banco, enviado em "Meus modelos") e SVG cru - a gente nao
// desenhou, entao nao sabe onde o nome de cada item deveria quebrar em
// duas linhas (diferente dos temas embutidos, que tem slotsNome exatos
// por posicao). larguraMax infinito faz quebrarNome() (nome.ts) sempre
// devolver uma linha so - a unica suposicao segura pra uma arte que o
// usuario desenhou sozinho; o proprio SVG dele e que decide como caber
// o texto.
const SLOT_SEM_QUEBRA: SlotNome = {
  x: 0,
  tamanho: 0,
  larguraMax: Number.POSITIVE_INFINITY,
  espacamento: 0,
};

// Ponte entre um Theme (banco) e o Tema que renderizarTema() (render.ts)
// espera - mesma convencao de marcadores {{ITEM_N_...}} usada pelos
// temas embutidos, so que o SVG em si vem do upload do usuario em vez
// de lib/temas/promocaoDoDia.ts.
export function temaDoCustomizado(
  theme: ThemeCompleto,
  formato: FormatoEncarte
): Tema {
  return {
    id: theme.id,
    nome: theme.themeName,
    formato,
    svg: theme[CAMPO_POR_FORMATO[formato]],
    slotsNome: Array.from({ length: formato }, () => SLOT_SEM_QUEBRA),
  };
}
