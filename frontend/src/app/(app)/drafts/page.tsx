"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, Erro, SecaoVazia } from "@/components/ui/Card";
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
    <div className="mx-auto max-w-4xl">
      <h1 className="text-lg font-semibold">Rascunhos</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Encartes salvos para retomar depois - abra para continuar editando ou
        gerar o download.
      </p>

      <div className="mt-6">
        {carregandoEmpresas ? (
          <SkeletonLista />
        ) : !empresa ? (
          <SecaoVazia>
            Cadastre uma empresa em Preparação antes de salvar rascunhos.
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
      <SecaoVazia>Nenhum rascunho ainda. Salve um em Gerar encarte.</SecaoVazia>
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
        className={`space-y-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}
      >
        {data.map((draft) => {
          const excluindo = remover.isPending && confirmando?.id === draft.id;
          return (
            <li key={draft.id}>
              <Card className={excluindo ? "opacity-50" : ""}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{draft.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {draft.selectedFormat}{" "}
                      {draft.selectedFormat === 1 ? "item" : "itens"} ·
                      atualizado em {dataFormatada(draft.updatedAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Link href={`/generate-encarte?draftId=${draft.id}`}>
                      <Button
                        variante="secundario"
                        className="px-2 py-1 text-xs"
                        disabled={remover.isPending}
                      >
                        Abrir
                      </Button>
                    </Link>
                    <Button
                      variante="fantasma"
                      className="px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                      disabled={remover.isPending}
                      onClick={() => setConfirmando(draft)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
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
