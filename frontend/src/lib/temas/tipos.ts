import type { SlotNome } from "./nome";

export interface ItemEncarte {
  nome: string;
  preco: string;
  unidade: string;
  fotoUrl: string;
}

export interface LojaEncarte {
  nome: string;
  endereco: string;
  whatsapp: string;
}

export interface DadosEncarte {
  titulo: string;
  subtitulo: string;
  selo: string[];
  itens: ItemEncarte[];
  lojas: LojaEncarte[];
  validade: string;
}

export interface Tema {
  id: string;
  nome: string;
  /** quantos produtos a grade comporta */
  formato: number;
  svg: string;
  /** posicao e corpo do nome de cada item, usado para quebrar em duas linhas */
  slotsNome: SlotNome[];
}
