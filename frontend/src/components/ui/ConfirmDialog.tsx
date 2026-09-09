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
    const fechar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancelar();
    };
    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [onCancelar]);

  useTravaFoco(painelRef);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancelar}
        aria-hidden="true"
      />
      <div
        ref={painelRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="relative w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-xl outline-none dark:border-neutral-800 dark:bg-neutral-950"
      >
        <h2 className="text-sm font-semibold">{titulo}</h2>
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
