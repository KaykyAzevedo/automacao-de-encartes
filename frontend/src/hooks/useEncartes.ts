"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type {
  EncarteDraftCompleto,
  EncarteDraftResumo,
  FormatoEncarte,
  ItemEncarteDraft,
} from "@/types";

export const chavesEncarte = {
  daEmpresa: (companyId: string) => ["encartes", companyId] as const,
  detalhe: (id: string) => ["encarte", id] as const,
};

export interface DadosEncarteDraft {
  companyId: string;
  name: string;
  productList: string;
  selectedThemeId?: string | null;
  selectedFormat: FormatoEncarte;
  parsedProducts: ItemEncarteDraft[];
  edits: Record<string, unknown>;
}

export function useEncartes(companyId: string | null) {
  return useQuery({
    queryKey: chavesEncarte.daEmpresa(companyId ?? ""),
    queryFn: () =>
      api.get<EncarteDraftResumo[]>(`/api/encartes?companyId=${companyId}`),
    enabled: Boolean(companyId),
  });
}

export function useEncarte(id: string | null) {
  return useQuery({
    queryKey: chavesEncarte.detalhe(id ?? ""),
    queryFn: () => api.get<EncarteDraftCompleto>(`/api/encartes/${id}`),
    enabled: Boolean(id),
  });
}

export function useCriarEncarte(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: DadosEncarteDraft) =>
      api.post<EncarteDraftCompleto>("/api/encartes", dados),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: chavesEncarte.daEmpresa(companyId) }),
  });
}

export function useAtualizarEncarte(companyId: string) {
  // igual useAtualizarTema: nao da pra usar um helper de invalidacao
  // que chame outro hook dentro do onSuccess (callback, nao render) -
  // quebraria as Regras de Hooks. useQueryClient direto aqui.
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...dados
    }: Partial<DadosEncarteDraft> & {
      id: string;
      pngUrl?: string | null;
      jpgUrl?: string | null;
    }) => api.put<EncarteDraftCompleto>(`/api/encartes/${id}`, dados),
    onSuccess: (_data, variaveis) => {
      void qc.invalidateQueries({
        queryKey: chavesEncarte.daEmpresa(companyId),
      });
      void qc.invalidateQueries({
        queryKey: chavesEncarte.detalhe(variaveis.id),
      });
    },
  });
}

export function useRemoverEncarte(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<{ success: true }>(`/api/encartes/${id}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: chavesEncarte.daEmpresa(companyId) }),
  });
}
