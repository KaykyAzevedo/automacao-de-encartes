// SVG nao mede texto, entao a largura e estimada. O fator vem da
// Cinzel em caixa alta: cada caractere ocupa cerca de 0.66 do corpo.
const FATOR_LARGURA = 0.66;

export interface SlotNome {
  x: number;
  tamanho: number;
  larguraMax: number;
  espacamento: number;
}

function larguraEstimada(texto: string, slot: SlotNome): number {
  return texto.length * (FATOR_LARGURA * slot.tamanho + slot.espacamento);
}

// Quebra em no maximo duas linhas, sempre entre palavras. Nome de uma
// palavra so nao tem onde quebrar e fica como esta.
export function quebrarNome(nome: string, slot: SlotNome): string[] {
  if (larguraEstimada(nome, slot) <= slot.larguraMax) return [nome];

  const palavras = nome.trim().split(/\s+/);
  if (palavras.length < 2) return [nome];

  // procura o corte que deixa as duas linhas mais equilibradas
  let melhorCorte = 1;
  let melhorDiferenca = Infinity;

  for (let corte = 1; corte < palavras.length; corte++) {
    const a = palavras.slice(0, corte).join(" ");
    const b = palavras.slice(corte).join(" ");
    const diferenca = Math.abs(
      larguraEstimada(a, slot) - larguraEstimada(b, slot)
    );
    if (diferenca < melhorDiferenca) {
      melhorDiferenca = diferenca;
      melhorCorte = corte;
    }
  }

  return [
    palavras.slice(0, melhorCorte).join(" "),
    palavras.slice(melhorCorte).join(" "),
  ];
}

// Monta os tspans ja centrados: com duas linhas o bloco sobe metade da
// entrelinha, para o conjunto continuar centrado na mesma baseline.
export function tspansDoNome(
  nome: string,
  slot: SlotNome,
  escapar: (v: string) => string
): string {
  const linhas = quebrarNome(nome, slot);
  if (linhas.length === 1) {
    return escapar(linhas[0]);
  }

  const entrelinha = slot.tamanho * 0.92;
  return (
    `<tspan x="${slot.x}" dy="${(-entrelinha / 2).toFixed(1)}">${escapar(linhas[0])}</tspan>` +
    `<tspan x="${slot.x}" dy="${entrelinha.toFixed(1)}">${escapar(linhas[1])}</tspan>`
  );
}
