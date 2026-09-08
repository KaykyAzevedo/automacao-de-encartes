"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Company, EstiloEmpresa } from "@/types";

export const chavesEmpresa = {
  todas: ["companies"] as const,
};

export interface DadosEmpresa {
  name: string;
  style: EstiloEmpresa;
  logo?: string | null;
}

export function useCompanies() {
  return useQuery({
    queryKey: chavesEmpresa.todas,
    queryFn: () => api.get<Company[]>("/api/companies"),
  });
}

export function useCriarEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: DadosEmpresa) =>
      api.post<Company>("/api/companies", dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: chavesEmpresa.todas }),
  });
}

export function useAtualizarEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dados }: DadosEmpresa & { id: string }) =>
      api.put<Company>(`/api/companies/${id}`, dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: chavesEmpresa.todas }),
  });
}

export function useRemoverEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.del<{ success: true }>(`/api/companies/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: chavesEmpresa.todas }),
  });
}
