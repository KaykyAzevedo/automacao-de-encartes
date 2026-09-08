import type { DadosEncarte, ItemEncarte } from "./tipos";

// Produtos reais dos encartes do Empório, incluindo nomes longos como
// "ABÓBORA SERGIPANA", que servem para conferir a quebra em duas linhas.
const CATALOGO: ItemEncarte[] = [
  {
    nome: "LARANJA PERA",
    preco: "3,98",
    unidade: "KG",
    fotoUrl: "/banco-fotos/laranja-pera.png",
  },
  {
    nome: "CAQUI",
    preco: "6,98",
    unidade: "BDJ",
    fotoUrl: "/banco-fotos/caqui.png",
  },
  {
    nome: "BRÓCOLIS AMERICANO",
    preco: "5,98",
    unidade: "UN",
    fotoUrl: "/banco-fotos/brocolis-americano.png",
  },
  {
    nome: "COUVE FLOR",
    preco: "6,98",
    unidade: "UN",
    fotoUrl: "/banco-fotos/couve-flor.png",
  },
  {
    nome: "MORANGO BDJ",
    preco: "7,98",
    unidade: "BDJ",
    fotoUrl: "/banco-fotos/morango-bdj.png",
  },
  {
    nome: "CENOURA",
    preco: "4,98",
    unidade: "BDJ",
    fotoUrl: "/banco-fotos/cenoura.png",
  },
  {
    nome: "ABÓBORA SERGIPANA",
    preco: "3,98",
    unidade: "KG",
    fotoUrl: "/banco-fotos/abobora-sergipana.png",
  },
  {
    nome: "MAMÃO PAPAIA",
    preco: "5,98",
    unidade: "KG",
    fotoUrl: "/banco-fotos/mamao-papaia.png",
  },
  {
    nome: "BATATA DOCE",
    preco: "4,98",
    unidade: "KG",
    fotoUrl: "/banco-fotos/batata-doce.png",
  },
  {
    nome: "MANGA PALMER",
    preco: "5,98",
    unidade: "KG",
    fotoUrl: "/banco-fotos/manga-palmer.png",
  },
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
};

// Data sempre a de hoje - nunca fixa, pra nao ficar desatualizada como
// um valor gravado no codigo ficaria a partir do dia seguinte.
function validadeHoje(): string {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function exemploCom(quantidade: number): DadosEncarte {
  return {
    ...BASE,
    validade: validadeHoje(),
    itens: CATALOGO.slice(0, quantidade),
  };
}
