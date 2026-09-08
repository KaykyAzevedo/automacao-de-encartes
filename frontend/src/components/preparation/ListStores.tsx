"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Erro, SecaoVazia } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useRemoverLoja, useStores } from "@/hooks/useStores";
import type { Store } from "@/types";

export function ListStores({
  companyId,
  onEditar,
}: {
  companyId: string;
  onEditar: (loja: Store) => void;
}) {
  const { data, isLoading, isError, error, isFetching } = useStores(companyId);
  const remover = useRemoverLoja(companyId);
  const { mostrar } = useToast();
  const [confirmando, setConfirmando] = useState<Store | null>(null);

  if (isLoading) return <SkeletonLista linhas={2} />;
  if (isError)
    return <Erro>{(error as Error)?.message ?? "Falha ao carregar"}</Erro>;
  if (!data?.length)
    return <SecaoVazia>Esta empresa ainda não tem lojas.</SecaoVazia>;

  async function excluir(loja: Store) {
    try {
      await remover.mutateAsync(loja.id);
      mostrar("sucesso", `Loja "${loja.name}" excluída.`);
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
        className={`space-y-2 transition-opacity ${isFetching ? "opacity-60" : ""}`}
      >
        {data.map((loja) => (
          <li
            key={loja.id}
            className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{loja.name}</p>
                <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {loja.address}
                </p>
                {loja.deliveryPhone ? (
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    WhatsApp: {loja.deliveryPhone}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 gap-1">
                <Button
                  variante="fantasma"
                  className="px-2 py-1 text-xs"
                  disabled={remover.isPending}
                  onClick={() => onEditar(loja)}
                >
                  Editar
                </Button>
                <Button
                  variante="fantasma"
                  className="px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                  disabled={remover.isPending}
                  onClick={() => setConfirmando(loja)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {confirmando ? (
        <ConfirmDialog
          titulo={`Excluir a loja "${confirmando.name}"?`}
          descricao="Esta ação não pode ser desfeita."
          carregando={remover.isPending}
          onConfirmar={() => void excluir(confirmando)}
          onCancelar={() => setConfirmando(null)}
        />
      ) : null}
    </>
  );
}
