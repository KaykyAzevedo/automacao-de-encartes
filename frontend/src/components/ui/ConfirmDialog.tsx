"use client";

import { useEffect, useRef } from "react";

import { useTravaFoco } from "@/hooks/useTravaFoco";

import { Button } from "./Button";

// Substitui o window.confirm nativo: nao bloqueia a thread,
// da para estilizar e mostra o estado de carregando.
export function ConfirmDialog({
  titulo,
  descricao,
  rotuloConfirmar = "Excluir",
  carregando = false,
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  descricao: string;
  rotuloConfirmar?: string;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const painelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fechar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancelar();
    };
    window.addEventListener("keydown", fechar);
    return () => {
      window.removeEventListener("keydown", fechar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onCancelar]);

  useTravaFoco(painelRef);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onCancelar}
        aria-hidden="true"
      />
      <div
        ref={painelRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="relative w-full max-w-sm rounded-3xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-6 shadow-2xl outline-none"
      >
        <span
          className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-red-500/10 text-lg font-bold text-red-600 dark:text-red-400"
          aria-hidden="true"
        >
          !
        </span>
        <h2 className="text-base font-bold">{titulo}</h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {descricao}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variante="secundario"
            onClick={onCancelar}
            disabled={carregando}
          >
            Cancelar
          </Button>
          <Button
            variante="perigo"
            onClick={onConfirmar}
            carregando={carregando}
            autoFocus
          >
            {carregando ? "Excluindo..." : rotuloConfirmar}
          </Button>
        </div>
      </div>
    </div>
  );
}
