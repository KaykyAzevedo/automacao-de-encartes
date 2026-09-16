import type { HTMLAttributes } from "react";

type Intensidade = "padrao" | "sutil";

const CLASSE_POR_INTENSIDADE: Record<Intensidade, string> = {
  padrao: "glass",
  sutil: "glass-sutil",
};

// Etapa 26: painel de vidro reutilizavel para qualquer superficie
// SEM tag semantica propria (dropdown, popover, um card flutuante
// generico). Header e Sidebar, que ja tem <header>/<nav>, aplicam as
// mesmas classes ".glass"/".glass-sutil" direto no proprio elemento em
// vez de embrulhar numa div extra - ver components/layout/Header.tsx.
export function GlassSurface({
  intensidade = "padrao",
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { intensidade?: Intensidade }) {
  return (
    <div
      {...props}
      className={`rounded-glass ${CLASSE_POR_INTENSIDADE[intensidade]} ${className}`}
    />
  );
}
