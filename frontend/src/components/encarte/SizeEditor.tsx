"use client";

import type { EscalasTema } from "@/lib/temas/promocaoDoDia";

const LIMITE_MIN = 0.5;
const LIMITE_MAX = 1.5;
const PASSO = 0.01;

const CAMPOS: { chave: keyof EscalasTema; rotulo: string }[] = [
  { chave: "foto", rotulo: "Tamanho das fotos" },
  { chave: "nome", rotulo: "Tamanho dos nomes" },
  { chave: "preco", rotulo: "Tamanho dos preços" },
];

export interface SizeEditorProps {
  currentSizes: EscalasTema;
  onSizeChange: (proximo: EscalasTema) => void;
}

// 3 sliders (foto/nome/preco), 50% a 150%, que alimentam as escalas
// do EncartePreviewer. Sem estado proprio: o valor mora em quem usa
// (ver generate-encarte/page.tsx), entao o slider e o SVG sempre
// mostram o mesmo numero.
export function SizeEditor({ currentSizes, onSizeChange }: SizeEditorProps) {
  return (
    <div className="space-y-4">
      {CAMPOS.map(({ chave, rotulo }) => {
        const valor = currentSizes[chave];
        return (
          <div key={chave}>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor={`escala-${chave}`}
                className="text-xs font-medium text-neutral-600 dark:text-neutral-400"
              >
                {rotulo}
              </label>
              <span className="text-xs font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                {Math.round(valor * 100)}%
              </span>
            </div>
            <input
              id={`escala-${chave}`}
              type="range"
              min={LIMITE_MIN}
              max={LIMITE_MAX}
              step={PASSO}
              value={valor}
              onChange={(e) =>
                onSizeChange({
                  ...currentSizes,
                  [chave]: Number(e.target.value),
                })
              }
              className="w-full accent-neutral-900 dark:accent-neutral-100"
            />
          </div>
        );
      })}
    </div>
  );
}
