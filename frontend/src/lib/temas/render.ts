import { tspansDoNome } from "./nome";
import type { DadosEncarte, Tema } from "./tipos";

// Os templates guardam marcadores {{CHAVE}}. Renderizar e trocar cada
// marcador pelo valor, escapando o que vira texto no SVG.
export function escapar(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderizarTema(tema: Tema, dados: DadosEncarte): string {
  const mapa: Record<string, string> = {
    TITULO: escapar(dados.titulo),
    SUBTITULO: escapar(dados.subtitulo),
    VALIDADE: escapar(dados.validade),
  };

  dados.selo.forEach((linha, i) => {
    mapa[`SELO_${i + 1}`] = escapar(linha);
  });

  dados.lojas.forEach((loja, i) => {
    const n = i + 1;
    mapa[`LOJA_${n}_NOME`] = escapar(loja.nome);
    mapa[`LOJA_${n}_ENDERECO`] = escapar(loja.endereco);
    mapa[`LOJA_${n}_WHATSAPP`] = escapar(loja.whatsapp);
  });

  // um slot por posicao da grade; sobra vira vazio, e nao quebra o SVG
  tema.slotsNome.forEach((slot, i) => {
    const n = i + 1;
    const item = dados.itens[i];
    mapa[`ITEM_${n}_NOME`] = item ? tspansDoNome(item.nome, slot, escapar) : "";
    mapa[`ITEM_${n}_PRECO`] = item ? escapar(item.preco) : "";
    mapa[`ITEM_${n}_UNIDADE`] = item ? escapar(item.unidade) : "";
    mapa[`ITEM_${n}_FOTO`] = item ? escapar(item.fotoUrl) : "";
  });

  return tema.svg.replace(
    /\{\{([A-Z0-9_]+)\}\}/g,
    (_todo, chave: string) => mapa[chave] ?? ""
  );
}
