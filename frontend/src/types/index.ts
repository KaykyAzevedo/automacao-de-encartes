export type FormatoEncarte = 1 | 4 | 8 | 10;

export type TamanhoSaida = "feed" | "stories";

export interface Produto {
  id: string;
  nome: string;
  preco: number;
  imagemUrl: string | null;
}

export interface ItemEncarte {
  produto: Produto;
  escalaFoto: number;
  escalaNome: number;
  escalaPreco: number;
}

export interface Tema {
  id: string;
  nome: string;
  diaSemana: number;
  fundoUrl: string;
}
