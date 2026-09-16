"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Erro, SecaoVazia } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
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
  onRemovida,
}: {
  selecionadaId: string | null;
  onSelecionar: (empresa: Company) => void;
  onEditar: (empresa: Company) => void;
  onRemovida: (id: string) => void;
}) {
  const { data, isLoading, isError, error, isFetching } = useCompanies();
  const remover = useRemoverEmpresa();
  const { mostrar } = useToast();
  const [confirmando, setConfirmando] = useState<Company | null>(null);

  if (isLoading) return <SkeletonLista />;
  if (isError)
    return <Erro>{(error as Error)?.message ?? "Falha ao carregar"}</Erro>;
  if (!data?.length)
    return <SecaoVazia>Nenhuma empresa ainda. Crie a primeira.</SecaoVazia>;

  async function excluir(empresa: Company) {
    try {
      await remover.mutateAsync(empresa.id);
      mostrar("sucesso", `Empresa "${empresa.name}" excluída.`);
      onRemovida(empresa.id);
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
        aria-busy={isFetching || undefined}
        className={`space-y-2 transition-opacity ${isFetching ? "opacity-60" : ""}`}
      >
        {data.map((empresa) => {
          const ativa = empresa.id === selecionadaId;
          const excluindo = remover.isPending && confirmando?.id === empresa.id;

          return (
            <li key={empresa.id}>
              <div
                className={`flex items-center gap-2 rounded-xl border p-2 transition ${
                  excluindo ? "opacity-50" : ""
                } ${
                  ativa
                    ? "border-[rgb(var(--brand))] bg-[rgb(var(--brand-soft))]"
                    : "border-[rgb(var(--line))] bg-[rgb(var(--surface))] hover:border-[rgb(var(--brand))]"
                }`}
              >
                <button
                  type="button"
                  aria-pressed={ativa}
                  onClick={() => onSelecionar(empresa)}
                  className="min-w-0 flex-1 rounded-lg px-2 py-1.5 text-left"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate text-sm font-semibold">
                      {empresa.name}
                      {ativa ? (
                        <span className="rounded-full bg-[rgb(var(--brand))] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Selecionada
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {ROTULO_ESTILO[empresa.style]}
                      {empresa._count
                        ? ` · ${empresa._count.stores} loja(s) · ${empresa._count.products} produto(s)`
                        : null}
                    </p>
                  </div>
                </button>

                <div className="flex shrink-0 gap-1">
                  <Button
                    variante="fantasma"
                    className="px-2 py-1 text-xs"
                    disabled={remover.isPending}
                    onClick={() => onEditar(empresa)}
                  >
                    Editar
                  </Button>
                  <Button
                    variante="fantasma"
                    className="px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                    disabled={remover.isPending}
                    onClick={() => setConfirmando(empresa)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {confirmando ? (
        <ConfirmDialog
          titulo={`Excluir "${confirmando.name}"?`}
          descricao="As lojas, produtos e modelos desta empresa serão removidos junto. Esta ação não pode ser desfeita."
          carregando={remover.isPending}
          onConfirmar={() => void excluir(confirmando)}
          onCancelar={() => setConfirmando(null)}
        />
      ) : null}
    </>
  );
}
