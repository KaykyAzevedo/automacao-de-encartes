import type { DadosEncarte } from "./tipos";

// Dados iguais aos do encarte de referencia, para comparar lado a lado.
export const EXEMPLO_PROMOCAO_DO_DIA: DadosEncarte = {
  titulo: "PROMOÇÃO",
  subtitulo: "DO DIA",
  chamada: "Qualidade sempre para você!",
  selo: ["FRUTAS", "FRESCAS", "TODO DIA"],
  itens: [
    { nome: "LARANJA", preco: "3,98", unidade: "KG", fotoUrl: "" },
    { nome: "CAJU", preco: "6,98", unidade: "BDJ", fotoUrl: "" },
  ],
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
