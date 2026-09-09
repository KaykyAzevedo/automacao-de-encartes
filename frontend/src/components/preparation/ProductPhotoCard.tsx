"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  useDefinirFotoPrincipal,
  useUploadFotoProduto,
} from "@/hooks/useProducts";
import type { Product } from "@/types";

// Etapa 21: upload de fotos customizadas por produto. "Usar esta foto"
// promove um upload a foto PRINCIPAL do produto (photoS3Url) - a
// escolha entre banco/upload pra um encarte especifico e feita na hora
// de gerar (generate-encarte), nao aqui.
export function ProductPhotoCard({
  produto,
  companyId,
  search,
}: {
  produto: Product;
  companyId: string;
  search?: string;
}) {
  const { mostrar } = useToast();
  const upload = useUploadFotoProduto(companyId, search);
  const definirPrincipal = useDefinirFotoPrincipal(companyId, search);

  async function tratarArquivo(file: File) {
    try {
      await upload.mutateAsync({ productId: produto.id, file });
      mostrar("sucesso", `Foto adicionada a "${produto.name}".`);
    } catch (err) {
      mostrar(
        "erro",
        err instanceof Error ? err.message : "Falha ao enviar a foto"
      );
    }
  }

  async function usarComoFotoPrincipal(url: string) {
    try {
      await definirPrincipal.mutateAsync({ id: produto.id, photoS3Url: url });
      mostrar("sucesso", `Foto principal de "${produto.name}" atualizada.`);
    } catch (err) {
      mostrar(
        "erro",
        err instanceof Error ? err.message : "Não foi possível atualizar"
      );
    }
  }

  return (
    <div className="flex flex-wrap items-start gap-4 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="w-28 shrink-0">
        <p className="mb-2 truncate text-sm font-medium" title={produto.name}>
          {produto.name}
        </p>
        <span className="mb-1 block text-[11px] text-neutral-500 dark:text-neutral-400">
          Foto principal
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={produto.photoS3Url}
          alt={produto.name}
          className="h-24 w-24 rounded border border-neutral-300 object-cover dark:border-neutral-700"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
            Suas fotos ({produto.userPhotos.length})
          </span>
          <label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={upload.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void tratarArquivo(file);
                e.target.value = "";
              }}
            />
            <span className="inline-block cursor-pointer rounded-lg border border-neutral-300 px-2.5 py-1 text-xs transition hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500">
              {upload.isPending ? "Enviando..." : "+ Adicionar foto"}
            </span>
          </label>
        </div>

        {produto.userPhotos.length === 0 ? (
          <p className="text-xs text-neutral-400">Nenhum upload ainda.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {produto.userPhotos.map((url) => {
              const ehPrincipal = url === produto.photoS3Url;
              return (
                <div key={url} className="w-20 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className={`h-20 w-20 rounded border object-cover ${
                      ehPrincipal
                        ? "border-emerald-500"
                        : "border-neutral-200 dark:border-neutral-800"
                    }`}
                  />
                  <Button
                    variante="fantasma"
                    className="mt-1 w-full px-1 py-0.5 text-[10px]"
                    disabled={ehPrincipal || definirPrincipal.isPending}
                    onClick={() => void usarComoFotoPrincipal(url)}
                  >
                    {ehPrincipal ? "Em uso" : "Usar esta foto"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
