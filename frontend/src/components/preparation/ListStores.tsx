"use client";

import { Button } from "@/components/ui/Button";
import { Erro, SecaoVazia } from "@/components/ui/Card";
import { useRemoverLoja, useStores } from "@/hooks/useStores";
import type { Store } from "@/types";

export function ListStores({
  companyId,
  onEditar,
}: {
  companyId: string;
  onEditar: (loja: Store) => void;
}) {
  const { data, isLoading, isError, error } = useStores(companyId);
  const remover = useRemoverLoja(companyId);

  if (isLoading)
    return <p className="text-sm text-neutral-500">Carregando lojas...</p>;
  if (isError)
    return <Erro>{(error as Error)?.message ?? "Falha ao carregar"}</Erro>;
  if (!data?.length)
    return <SecaoVazia>Esta empresa ainda não tem lojas.</SecaoVazia>;

  return (
    <ul className="space-y-2">
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
                onClick={() => onEditar(loja)}
              >
                Editar
              </Button>
              <Button
                variante="fantasma"
                className="px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                disabled={remover.isPending}
                onClick={() => {
                  if (confirm(`Excluir a loja "${loja.name}"?`)) {
                    remover.mutate(loja.id);
                  }
                }}
              >
                Excluir
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
