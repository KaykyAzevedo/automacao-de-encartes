import { readFileSync } from "node:fs";
import { join } from "node:path";

import { prisma } from "../src/lib/prisma";
import { usuarioLocal } from "../src/lib/usuarioLocal";

interface ItemBancoFotos {
  nome: string;
  slug: string;
}

// Nome da empresa que recebe o catalogo padrao. Este app roda para um
// unico usuario local: reaproveita a empresa real dele, em vez de
// criar uma empresa "admin" separada que fragmentaria os dados.
const NOME_EMPRESA_PADRAO = "Empório Hortifruti";

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
}

main()
  .catch((e) => {
    console.error("FALHOU:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
