import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  formatoMaisProximo,
  montarSvgComFundo,
  type FormatoTemplate,
} from "../src/lib/temaTemplate";
import { prisma } from "../src/lib/prisma";
import { usuarioLocal } from "../src/lib/usuarioLocal";
import type { DiaSemana } from "../src/schemas/theme.schema";

interface ItemBancoFotos {
  nome: string;
  slug: string;
}

// Nome da empresa que recebe o catalogo padrao. Este app roda para um
// unico usuario local: reaproveita a empresa real dele, em vez de
// criar uma empresa "admin" separada que fragmentaria os dados.
const NOME_EMPRESA_PADRAO = "Empório Hortifruti";

// Etapa 25: temas prontos para receber PNG (frontend/public/templates)
// - so os 4 formatos pedidos; 2 e 6 ficam por conta do fallback do
// formatoMaisProximo ate chegar arte propria pra eles.
const TEMPLATES_DE_TEMA: {
  pasta: string;
  themeName: string;
  day: DiaSemana;
}[] = [
  { pasta: "tema-1", themeName: "Tema 1 (importado)", day: "segunda" },
  { pasta: "tema-2", themeName: "Tema 2 (importado)", day: "terca" },
];
const FORMATOS_PEDIDOS: FormatoTemplate[] = [1, 4, 8, 10];

async function main() {
  const caminho = join(__dirname, "seed-data", "banco-fotos.json");
  const itens: ItemBancoFotos[] = JSON.parse(readFileSync(caminho, "utf-8"));

  const user = await usuarioLocal();

  let company = await prisma.company.findFirst({
    where: { userId: user.id, name: NOME_EMPRESA_PADRAO },
  });
  if (!company) {
    company = await prisma.company.create({
      data: {
        userId: user.id,
        name: NOME_EMPRESA_PADRAO,
        style: "sofisticado",
      },
    });
    console.log("empresa criada:", company.id);
  } else {
    console.log("empresa ja existia:", company.id);
  }

  let criados = 0;
  let atualizados = 0;

  for (const item of itens) {
    // caminho relativo servido pelo frontend (STORAGE_MODE=local).
    // Se STORAGE_MODE=s3, troque para a URL do bucket, mesmo prefixo
    // "banco-fotos/" documentado em backend/aws/README.md.
    const photoS3Url = `/banco-fotos/${item.slug}`;
    const existente = await prisma.product.findFirst({
      where: { companyId: company.id, name: item.nome },
    });

    if (existente) {
      await prisma.product.update({
        where: { id: existente.id },
        data: { photoS3Url },
      });
      atualizados++;
    } else {
      await prisma.product.create({
        data: { companyId: company.id, name: item.nome, photoS3Url },
      });
      criados++;
    }
  }

  console.log(`produtos criados: ${criados} | atualizados: ${atualizados}`);
  console.log(
    "total no banco:",
    await prisma.product.count({ where: { companyId: company.id } })
  );

  await importarTemplatesDeTema(company.id);
}

// Etapa 25: para cada pasta em frontend/public/templates/, confere
// quais PNGs ja chegaram (format-1.png, format-4.png, format-8.png,
// format-10.png) e cria/atualiza o Theme correspondente. Pasta sem
// nenhum PNG ainda e' pulada silenciosamente - rodar o seed antes de
// receber a arte nao quebra nada.
async function importarTemplatesDeTema(companyId: string) {
  const pastaTemplates = join(
    __dirname,
    "..",
    "..",
    "frontend",
    "public",
    "templates"
  );

  for (const { pasta, themeName, day } of TEMPLATES_DE_TEMA) {
    const disponiveis: FormatoTemplate[] = [];
    const svgPorFormato: Partial<Record<FormatoTemplate, string>> = {};

    for (const formato of FORMATOS_PEDIDOS) {
      const arquivo = join(pastaTemplates, pasta, `format-${formato}.png`);
      if (!existsSync(arquivo)) continue;

      // caminho relativo servido pelo frontend, mesmo padrao do
      // banco-fotos - sem depender de STORAGE_MODE nem subir nada,
      // porque o PNG ja e um asset estatico do Next
      const url = `/templates/${pasta}/format-${formato}.png`;
      svgPorFormato[formato] = montarSvgComFundo(url, formato);
      disponiveis.push(formato);
    }

    if (disponiveis.length === 0) {
      console.log(`${pasta}: nenhum PNG ainda, pulei`);
      continue;
    }

    const formatoDe = (alvo: FormatoTemplate): string => {
      if (svgPorFormato[alvo]) return svgPorFormato[alvo]!;
      const proximo = formatoMaisProximo(disponiveis, alvo)!;
      return svgPorFormato[proximo]!;
    };

    const dados = {
      themeName,
      day,
      format1Svg: formatoDe(1),
      format2Svg: formatoDe(2),
      format4Svg: formatoDe(4),
      format6Svg: formatoDe(6),
      format8Svg: formatoDe(8),
      format10Svg: formatoDe(10),
    };

    const existente = await prisma.theme.findFirst({
      where: { companyId, themeName },
    });

    if (existente) {
      await prisma.theme.update({ where: { id: existente.id }, data: dados });
      console.log(
        `${pasta}: tema atualizado (formatos com arte propria: ${disponiveis.join(", ")})`
      );
    } else {
      await prisma.theme.create({ data: { ...dados, companyId } });
      console.log(
        `${pasta}: tema criado (formatos com arte propria: ${disponiveis.join(", ")})`
      );
    }
  }
}

main()
  .catch((e) => {
    console.error("FALHOU:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
