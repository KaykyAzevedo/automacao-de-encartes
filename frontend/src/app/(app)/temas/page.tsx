import Link from "next/link";

import { EXEMPLO_PROMOCAO_DO_DIA } from "@/lib/temas/exemplo";
import { PROMOCAO_DO_DIA_2 } from "@/lib/temas/promocaoDoDia2";
import { renderizarTema } from "@/lib/temas/render";

export default function TemasPage() {
  const svg = renderizarTema(PROMOCAO_DO_DIA_2, EXEMPLO_PROMOCAO_DO_DIA);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Temas</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Promoção do Dia · formato de 2 itens · 1080x1350
          </p>
        </div>
        <Link
          href="/temas/preview"
          className="text-sm font-medium underline underline-offset-4"
        >
          Ver em tamanho real
        </Link>
      </div>

      <div
        className="mt-6 overflow-hidden rounded-xl border border-neutral-200 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full dark:border-neutral-800"
        // o template e conteudo nosso, versionado no repositorio,
        // e os dados passam por escape no renderizarTema
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
