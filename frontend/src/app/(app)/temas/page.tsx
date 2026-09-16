import Link from "next/link";

import { EncartePreviewer } from "@/components/encarte/EncartePreviewer";
import { ModelTabs } from "@/components/themes/ModelTabs";
import { exemploCom } from "@/lib/temas/exemplo";
import { TEMAS_PROMOCAO_DO_DIA } from "@/lib/temas/promocaoDoDia";

// Sem isso, o Next trata a pagina como estatica (nao usa nenhuma API
// dinamica) e guarda o RSC no cache do navegador - navegando ate aqui
// por um <Link> em vez de um reload inteiro, dava pra ver uma versao
// renderizada de antes de um ajuste no tema, mesmo com o codigo novo
// ja publicado (o gerador de verdade, client-side, sempre mostrava
// certo - so essa pagina de listagem ficava presa no cache).
export const dynamic = "force-dynamic";

// Etapa 27: foco exclusivo no formato de 8 itens - os outros 5
// continuam existindo em TEMAS_PROMOCAO_DO_DIA (lib/temas), so a
// galeria para de mostrá-los. Basta tirar o filter pra trazer de volta.
const TEMAS_EM_FOCO = TEMAS_PROMOCAO_DO_DIA.filter((t) => t.formato === 8);

export default function TemasPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--brand))]">
        Biblioteca visual
      </p>
      <h1 className="text-lg font-semibold">Modelos</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Escolha a aparência que melhor combina com a sua próxima oferta.
      </p>
      <ModelTabs ativo="galeria" />

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        {TEMAS_EM_FOCO.map((tema) => {
          const { itens, ...dados } = exemploCom(tema.formato);
          return (
            <article
              key={tema.id}
              className="overflow-hidden rounded-3xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] shadow-[0_18px_48px_-34px_rgb(24_65_45/0.4)]"
            >
              <div className="bg-[rgb(var(--surface-subtle))] p-4 sm:p-5">
                <EncartePreviewer
                  produtos={itens}
                  formato={tema.formato as 1 | 2 | 4 | 6 | 8 | 10}
                  {...dados}
                />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-[rgb(var(--accent-soft))] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[rgb(var(--accent))]">
                      Modelo disponível
                    </span>
                    <h2 className="mt-3 text-base font-bold">{tema.nome}</h2>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Feed 1080 × 1350 · {tema.formato} itens
                    </p>
                  </div>
                  <Link
                    href={`/temas/preview?formato=${tema.formato}`}
                    className="rounded-xl border border-[rgb(var(--line))] px-3 py-2 text-xs font-semibold text-[rgb(var(--brand))] transition hover:border-[rgb(var(--brand)/0.4)]"
                  >
                    Ver tamanho real
                  </Link>
                </div>
                <Link
                  href="/generate-encarte"
                  className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[rgb(var(--brand))] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgb(var(--brand-strong))] dark:text-neutral-950"
                >
                  Usar este modelo
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
