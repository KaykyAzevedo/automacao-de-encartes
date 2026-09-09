import { api } from "./api";

export interface ProdutoMatch {
  id: string;
  name: string;
  photoS3Url: string;
  // Etapa 21: fotos que o usuario ja subiu pra esse produto, alem da
  // do banco publico - quem gera o encarte escolhe qual usar.
  userPhotos: string[];
}

export interface ResultadoMatch {
  product: ProdutoMatch;
  confidence: number;
}

export interface RespostaMatch {
  exactMatch: ResultadoMatch | null;
  suggestions: ResultadoMatch[];
}

export function matchProduct(companyId: string, productName: string) {
  return api.post<RespostaMatch>("/api/products/match", {
    companyId,
    productName,
  });
}
