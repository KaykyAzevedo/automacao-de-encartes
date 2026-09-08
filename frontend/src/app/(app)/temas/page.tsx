import Link from "next/link";

import { EncartePreviewer } from "@/components/encarte/EncartePreviewer";
import { exemploCom } from "@/lib/temas/exemplo";
import { TEMAS_PROMOCAO_DO_DIA } from "@/lib/temas/promocaoDoDia";

export default function TemasPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-lg font-semibold">Temas</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Promoção do Dia · {TEMAS_PROMOCAO_DO_DIA.length} formatos · 1080x1350
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {TEMAS_PROMOCAO_DO_DIA.map((tema) => {
          const { itens, ...dados } = exemploCom(tema.formato);
          return (
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
              <EncartePreviewer
                produtos={itens}
                formato={tema.formato as 1 | 2 | 4 | 6 | 8 | 10}
                {...dados}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
