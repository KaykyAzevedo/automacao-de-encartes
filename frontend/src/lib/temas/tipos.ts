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
  chamada: string;
  selo: string[];
  itens: ItemEncarte[];
  lojas: LojaEncarte[];
  validade: string;
}
