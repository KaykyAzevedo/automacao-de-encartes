export type EstiloEmpresa = "sofisticado" | "agressivo";

export interface Company {
  id: string;
  userId: string;
  name: string;
  style: EstiloEmpresa;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { stores: number; products: number; themes: number };
}

export interface Store {
  id: string;
  companyId: string;
  name: string;
  address: string;
  logo: string | null;
  deliveryPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Theme {
  id: string;
  companyId: string;
  themeName: string;
  day: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  photoS3Url: string;
  // Etapa 21: fotos que o usuario mandou pra esse produto, alem da do
  // banco publico (photoS3Url) - nao substituem, ficam como opcao.
  userPhotos: string[];
  createdAt: string;
  updatedAt: string;
  company?: { id: string; name: string };
}

export type FormatoEncarte = 1 | 2 | 4 | 6 | 8 | 10;
export type TamanhoSaida = "feed" | "stories";

// Espelha backend/src/schemas/encarteDraft.schema.ts
export interface ItemEncarteDraft {
  name: string;
  price: string;
  unit: string;
  photoUrl: string;
}

// GET /api/encartes devolve so os metadados: productList/parsedProducts
// podem ser grandes (ver backend/src/services/encarteDraft.service.ts).
export interface EncarteDraftResumo {
  id: string;
  companyId: string;
  name: string;
  selectedFormat: FormatoEncarte;
  pngUrl: string | null;
  jpgUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EncarteDraftCompleto extends EncarteDraftResumo {
  userId: string;
  productList: string;
  selectedThemeId: string | null;
  parsedProducts: ItemEncarteDraft[];
  edits: Record<string, unknown>;
}
