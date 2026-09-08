"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  FORMATOS_TEMA,
  useRemoverTema,
  useTheme,
  type ThemeResumo,
} from "@/hooks/useThemes";

const ROTULO_DIA: Record<string, string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

function campoSvg(
  formato: number
):
  | "format1Svg"
  | "format2Svg"
  | "format4Svg"
  | "format6Svg"
  | "format8Svg"
  | "format10Svg" {
  return `format${formato}Svg` as never;
}

export function ThemeCard({
  tema,
  companyId,
  onEditar,
}: {
  tema: ThemeResumo;
  companyId: string;
  onEditar: () => void;
}) {
  const { data: completo, isLoading } = useTheme(tema.id);
  const remover = useRemoverTema(companyId);
  const { mostrar } = useToast();
  const [confirmando, setConfirmando] = useState(false);

  async function excluir() {
    try {
      await remover.mutateAsync(tema.id);
      mostrar("sucesso", `Tema "${tema.themeName}" excluído.`);
    } catch (err) {
      mostrar(
        "erro",
        err instanceof Error ? err.message : "Não foi possível excluir"
      );
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{tema.themeName}</p>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {ROTULO_DIA[tema.day] ?? tema.day}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variante="fantasma"
            className="px-2 py-1 text-xs"
            onClick={onEditar}
          >
            Editar
          </Button>
          <Button
            variante="fantasma"
            className="px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
            disabled={remover.isPending}
            onClick={() => setConfirmando(true)}
          >
            Excluir
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {FORMATOS_TEMA.map((formato) => (
          <div key={formato} className="text-center">
            <div
              className="aspect-[4/5] overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:object-cover dark:border-neutral-800 dark:bg-neutral-900"
              dangerouslySetInnerHTML={
                !isLoading && completo
                  ? { __html: completo[campoSvg(formato)] }
                  : undefined
              }
            />
            <span className="mt-1 block text-[10px] text-neutral-500 dark:text-neutral-400">
              {formato} {formato === 1 ? "item" : "itens"}
            </span>
          </div>
        ))}
      </div>

      {confirmando ? (
        <ConfirmDialog
          titulo={`Excluir "${tema.themeName}"?`}
          descricao="Esta ação não pode ser desfeita."
          carregando={remover.isPending}
          onConfirmar={() => void excluir()}
          onCancelar={() => setConfirmando(false)}
        />
      ) : null}
    </div>
  );
}
