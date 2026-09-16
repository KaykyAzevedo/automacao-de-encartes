"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
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
    <article className="overflow-hidden rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] shadow-[0_12px_32px_-28px_rgb(24_65_45/0.45)] transition hover:border-[rgb(var(--brand)/0.3)]">
      <div className="flex gap-4 p-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface-subtle))]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={produto.photoS3Url}
            alt={produto.name}
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-black/65 px-1.5 py-1 text-center text-[9px] font-semibold text-white backdrop-blur-sm">
            Foto principal
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold" title={produto.name}>
            {produto.name}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${produto.userPhotos.length ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400" : "bg-[rgb(var(--surface-subtle))] text-neutral-500"}`}
          >
            {produto.userPhotos.length
              ? `${produto.userPhotos.length} foto(s) própria(s)`
              : "Só foto do catálogo"}
          </span>

          <label className="mt-3 inline-block">
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
            <span className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[rgb(var(--line))] px-3 py-1.5 text-xs font-semibold transition hover:border-[rgb(var(--brand)/0.45)] hover:text-[rgb(var(--brand))]">
              {upload.isPending ? <Spinner tamanho="sm" /> : null}
              {upload.isPending ? "Enviando..." : "+ Adicionar foto própria"}
            </span>
          </label>
        </div>
      </div>

      {produto.userPhotos.length > 0 ? (
        <details className="group border-t border-[rgb(var(--line))]">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-semibold text-neutral-500 transition hover:bg-[rgb(var(--surface-subtle)/0.55)] hover:text-[rgb(var(--brand))]">
            <span>Ver fotos próprias</span>
            <span className="transition-transform group-open:rotate-180">
              ⌄
            </span>
          </summary>
          <div className="flex flex-wrap gap-3 border-t border-[rgb(var(--line))] bg-[rgb(var(--surface-subtle)/0.35)] p-4">
            {produto.userPhotos.map((url) => {
              const ehPrincipal = url === produto.photoS3Url;
              return (
                <div key={url} className="w-24 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className={`h-24 w-24 rounded-xl border-2 object-cover ${
                      ehPrincipal
                        ? "border-[rgb(var(--brand))]"
                        : "border-[rgb(var(--line))]"
                    }`}
                  />
                  <Button
                    variante="fantasma"
                    className="mt-1 min-h-8 w-full px-1 py-0.5 text-[10px]"
                    disabled={ehPrincipal || definirPrincipal.isPending}
                    onClick={() => void usarComoFotoPrincipal(url)}
                  >
                    {ehPrincipal ? "Em uso" : "Usar esta foto"}
                  </Button>
                </div>
              );
            })}
          </div>
        </details>
      ) : null}
    </article>
  );
}
