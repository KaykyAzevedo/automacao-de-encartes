import type { DadosEncarte, ItemEncarte } from "./tipos";

// Produtos reais dos encartes do Empório, incluindo nomes longos como
// "ABÓBORA SERGIPANA", que servem para conferir a quebra em duas linhas.
const CATALOGO: ItemEncarte[] = [
  { nome: "LARANJA", preco: "3,98", unidade: "KG", fotoUrl: "" },
  { nome: "CAJU", preco: "6,98", unidade: "BDJ", fotoUrl: "" },
  { nome: "BRÓCOLIS USA", preco: "5,98", unidade: "UN", fotoUrl: "" },
  { nome: "COUVE FLOR", preco: "6,98", unidade: "UN", fotoUrl: "" },
  { nome: "UVA VITÓRIA", preco: "7,98", unidade: "BDJ", fotoUrl: "" },
  { nome: "CENOURA", preco: "4,98", unidade: "BDJ", fotoUrl: "" },
  { nome: "ABÓBORA SERGIPANA", preco: "3,98", unidade: "KG", fotoUrl: "" },
  { nome: "OVO CARTELA C/20", preco: "11,98", unidade: "BDJ", fotoUrl: "" },
];

const BASE = {
  titulo: "PROMOÇÃO",
  subtitulo: "DO DIA",
  selo: ["FRUTAS", "FRESCAS", "TODO DIA"],
  lojas: [
    {
      nome: "FREGUESIA",
      endereco: "ESTRADA DO BANANAL, 477",
      whatsapp: "(21) 97384-7640",
    },
    {
      nome: "BARRA DA TIJUCA",
      endereco: "RUA GILDÁSIO AMADO, 55 - LOJA A",
      whatsapp: "(21) 97510-3253",
    },
  ],
  validade: "08/09",
};

export function exemploCom(quantidade: number): DadosEncarte {
  return { ...BASE, itens: CATALOGO.slice(0, quantidade) };
}
