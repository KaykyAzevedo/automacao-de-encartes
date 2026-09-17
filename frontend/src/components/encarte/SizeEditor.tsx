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

const LIMITE_OFFSET = 60;

// Etapa 31: posicao (empurra em px, sem mudar o tamanho da caixa) -
// um par X/Y por elemento, independente dos outros dois.
const CAMPOS_POSICAO: {
  chaveX: keyof Pick<
    EscalasTema,
    "fotoOffsetX" | "nomeOffsetX" | "precoOffsetX"
  >;
  chaveY: keyof Pick<
    EscalasTema,
    "fotoOffsetY" | "nomeOffsetY" | "precoOffsetY"
  >;
  rotulo: string;
}[] = [
  { chaveX: "fotoOffsetX", chaveY: "fotoOffsetY", rotulo: "Posição da foto" },
  { chaveX: "nomeOffsetX", chaveY: "nomeOffsetY", rotulo: "Posição do nome" },
  {
    chaveX: "precoOffsetX",
    chaveY: "precoOffsetY",
    rotulo: "Posição do preço",
  },
];

export interface SizeEditorProps {
  currentSizes: EscalasTema;
  onSizeChange: (proximo: EscalasTema) => void;
  /**
   * "facil" (padrão) mostra só os tamanhos - fonte e posição por
   * elemento exigem entender qual elemento é qual no SVG, não é o que
   * alguém configurando o modelo pela primeira vez precisa ver.
   * "avancado" mostra tudo (Etapa "Estúdio de Modelos").
   */
  modo?: "facil" | "avancado";
}

// Sliders de tamanho (foto/nome/preco) + seletor de fonte por
// elemento, que alimentam as escalas do EncartePreviewer. Sem estado
// proprio: o valor mora em quem usa (ver generate-encarte/page.tsx),
// entao o editor e o SVG sempre mostram o mesmo estado.
export function SizeEditor({
  currentSizes,
  onSizeChange,
  modo = "avancado",
}: SizeEditorProps) {
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
                className="w-full accent-[rgb(var(--brand))]"
              />
            </div>
          );
        })}
      </div>

      {modo === "avancado" ? (
        <div className="space-y-3 border-t border-[rgb(var(--line))] pt-4">
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
                  className="w-full min-h-11 rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] px-3.5 py-2.5 text-sm text-[rgb(var(--foreground))] outline-none transition-all hover:border-[rgb(var(--brand)/0.4)] focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgb(var(--brand)/0.1)]"
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
      ) : null}

      {modo === "avancado" ? (
        <div className="space-y-4 border-t border-[rgb(var(--line))] pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Posição por elemento
            </p>
            <button
              type="button"
              onClick={() =>
                onSizeChange({
                  ...currentSizes,
                  fotoOffsetX: 0,
                  fotoOffsetY: 0,
                  nomeOffsetX: 0,
                  nomeOffsetY: 0,
                  precoOffsetX: 0,
                  precoOffsetY: 0,
                })
              }
              className="text-xs font-medium text-[rgb(var(--brand))] hover:underline"
            >
              Restaurar
            </button>
          </div>
          {CAMPOS_POSICAO.map(({ chaveX, chaveY, rotulo }) => {
            const valorX = currentSizes[chaveX] ?? 0;
            const valorY = currentSizes[chaveY] ?? 0;
            return (
              <div key={chaveX}>
                <p className="mb-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {rotulo}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor={`pos-${chaveX}`}
                        className="text-[11px] text-neutral-400"
                      >
                        Horizontal
                      </label>
                      <span className="text-[11px] font-mono tabular-nums text-neutral-400">
                        {valorX > 0 ? `+${valorX}` : valorX}px
                      </span>
                    </div>
                    <input
                      id={`pos-${chaveX}`}
                      type="range"
                      min={-LIMITE_OFFSET}
                      max={LIMITE_OFFSET}
                      step={1}
                      value={valorX}
                      onChange={(e) =>
                        onSizeChange({
                          ...currentSizes,
                          [chaveX]: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[rgb(var(--brand))]"
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor={`pos-${chaveY}`}
                        className="text-[11px] text-neutral-400"
                      >
                        Vertical
                      </label>
                      <span className="text-[11px] font-mono tabular-nums text-neutral-400">
                        {valorY > 0 ? `+${valorY}` : valorY}px
                      </span>
                    </div>
                    <input
                      id={`pos-${chaveY}`}
                      type="range"
                      min={-LIMITE_OFFSET}
                      max={LIMITE_OFFSET}
                      step={1}
                      value={valorY}
                      onChange={(e) =>
                        onSizeChange({
                          ...currentSizes,
                          [chaveY]: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[rgb(var(--brand))]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
