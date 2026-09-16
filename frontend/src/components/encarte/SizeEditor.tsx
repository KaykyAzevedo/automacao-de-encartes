"use client";

import {
  FONTES_DISPONIVEIS,
  type FonteId,
} from "@/lib/temas/fontesDisponiveis";
import { ESCALA_PADRAO, type EscalasTema } from "@/lib/temas/promocaoDoDia";

const LIMITE_MIN = 0.5;
const LIMITE_MAX = 1.5;
const PASSO = 0.01;

// So os 3 campos numericos (tamanho) - as fontes tem sua propria
// secao abaixo, com <select> em vez de slider.
const CAMPOS_TAMANHO: {
  chave: keyof Pick<EscalasTema, "foto" | "nome" | "preco">;
  rotulo: string;
}[] = [
  { chave: "foto", rotulo: "Tamanho das fotos" },
  { chave: "nome", rotulo: "Tamanho dos nomes" },
  { chave: "preco", rotulo: "Tamanho dos preços" },
];

// Etapa 30: fonte por elemento - cada um guarda sua propria chave em
// EscalasTema (fonteNome/fontePreco/fonteUnidade), independente dos
// outros dois.
const CAMPOS_FONTE: {
  chave: keyof Pick<EscalasTema, "fonteNome" | "fontePreco" | "fonteUnidade">;
  rotulo: string;
}[] = [
  { chave: "fonteNome", rotulo: "Fonte do nome" },
  { chave: "fontePreco", rotulo: "Fonte do preço" },
  { chave: "fonteUnidade", rotulo: "Fonte da unidade" },
];

export interface SizeEditorProps {
  currentSizes: EscalasTema;
  onSizeChange: (proximo: EscalasTema) => void;
}

// Sliders de tamanho (foto/nome/preco) + seletor de fonte por
// elemento, que alimentam as escalas do EncartePreviewer. Sem estado
// proprio: o valor mora em quem usa (ver generate-encarte/page.tsx),
// entao o editor e o SVG sempre mostram o mesmo estado.
export function SizeEditor({ currentSizes, onSizeChange }: SizeEditorProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {CAMPOS_TAMANHO.map(({ chave, rotulo }) => {
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

      <div className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Fonte por elemento
        </p>
        {CAMPOS_FONTE.map(({ chave, rotulo }) => {
          const valor = currentSizes[chave] ?? ESCALA_PADRAO[chave];
          return (
            <div key={chave}>
              <label
                htmlFor={`fonte-${chave}`}
                className="mb-1 block text-xs text-neutral-500 dark:text-neutral-400"
              >
                {rotulo}
              </label>
              <select
                id={`fonte-${chave}`}
                value={valor}
                onChange={(e) =>
                  onSizeChange({
                    ...currentSizes,
                    [chave]: e.target.value as FonteId,
                  })
                }
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                {FONTES_DISPONIVEIS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.rotulo}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
