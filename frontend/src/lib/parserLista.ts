export interface LinhaProcessada {
  linhaOriginal: string;
  nome: string;
  /** "1,48" no formato brasileiro, ou "" se a linha nao trouxe preco */
  preco: string;
  /** "UN", "KG", "BDJ" etc, ou "" se nao veio */
  unidade: string;
}

// Unidades comuns de hortifruti. A unidade pode vir tanto DEPOIS do
// preco ("Agriao 1,48 un") quanto ANTES ("Agriao un 1,48") - sem essa
// lista pra reconhecer o token, a forma "antes" gruda a unidade no
// nome (ex.: nome vira "Aipim kg" em vez de so "Aipim"), o que derruba
// bastante a busca difusa depois.
const UNIDADES_CONHECIDAS = new Set([
  "UN",
  "KG",
  "G",
  "GR",
  "BDJ",
  "BJ",
  "PCT",
  "PC",
  "MC",
  "MACO",
  "MAÇO",
  "DZ",
  "CX",
  "SC",
  "ML",
  "L",
  "FD",
  "FARDO",
]);

// Acha o preco em qualquer posicao da linha (com ou sem "R$" na
// frente); o resto da linha (antes e depois do preco) e onde nome e
// unidade podem estar, em qualquer ordem.
const REGEX_PRECO = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/;

function ehUnidade(token: string): boolean {
  return UNIDADES_CONHECIDAS.has(token.toUpperCase());
}

function parsearLinha(linhaOriginal: string): LinhaProcessada {
  const mPreco = linhaOriginal.match(REGEX_PRECO);
  if (!mPreco || mPreco.index === undefined) {
    // sem preco reconhecivel: a linha inteira vira o nome, e quem usa
    // o resultado decide como avisar o usuario
    return { linhaOriginal, nome: linhaOriginal, preco: "", unidade: "" };
  }

  const preco = mPreco[1];
  const antes = linhaOriginal.slice(0, mPreco.index).trim();
  const depois = linhaOriginal.slice(mPreco.index + mPreco[0].length).trim();

  // unidade logo depois do preco ("... 3,98 kg")
  const [tokenDepois, ...restoDepois] = depois.split(/\s+/);
  if (tokenDepois && ehUnidade(tokenDepois)) {
    const nome = [antes, ...restoDepois].filter(Boolean).join(" ");
    return { linhaOriginal, nome, preco, unidade: tokenDepois.toUpperCase() };
  }

  // ou logo antes do preco ("... kg 3,98")
  const partesAntes = antes.split(/\s+/).filter(Boolean);
  const ultimaPalavra = partesAntes[partesAntes.length - 1];
  if (partesAntes.length > 1 && ultimaPalavra && ehUnidade(ultimaPalavra)) {
    const nome = partesAntes.slice(0, -1).join(" ");
    return { linhaOriginal, nome, preco, unidade: ultimaPalavra.toUpperCase() };
  }

  // nenhuma unidade reconhecida - resto da linha (antes + depois) vira
  // so o nome, sem unidade
  const nome = [antes, depois].filter(Boolean).join(" ");
  return { linhaOriginal, nome, preco, unidade: "" };
}

export function parsearLista(texto: string): LinhaProcessada[] {
  return texto
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map(parsearLinha);
}
