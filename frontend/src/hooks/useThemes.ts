"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

// Espelha backend/src/schemas/theme.schema.ts
export const DIAS_SEMANA = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
] as const;
export type DiaSemana = (typeof DIAS_SEMANA)[number];

export const FORMATOS_TEMA = [1, 2, 4, 6, 8, 10] as const;
export type FormatoTema = (typeof FORMATOS_TEMA)[number];

export type CamposSvg = {
  format1Svg: string;
  format2Svg: string;
  format4Svg: string;
  format6Svg: string;
  format8Svg: string;
  format10Svg: string;
};

// GET /api/companies/:companyId/themes devolve so os metadados: os 6
// campos de SVG sao @db.Text e podem ser grandes, entao a lista nao
// carrega o conteudo (ver backend/src/services/theme.service.ts).
export interface ThemeResumo {
  id: string;
  companyId: string;
  themeName: string;
  day: DiaSemana;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeCompleto extends ThemeResumo, CamposSvg {
  company?: { id: string; name: string };
}

export const chavesTema = {
  daEmpresa: (companyId: string) => ["themes", companyId] as const,
  detalhe: (id: string) => ["theme", id] as const,
};

export function useThemes(companyId: string | null) {
  return useQuery({
    queryKey: chavesTema.daEmpresa(companyId ?? ""),
    queryFn: () => api.get<ThemeResumo[]>(`/api/companies/${companyId}/themes`),
    enabled: Boolean(companyId),
  });
}

// Usado pelo ThemeCard (previews por formato) e pelo EditThemeModal
// (precisam do conteudo dos SVGs, que a listagem nao traz).
export function useTheme(id: string | null) {
  return useQuery({
    queryKey: chavesTema.detalhe(id ?? ""),
    queryFn: () => api.get<ThemeCompleto>(`/api/themes/${id}`),
    enabled: Boolean(id),
  });
}

export interface DadosTema extends CamposSvg {
  themeName: string;
  day: DiaSemana;
}

function useInvalidar(companyId: string) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: chavesTema.daEmpresa(companyId) });
  };
}

export function useCriarTema(companyId: string) {
  const invalidar = useInvalidar(companyId);
  return useMutation({
    mutationFn: (dados: DadosTema) =>
      api.post<ThemeCompleto>("/api/themes", { ...dados, companyId }),
    onSuccess: invalidar,
  });
}

export function useAtualizarTema(companyId: string) {
  // nao da para usar useInvalidar aqui: o id do tema so e conhecido
  // quando a mutation roda, e chamar um hook dentro do onSuccess
  // (um callback, nao a renderizacao) quebra as Regras de Hooks
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dados }: Partial<DadosTema> & { id: string }) =>
      api.put<ThemeCompleto>(`/api/themes/${id}`, dados),
    onSuccess: (_data, variaveis) => {
      void qc.invalidateQueries({ queryKey: chavesTema.daEmpresa(companyId) });
      void qc.invalidateQueries({ queryKey: chavesTema.detalhe(variaveis.id) });
    },
  });
}

export function useRemoverTema(companyId: string) {
  const invalidar = useInvalidar(companyId);
  return useMutation({
    mutationFn: (id: string) => api.del<{ success: true }>(`/api/themes/${id}`),
    onSuccess: invalidar,
  });
}
