"use client";

import { MotionConfig } from "framer-motion";

// Etapa 26: config global do Framer Motion.
// reducedMotion="user" faz TODO componente <motion.*> abaixo respeitar
// sozinho o "prefers-reduced-motion" do sistema operacional (troca a
// animacao por um corte instantaneo) - nao precisa checar isso em cada
// componente que a gente for animar nas proximas etapas.
const TRANSICAO_PADRAO = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1] as const, // mesma curva "expo out" do CSS (--ease-glass)
};

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={TRANSICAO_PADRAO}>
      {children}
    </MotionConfig>
  );
}
