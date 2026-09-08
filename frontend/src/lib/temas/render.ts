import type { DadosEncarte } from "./tipos";

// Os templates guardam marcadores {{CHAVE}}. Renderizar e trocar cada
// marcador pelo valor, escapando o que vai virar texto no SVG.
function escapar(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function montarSubstituicoes(
  dados: DadosEncarte
): Record<string, string> {
  const mapa: Record<string, string> = {
    TITULO: dados.titulo,
    SUBTITULO: dados.subtitulo,
    CHAMADA: dados.chamada,
    VALIDADE: dados.validade,
  };

  dados.selo.forEach((linha, i) => {
    mapa[`SELO_${i + 1}`] = linha;
  });

  dados.itens.forEach((item, i) => {
    const n = i + 1;
    mapa[`ITEM_${n}_NOME`] = item.nome;
    mapa[`ITEM_${n}_PRECO`] = item.preco;
    mapa[`ITEM_${n}_UNIDADE`] = item.unidade;
    mapa[`ITEM_${n}_FOTO`] = item.fotoUrl;
  });

  dados.lojas.forEach((loja, i) => {
    const n = i + 1;
    mapa[`LOJA_${n}_NOME`] = loja.nome;
    mapa[`LOJA_${n}_ENDERECO`] = loja.endereco;
    mapa[`LOJA_${n}_WHATSAPP`] = loja.whatsapp;
  });

  return mapa;
}

export function renderizarTema(template: string, dados: DadosEncarte): string {
  const mapa = montarSubstituicoes(dados);
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_todo, chave: string) =>
    escapar(mapa[chave] ?? "")
  );
}
