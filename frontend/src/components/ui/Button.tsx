"use client";

import type { ButtonHTMLAttributes } from "react";

import { Spinner } from "./Spinner";

type Variante = "primario" | "secundario" | "perigo" | "fantasma";

const ESTILOS: Record<Variante, string> = {
  primario:
    "bg-[rgb(var(--brand))] text-white shadow-[0_8px_22px_-12px_rgb(var(--brand))] hover:bg-[rgb(var(--brand-strong))] hover:shadow-[0_10px_26px_-12px_rgb(var(--brand))] dark:text-neutral-950",
  secundario:
    "border border-[rgb(var(--line))] bg-[rgb(var(--surface))] text-[rgb(var(--foreground))] hover:border-[rgb(var(--brand)/0.4)] hover:bg-[rgb(var(--surface-subtle))]",
  perigo:
    "border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950",
  fantasma:
    "text-neutral-600 hover:bg-[rgb(var(--surface-subtle))] hover:text-[rgb(var(--brand))] dark:text-neutral-400",
};

export function Button({
  variante = "primario",
  className = "",
  carregando = false,
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  // mostra o spinner e desabilita o botao - poupa cada tela de
  // repetir "disabled={pending}" + o proprio marcador de carregando
  carregando?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--brand))] disabled:cursor-not-allowed disabled:opacity-50 ${ESTILOS[variante]} ${className}`}
    >
      {carregando ? <Spinner tamanho="sm" /> : null}
      {children}
    </button>
  );
}
