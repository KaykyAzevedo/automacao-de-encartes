"use client";

import { Button } from "@/components/ui/Button";
import { Erro, SecaoVazia } from "@/components/ui/Card";
import { useCompanies, useRemoverEmpresa } from "@/hooks/useCompanies";
import type { Company } from "@/types";

const ROTULO_ESTILO: Record<Company["style"], string> = {
  sofisticado: "Sofisticado",
  agressivo: "Agressivo",
};

export function ListCompanies({
  selecionadaId,
  onSelecionar,
  onEditar,
}: {
  selecionadaId: string | null;
  onSelecionar: (empresa: Company) => void;
  onEditar: (empresa: Company) => void;
}) {
  const { data, isLoading, isError, error } = useCompanies();
  const remover = useRemoverEmpresa();

  if (isLoading)
    return <p className="text-sm text-neutral-500">Carregando empresas...</p>;
  if (isError)
    return <Erro>{(error as Error)?.message ?? "Falha ao carregar"}</Erro>;
  if (!data?.length)
    return <SecaoVazia>Nenhuma empresa ainda. Crie a primeira.</SecaoVazia>;

  return (
    <ul className="space-y-2">
      {data.map((empresa) => {
        const ativa = empresa.id === selecionadaId;
        return (
          <li key={empresa.id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelecionar(empresa)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelecionar(empresa);
              }}
              className={`cursor-pointer rounded-lg border p-3 transition ${
                ativa
                  ? "border-neutral-900 bg-neutral-50 dark:border-neutral-100 dark:bg-neutral-900"
                  : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{empresa.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {ROTULO_ESTILO[empresa.style]}
                    {empresa._count
                      ? ` · ${empresa._count.stores} loja(s) · ${empresa._count.products} produto(s)`
                      : null}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <Button
                    variante="fantasma"
                    className="px-2 py-1 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditar(empresa);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variante="fantasma"
                    className="px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                    disabled={remover.isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Excluir "${empresa.name}"? As lojas, produtos e temas dela serão removidos junto.`
                        )
                      ) {
                        remover.mutate(empresa.id);
                      }
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
