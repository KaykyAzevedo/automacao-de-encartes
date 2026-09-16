"use client";

import { useEffect, useRef } from "react";

import { useTravaFoco } from "@/hooks/useTravaFoco";

export function Modal({
  titulo,
  onFechar,
  children,
  largura = "max-w-lg",
}: {
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
  largura?: string;
}) {
  const painelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fechar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", fechar);
    return () => {
      window.removeEventListener("keydown", fechar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onFechar]);

  useTravaFoco(painelRef);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onFechar}
        aria-hidden="true"
      />
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={`relative max-h-[90vh] w-full ${largura} overflow-y-auto rounded-3xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-5 shadow-2xl outline-none sm:p-6`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="grid h-9 w-9 place-items-center rounded-xl text-neutral-400 transition hover:bg-[rgb(var(--surface-subtle))] hover:text-[rgb(var(--foreground))]"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
