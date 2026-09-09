"use client";

import type { ProdutoMatch } from "@/lib/match";

// Etapa 21: mostra a foto do banco publico + os uploads do usuario
// pra esse produto, cada uma com seu selo, pra escolher qual usar
// NESTE encarte (nao muda a foto principal do produto - isso e feito
// em Preparação > Produtos).
export function SeletorDeFoto({
  produto,
  fotoEscolhida,
  onEscolher,
}: {
  produto: ProdutoMatch;
  fotoEscolhida: string | null;
  onEscolher: (url: string | null) => void;
}) {
  if (produto.userPhotos.length === 0) return null;

  const opcoes: { url: string | null; selo: string }[] = [
    { url: null, selo: "banco" },
    ...produto.userPhotos.map((url) => ({ url, selo: "seu upload" })),
  ];

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        Foto:
      </span>
      {opcoes.map(({ url, selo }) => {
        const src = url ?? produto.photoS3Url;
        const ativa = fotoEscolhida === url;
        return (
          <button
            key={url ?? "banco"}
            type="button"
            onClick={() => onEscolher(url)}
            title={selo === "banco" ? "Foto do banco público" : "Seu upload"}
            className={`flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2 text-xs transition ${
              ativa
                ? "border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800"
                : "border-neutral-300 hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="h-5 w-5 rounded-full object-cover"
            />
            {selo}
          </button>
        );
      })}
    </div>
  );
}
