"use client";

import Link from "next/link";

import { EncartePreviewer } from "@/components/encarte/EncartePreviewer";
import { ModelTabs } from "@/components/themes/ModelTabs";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useTheme, useThemes, type ThemeResumo } from "@/hooks/useThemes";
import { exemploCom } from "@/lib/temas/exemplo";
import { TEMAS_PROMOCAO_DO_DIA } from "@/lib/temas/promocaoDoDia";

// Etapa 27: foco exclusivo no formato de 8 itens - os outros 5
// continuam existindo em TEMAS_PROMOCAO_DO_DIA (lib/temas), so a
// galeria para de mostrá-los. Basta tirar o filter pra trazer de volta.
const TEMAS_EM_FOCO = TEMAS_PROMOCAO_DO_DIA.filter((t) => t.formato === 8);

// Estúdio de Modelos: os Theme (banco, "Meus modelos") aparecem aqui
// do lado dos modelos embutidos, na mesma biblioteca - antes disso
// eles existiam mas nunca eram usaveis de verdade na geração real.
function CardTemaCustomizado({ tema }: { tema: ThemeResumo }) {
  const { data: completo, isLoading } = useTheme(tema.id);

  return (
    <article className="overflow-hidden rounded-3xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] shadow-[0_18px_48px_-34px_rgb(24_65_45/0.4)]">
      <div
        className={`aspect-[4/5] bg-[rgb(var(--surface-subtle))] p-4 sm:p-5 [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:object-cover ${isLoading ? "animate-pulse" : ""}`}
        dangerouslySetInnerHTML={
          !isLoading && completo ? { __html: completo.format8Svg } : undefined
        }
      />
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-[rgb(var(--surface-subtle))] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[rgb(var(--brand))]">
              Seu modelo
            </span>
            <h2 className="mt-3 text-base font-bold">{tema.themeName}</h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Feed 1080 × 1350 · 8 itens
            </p>
          </div>
        </div>
        <Link
          href={`/generate-encarte?temaId=${tema.id}`}
          className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[rgb(var(--brand))] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgb(var(--brand-strong))] dark:text-neutral-950"
        >
          Usar este modelo
        </Link>
      </div>
    </article>
  );
}

export default function TemasPage() {
  const { data: empresas } = useCompanies();
  const empresa = empresas?.[0];
  const { data: temasCustomizados, isLoading: carregandoCustomizados } =
    useThemes(empresa?.id ?? null);

  return (
    <div className="mx-auto max-w-5xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--brand))]">
        Biblioteca visual
      </p>
      <h1 className="text-lg font-semibold">Modelos</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Escolha a aparência que melhor combina com a sua próxima oferta. Os
        modelos do app e os seus modelos próprios convivem na mesma biblioteca.
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

        {carregandoCustomizados ? (
          <SkeletonLista />
        ) : (
          temasCustomizados?.map((tema) => (
            <CardTemaCustomizado key={tema.id} tema={tema} />
          ))
        )}
      </div>
    </div>
  );
}
