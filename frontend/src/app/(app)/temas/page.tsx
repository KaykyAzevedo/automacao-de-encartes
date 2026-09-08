import Link from "next/link";

import { exemploCom } from "@/lib/temas/exemplo";
import { TEMAS_PROMOCAO_DO_DIA } from "@/lib/temas/promocaoDoDia";
import { renderizarTema } from "@/lib/temas/render";

export default function TemasPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-lg font-semibold">Temas</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Promoção do Dia · {TEMAS_PROMOCAO_DO_DIA.length} formatos · 1080x1350
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {TEMAS_PROMOCAO_DO_DIA.map((tema) => (
          <div key={tema.id}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">{tema.nome}</span>
              <Link
                href={`/temas/preview?formato=${tema.formato}`}
                className="text-xs underline underline-offset-4"
              >
                tamanho real
              </Link>
            </div>
            <div
              className="overflow-hidden rounded-xl border border-neutral-200 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full dark:border-neutral-800"
              dangerouslySetInnerHTML={{
                __html: renderizarTema(tema, exemploCom(tema.formato)),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
