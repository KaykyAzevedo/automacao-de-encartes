"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chavesEmpresa } from "@/hooks/useCompanies";
import { api } from "@/lib/api";
import type { Store } from "@/types";

export const chavesLoja = {
  daEmpresa: (companyId: string) => ["stores", companyId] as const,
};

export interface DadosLoja {
  name: string;
  address: string;
  deliveryPhone?: string | null;
  logo?: string | null;
}

export function useStores(companyId: string | null) {
  return useQuery({
    queryKey: chavesLoja.daEmpresa(companyId ?? ""),
    queryFn: () => api.get<Store[]>(`/api/companies/${companyId}/stores`),
    // so busca depois que uma empresa foi escolhida
    enabled: Boolean(companyId),
  });
}

function useInvalidar(companyId: string) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: chavesLoja.daEmpresa(companyId) });
    // o contador de lojas aparece no card da empresa
    void qc.invalidateQueries({ queryKey: chavesEmpresa.todas });
  };
}

export function useCriarLoja(companyId: string) {
  const invalidar = useInvalidar(companyId);
  return useMutation({
    mutationFn: (dados: DadosLoja) =>
      api.post<Store>("/api/stores", { ...dados, companyId }),
    onSuccess: invalidar,
  });
}

export function useAtualizarLoja(companyId: string) {
  const invalidar = useInvalidar(companyId);
  return useMutation({
    mutationFn: ({ id, ...dados }: DadosLoja & { id: string }) =>
      api.put<Store>(`/api/stores/${id}`, dados),
    onSuccess: invalidar,
  });
}

export function useRemoverLoja(companyId: string) {
  const invalidar = useInvalidar(companyId);
  return useMutation({
    mutationFn: (id: string) => api.del<{ success: true }>(`/api/stores/${id}`),
    onSuccess: invalidar,
  });
}
