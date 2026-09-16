"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useRemoverTema, useTheme, type ThemeResumo } from "@/hooks/useThemes";

const ROTULO_DIA: Record<string, string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

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
      mostrar("sucesso", `Modelo "${tema.themeName}" excluído.`);
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
    <article className="group overflow-hidden rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] shadow-[0_12px_32px_-28px_rgb(24_65_45/0.45)] transition hover:-translate-y-0.5 hover:border-[rgb(var(--brand)/0.35)] hover:shadow-[0_20px_38px_-28px_rgb(var(--brand)/0.3)]">
      <div className="relative bg-[rgb(var(--surface-subtle))] p-4">
        <div
          className={`mx-auto aspect-[4/5] w-full max-w-[240px] overflow-hidden rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] shadow-sm [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:object-cover ${isLoading ? "animate-pulse" : ""}`}
          dangerouslySetInnerHTML={
            !isLoading && completo ? { __html: completo.format8Svg } : undefined
          }
        />
        <span className="absolute left-6 top-6 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          8 itens
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold" title={tema.themeName}>
              {tema.themeName}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Oferta de {ROTULO_DIA[tema.day] ?? tema.day}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[rgb(var(--surface-subtle))] px-2.5 py-1 text-[10px] font-semibold text-[rgb(var(--brand))]">
            Ativo
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[rgb(var(--line))] pt-4">
          <Button
            variante="secundario"
            className="w-full px-3 py-1.5 text-xs"
            onClick={onEditar}
          >
            Editar
          </Button>
          <Button
            variante="fantasma"
            className="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400"
            disabled={remover.isPending}
            onClick={() => setConfirmando(true)}
          >
            Excluir
          </Button>
        </div>
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
    </article>
  );
}
