#!/usr/bin/env node
"use strict";

// Etapa 25: converte um PNG de fundo em um .svg de pre-visualizacao,
// sem tocar no banco - so pra conferir como a grade de placeholders
// fica em cima da arte antes de importar de verdade (pelo seed ou
// pela pagina /admin/import-themes).
//
// Uso:
//   node scripts/convertPngToSvg.js <tema> <formato>
//   node scripts/convertPngToSvg.js <tema> all
//
// Exemplos:
//   node scripts/convertPngToSvg.js tema-1 4
//   node scripts/convertPngToSvg.js tema-2 all
//
// Le  frontend/public/templates/<tema>/format-<formato>.png
// Gera frontend/public/templates/<tema>/format-<formato>.svg
//
// Mantido em JS puro (sem TypeScript) de proposito: e uma ferramenta
// de linha de comando isolada, roda direto com "node" sem precisar
// compilar nem subir o resto do projeto. A logica de grade espelha
// backend/src/lib/temaTemplate.ts (usada pelo seed e pela pagina de
// admin) - se mudar o layout de um lado, replique no outro.

const fs = require("node:fs");
const path = require("node:path");

const FORMATOS_VALIDOS = [1, 2, 4, 6, 8, 10];
const COLUNAS_POR_FORMATO = { 1: 1, 2: 2, 4: 2, 6: 2, 8: 2, 10: 2 };

const LARGURA = 1080;
const ALTURA = 1350;
const MARGEM = 60;
const TOPO_GRADE = 300; // espaco reservado pro cabecalho/titulo

function montarSvgComFundo(fundoUrl, formato) {
  const colunas = COLUNAS_POR_FORMATO[formato];
  const linhas = Math.ceil(formato / colunas);
  const alturaGrade = ALTURA - TOPO_GRADE - MARGEM;
  const larguraCelula = (LARGURA - MARGEM * 2) / colunas;
  const alturaCelula = alturaGrade / linhas;

  let itens = "";
  for (let i = 0; i < formato; i++) {
    const coluna = i % colunas;
    const linha = Math.floor(i / colunas);
    const x = MARGEM + coluna * larguraCelula;
    const y = TOPO_GRADE + linha * alturaCelula;
    const n = i + 1;
    const fotoAltura = alturaCelula * 0.62;

    itens += `
    <g>
      <image href="{{ITEM_${n}_FOTO}}" x="${x + 12}" y="${y + 12}" width="${larguraCelula - 24}" height="${fotoAltura}" preserveAspectRatio="xMidYMid slice"/>
      <text x="${x + larguraCelula / 2}" y="${y + fotoAltura + 40}" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#ffffff">{{ITEM_${n}_NOME}}</text>
      <text x="${x + larguraCelula / 2}" y="${y + fotoAltura + 78}" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="bold" fill="#ffffff">R$ {{ITEM_${n}_PRECO}} {{ITEM_${n}_UNIDADE}}</text>
    </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGURA} ${ALTURA}" width="${LARGURA}" height="${ALTURA}">
  <image href="${fundoUrl}" x="0" y="0" width="${LARGURA}" height="${ALTURA}" preserveAspectRatio="xMidYMid slice"/>
  ${itens}
</svg>`;
}

function converterFormato(pastaTema, tema, formato) {
  const png = path.join(pastaTema, `format-${formato}.png`);
  const svg = path.join(pastaTema, `format-${formato}.svg`);

  if (!fs.existsSync(png)) {
    console.log(
      `  format-${formato}: ainda não chegou (esperado em ${path.relative(process.cwd(), png)})`
    );
    return false;
  }

  // caminho relativo servido pelo Next em dev/produção, mesmo padrão
  // já usado pelo banco de fotos público (frontend/public/banco-fotos)
  const urlPublica = `/templates/${tema}/format-${formato}.png`;
  const conteudoSvg = montarSvgComFundo(urlPublica, formato);
  fs.writeFileSync(svg, conteudoSvg, "utf-8");
  console.log(
    `  format-${formato}: OK -> ${path.relative(process.cwd(), svg)}`
  );
  return true;
}

function main() {
  const [, , tema, formatoArg] = process.argv;

  if (!tema || !formatoArg) {
    console.log(
      "Uso: node scripts/convertPngToSvg.js <tema> <formato|all>\n" +
        "Exemplo: node scripts/convertPngToSvg.js tema-1 4\n" +
        "         node scripts/convertPngToSvg.js tema-1 all"
    );
    process.exit(1);
  }

  const pastaTema = path.join(
    __dirname,
    "..",
    "frontend",
    "public",
    "templates",
    tema
  );

  if (!fs.existsSync(pastaTema)) {
    console.error(
      `Pasta não encontrada: ${path.relative(process.cwd(), pastaTema)}\n` +
        `Temas disponíveis: ${fs
          .readdirSync(
            path.join(__dirname, "..", "frontend", "public", "templates"),
            {
              withFileTypes: true,
            }
          )
          .filter((e) => e.isDirectory())
          .map((e) => e.name)
          .join(", ")}`
    );
    process.exit(1);
  }

  const formatos =
    formatoArg === "all"
      ? FORMATOS_VALIDOS
      : [Number(formatoArg)].filter((f) => FORMATOS_VALIDOS.includes(f));

  if (formatos.length === 0) {
    console.error(
      `Formato inválido: "${formatoArg}". Use um de ${FORMATOS_VALIDOS.join(", ")}, ou "all".`
    );
    process.exit(1);
  }

  console.log(`Convertendo "${tema}"...`);
  let algumConvertido = false;
  for (const formato of formatos) {
    if (converterFormato(pastaTema, tema, formato)) algumConvertido = true;
  }

  if (!algumConvertido) {
    console.log(
      "\nNenhum PNG encontrado ainda. Assim que chegar, coloque em " +
        `frontend/public/templates/${tema}/format-N.png e rode de novo.`
    );
  }
}

main();
