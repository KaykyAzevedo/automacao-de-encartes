export interface LinhaProcessada {
  linhaOriginal: string;
  nome: string;
  /** "1,48" no formato brasileiro, ou "" se a linha nao trouxe preco */
  preco: string;
  /** "UN", "KG", "BDJ" etc, ou "" se nao veio */
  unidade: string;
}

// Ex.: "Agrião 1,48 un", "Uva Thompson R$ 7,98 BDJ", "Maçã 3,99"
const REGEX_LINHA =
  /^(.+?)\s+(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})\s*([A-Za-zÀ-ÿ/]{0,6})\s*$/;

export function parsearLista(texto: string): LinhaProcessada[] {
  return texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map((linhaOriginal) => {
      const m = linhaOriginal.match(REGEX_LINHA);
      if (!m) {
        // sem preco reconhecivel: a linha inteira vira o nome, e quem
        // usa o resultado decide como avisar o usuario
        return { linhaOriginal, nome: linhaOriginal, preco: "", unidade: "" };
      }
      const [, nome, preco, unidade] = m;
      return {
        linhaOriginal,
        nome: nome.trim(),
        preco,
        unidade: unidade.trim().toUpperCase(),
      };
    });
}
