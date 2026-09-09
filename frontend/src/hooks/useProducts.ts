"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { uploadFotoProduto } from "@/lib/uploadFotoProduto";
import type { Product } from "@/types";

export const chavesProduto = {
  daEmpresa: (companyId: string, search?: string) =>
    ["products", companyId, search ?? ""] as const,
};

export function useProducts(companyId: string | null, search?: string) {
  return useQuery({
    queryKey: chavesProduto.daEmpresa(companyId ?? "", search),
    queryFn: () => {
      const params = new URLSearchParams({ companyId: companyId ?? "" });
      if (search?.trim()) params.set("search", search.trim());
      return api.get<Product[]>(`/api/products?${params.toString()}`);
    },
    enabled: Boolean(companyId),
  });
}

// Sobe uma foto pro banco de fotos DESSE produto (Etapa 21) - o
// backend ja devolve o produto com userPhotos atualizado, entao so
// precisa invalidar a lista pra puxar o resto dos campos junto.
export function useUploadFotoProduto(companyId: string, search?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      uploadFotoProduto(productId, file),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: chavesProduto.daEmpresa(companyId, search),
      }),
  });
}

// "Usar esta foto" na preparacao: promove um upload do usuario a foto
// principal do produto (photoS3Url) - diferente da escolha feita na
// hora de gerar o encarte, que e so pra aquele encarte especifico.
export function useDefinirFotoPrincipal(companyId: string, search?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, photoS3Url }: { id: string; photoS3Url: string }) =>
      api.put<Product>(`/api/products/${id}`, { photoS3Url }),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: chavesProduto.daEmpresa(companyId, search),
      }),
  });
}
