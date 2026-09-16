"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Erro, SecaoVazia } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useCompanies } from "@/hooks/useCompanies";
import { useEncartes, useRemoverEncarte } from "@/hooks/useEncartes";
import type { EncarteDraftResumo } from "@/types";

function dataFormatada(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DraftsPage() {
  const { data: empresas, isLoading: carregandoEmpresas } = useCompanies();
  const empresa = empresas?.[0];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--brand))]">
            Sua biblioteca
          </p>
          <h1 className="text-lg font-semibold">Meus encartes</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Continue uma criação, faça o download ou organize suas artes salvas.
          </p>
        </div>
        {empresa ? (
          <Link
            href="/generate-encarte"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[rgb(var(--brand))] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_-12px_rgb(var(--brand))] transition hover:bg-[rgb(var(--brand-strong))] dark:text-neutral-950"
          >
            <span className="text-lg" aria-hidden="true">
              +
            </span>{" "}
            Novo encarte
          </Link>
        ) : null}
      </div>

      <div className="mt-6">
        {carregandoEmpresas ? (
          <SkeletonLista />
        ) : !empresa ? (
          <SecaoVazia>
            Cadastre uma empresa em Cadastros antes de salvar encartes.
          </SecaoVazia>
        ) : (
          <ListaDrafts companyId={empresa.id} />
        )}
      </div>
    </div>
  );
}

function ListaDrafts({ companyId }: { companyId: string }) {
  const { data, isLoading, isError, error, isFetching } =
    useEncartes(companyId);
  const remover = useRemoverEncarte(companyId);
  const { mostrar } = useToast();
  const [confirmando, setConfirmando] = useState<EncarteDraftResumo | null>(
    null
  );

  if (isLoading) return <SkeletonLista />;
  if (isError)
    return <Erro>{(error as Error)?.message ?? "Falha ao carregar"}</Erro>;
  if (!data?.length)
    return (
      <SecaoVazia>
        <span className="block text-base font-semibold text-[rgb(var(--foreground))]">
          Sua biblioteca está vazia
        </span>
        <span className="mt-1 block">
          Crie seu primeiro encarte e salve para continuar depois.
        </span>
        <Link
          href="/generate-encarte"
          className="mt-4 inline-flex rounded-xl bg-[rgb(var(--brand))] px-4 py-2 text-sm font-semibold text-white dark:text-neutral-950"
        >
          Criar primeiro encarte
        </Link>
      </SecaoVazia>
    );

  async function excluir(draft: EncarteDraftResumo) {
    try {
      await remover.mutateAsync(draft.id);
      mostrar("sucesso", `Rascunho "${draft.name}" excluído.`);
    } catch (err) {
      mostrar(
        "erro",
        err instanceof Error ? err.message : "Não foi possível excluir"
      );
    } finally {
      setConfirmando(null);
    }
  }

  return (
    <>
      <ul
        className={`grid items-start gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}
        aria-busy={isFetching || undefined}
      >
        {data.map((draft) => {
          const excluindo = remover.isPending && confirmando?.id === draft.id;
          return (
            <li key={draft.id}>
              <article
                className={`overflow-hidden rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] shadow-[0_14px_34px_-28px_rgb(24_65_45/0.45)] transition hover:-translate-y-0.5 hover:border-[rgb(var(--brand)/0.35)] ${excluindo ? "opacity-50" : ""}`}
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgb(var(--accent)/0.18),transparent_55%),rgb(var(--surface-subtle))]">
                  {draft.pngUrl || draft.jpgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.pngUrl ?? draft.jpgUrl ?? ""}
                      alt={`Prévia de ${draft.name}`}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-[rgb(var(--brand))]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="h-10 w-10 opacity-55"
                        aria-hidden="true"
                      >
                        <path d="M6 3h9l4 4v14H6z" />
                        <path d="M14 3v5h5M9 13h6M9 17h4" />
                      </svg>
                      <span className="text-[11px] font-semibold text-neutral-400">
                        Prévia disponível após o download
                      </span>
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm ${draft.pngUrl || draft.jpgUrl ? "bg-emerald-950/80 text-emerald-200" : "bg-black/65 text-white"}`}
                  >
                    {draft.pngUrl || draft.jpgUrl ? "Arte gerada" : "Rascunho"}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    {draft.selectedFormat}{" "}
                    {draft.selectedFormat === 1 ? "item" : "itens"}
                  </span>
                </div>

                <div className="p-4">
                  <h2 className="truncate text-sm font-bold" title={draft.name}>
                    {draft.name}
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Atualizado em {dataFormatada(draft.updatedAt)}
                  </p>
                  <div className="mt-4 flex gap-2 border-t border-[rgb(var(--line))] pt-4">
                    <Link
                      href={`/generate-encarte?draftId=${draft.id}`}
                      className="flex-1"
                    >
                      <span className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[rgb(var(--brand))] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[rgb(var(--brand-strong))] dark:text-neutral-950">
                        Continuar editando
                      </span>
                    </Link>
                    {draft.pngUrl || draft.jpgUrl ? (
                      <a
                        href={draft.pngUrl ?? draft.jpgUrl ?? ""}
                        target="_blank"
                        rel="noreferrer"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[rgb(var(--line))] text-sm font-bold text-[rgb(var(--brand))] transition hover:border-[rgb(var(--brand)/0.4)]"
                        aria-label={`Abrir imagem de ${draft.name}`}
                      >
                        ↗
                      </a>
                    ) : null}
                    <Button
                      variante="fantasma"
                      className="h-10 min-h-10 w-10 shrink-0 px-0 text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400"
                      disabled={remover.isPending}
                      onClick={() => setConfirmando(draft)}
                      aria-label={`Excluir ${draft.name}`}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {confirmando ? (
        <ConfirmDialog
          titulo={`Excluir "${confirmando.name}"?`}
          descricao="Esta ação não pode ser desfeita."
          carregando={remover.isPending}
          onConfirmar={() => void excluir(confirmando)}
          onCancelar={() => setConfirmando(null)}
        />
      ) : null}
    </>
  );
}
