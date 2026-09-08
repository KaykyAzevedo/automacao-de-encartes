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

export type FormatoEncarte = 1 | 2 | 4 | 6 | 8 | 10;
export type TamanhoSaida = "feed" | "stories";
