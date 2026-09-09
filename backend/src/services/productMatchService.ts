import Fuse from "fuse.js";

import { normalizar } from "../lib/texto";
import { prisma } from "../lib/prisma";
import { companyService } from "./company.service";

// Acima disso, aceita a correspondencia como certa (exactMatch).
// Abaixo, devolve so como sugestao para quem chamou decidir.
const LIMIAR_CONFIANCA = 0.85;

// Margem minima sobre o segundo colocado para aceitar automaticamente.
// Sem isso, "brocolis" (prefixo comum a "Brócolis Comum" e "Brócolis
// Americano") empataria em confidence e o servico escolheria um dos
// dois sem avisar - a ambiguidade em si e informacao util para quem
// chamou, entao um empate deve cair em sugestoes, nao virar palpite.
const MARGEM_MINIMA_DESEMPATE = 0.02;

// Corte de aceitacao do proprio Fuse: mais permissivo que o 0.4 do
// buscarSimilares, porque aqui todo candidato fraco vira sugestao (nao
// e usado sozinho) - so os >= LIMIAR_CONFIANCA viram match automatico.
const FUSE_THRESHOLD = 0.6;

interface ProdutoIndexado {
  id: string;
  name: string;
  photoS3Url: string;
  userPhotos: string[];
  busca: string;
}

export interface ResultadoMatch {
  product: {
    id: string;
    name: string;
    photoS3Url: string;
    // Etapa 21: uploads do usuario para esse produto, alem da foto do
    // banco publico - quem gera o encarte escolhe qual usar.
    userPhotos: string[];
  };
  confidence: number;
}

export const productMatchService = {
  // Recebe o nome como o usuario digitou (com ou sem acento, com
  // possivel erro de digitacao) e tenta achar o produto do catalogo.
  // Confidence 1 = identico, 0 = nao relacionado.
  async findProductByName(
    userId: string,
    companyId: string,
    userInput: string
  ): Promise<{
    exactMatch: ResultadoMatch | null;
    suggestions: ResultadoMatch[];
  }> {
    await companyService.garantirPropriedade(userId, companyId);

    const produtos = await prisma.product.findMany({
      where: { companyId },
      select: { id: true, name: true, photoS3Url: true, userPhotos: true },
    });

    if (produtos.length === 0) {
      return { exactMatch: null, suggestions: [] };
    }

    const indexados: ProdutoIndexado[] = produtos.map((p) => ({
      ...p,
      busca: normalizar(p.name),
    }));

    const fuse = new Fuse(indexados, {
      keys: ["busca"],
      includeScore: true,
      threshold: FUSE_THRESHOLD,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    const resultados = fuse
      .search(normalizar(userInput), { limit: 3 })
      .map(({ item, score }) => ({
        product: {
          id: item.id,
          name: item.name,
          photoS3Url: item.photoS3Url,
          userPhotos: item.userPhotos,
        },
        // Fuse: 0 = perfeito. Invertido para "confidence", 1 = perfeito.
        confidence: Number((1 - (score ?? 0)).toFixed(4)),
      }));

    const [melhor, segundo] = resultados;
    const semAmbiguidade =
      !segundo ||
      melhor.confidence - segundo.confidence >= MARGEM_MINIMA_DESEMPATE;

    if (melhor && melhor.confidence >= LIMIAR_CONFIANCA && semAmbiguidade) {
      // confiante e sem concorrente proximo: devolve so o match
      return { exactMatch: melhor, suggestions: [] };
    }

    // sem confianca suficiente, ou empatado com outro candidato:
    // devolve as opcoes para quem chamou decidir
    return { exactMatch: null, suggestions: resultados };
  },
};
