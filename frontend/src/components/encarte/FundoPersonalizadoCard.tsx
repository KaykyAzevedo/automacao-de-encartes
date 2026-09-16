"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { uploadArquivo } from "@/lib/upload";

// Etapa 31: upload de fundo customizado (extraído da tela de Gerar
// Encarte na Etapa 33 pra ser reaproveitado também no editor de
// modelo padrão) - sobe pelo endpoint genérico de upload e devolve a
// URL por cima do callback, sem guardar estado próprio da URL (quem
// usa decide onde ela mora: escalas.fundoUrl no fluxo diário, ou o
// modelo padrão da empresa no editor).
export function FundoPersonalizadoCard({
  fundoUrl,
  onFundoChange,
}: {
  fundoUrl: string | undefined;
  onFundoChange: (url: string | undefined) => void;
}) {
  const { mostrar } = useToast();
  const [enviando, setEnviando] = useState(false);

  async function trocarFundo(file: File) {
    setEnviando(true);
    try {
      const url = await uploadArquivo(file);
      onFundoChange(url);
      mostrar("sucesso", "Fundo personalizado aplicado.");
    } catch (err) {
      mostrar(
        "erro",
        err instanceof Error ? err.message : "Falha ao enviar o fundo"
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold">Fundo personalizado</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {fundoUrl
              ? "Sua arte está sendo usada no lugar do fundo padrão."
              : "Opcional: mande sua própria arte de fundo em vez do modelo padrão."}
          </p>
        </div>
        {fundoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fundoUrl}
            alt=""
            className="h-14 w-11 shrink-0 rounded-lg border border-[rgb(var(--line))] object-cover"
          />
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={enviando}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void trocarFundo(file);
              e.target.value = "";
            }}
          />
          <span className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[rgb(var(--line))] px-4 py-2 text-sm font-semibold text-[rgb(var(--brand))] transition hover:border-[rgb(var(--brand)/0.4)]">
            {enviando ? <Spinner tamanho="sm" /> : null}
            {enviando
              ? "Enviando..."
              : fundoUrl
                ? "Trocar fundo"
                : "Enviar fundo"}
          </span>
        </label>
        {fundoUrl ? (
          <Button
            type="button"
            variante="fantasma"
            onClick={() => onFundoChange(undefined)}
            disabled={enviando}
          >
            Usar fundo padrão
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
