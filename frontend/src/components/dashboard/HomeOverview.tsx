"use client";

import Link from "next/link";

import { NavIcon } from "@/components/layout/NavIcon";
import type { NavIconName } from "@/components/layout/navigation";
import { Card } from "@/components/ui/Card";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useEncartes } from "@/hooks/useEncartes";

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function StatCard({
  label,
  valor,
  detalhe,
  href,
  icon,
}: {
  label: string;
  valor: number | string;
  detalhe: string;
  href: string;
  icon: NavIconName;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-4 shadow-[0_12px_32px_-26px_rgb(24_65_45/0.45)] transition-all hover:-translate-y-0.5 hover:border-[rgb(var(--brand)/0.35)] hover:shadow-[0_18px_36px_-24px_rgb(var(--brand)/0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgb(var(--brand))] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{valor}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--surface-subtle))] text-[rgb(var(--brand))] transition-colors group-hover:bg-[rgb(var(--accent-soft))] group-hover:text-[rgb(var(--accent))]">
          <NavIcon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
        {detalhe}
      </p>
    </Link>
  );
}

export function HomeOverview({ nome }: { nome: string }) {
  const { data: empresas, isLoading: carregandoEmpresas } = useCompanies();
  const empresa = empresas?.[0];
  const { data: encartes, isLoading: carregandoEncartes } = useEncartes(
    empresa?.id ?? null
  );

  const totais = (empresas ?? []).reduce(
    (acc, atual) => ({
      lojas: acc.lojas + (atual._count?.stores ?? 0),
      produtos: acc.produtos + (atual._count?.products ?? 0),
      modelos: acc.modelos + (atual._count?.themes ?? 0),
    }),
    { lojas: 0, produtos: 0, modelos: 0 }
  );

  const checklist = [
    { label: "Empresa cadastrada", pronto: Boolean(empresas?.length) },
    { label: "Loja cadastrada", pronto: totais.lojas > 0 },
    { label: "Catálogo de produtos", pronto: totais.produtos > 0 },
    {
      label: "Modelo configurado",
      pronto: totais.modelos > 0 || Boolean(empresa?.defaultEscalas),
    },
  ];
  const concluidos = checklist.filter((item) => item.pronto).length;

  return (
    <div className="mx-auto max-w-7xl">
      <section className="relative overflow-hidden rounded-3xl bg-[rgb(var(--brand-strong))] px-5 py-7 text-white shadow-[0_24px_60px_-32px_rgb(var(--brand))] sm:px-8 sm:py-9">
        <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-[rgb(var(--accent)/0.22)] blur-3xl" />
        <div className="absolute -bottom-28 right-1/3 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-semibold text-white/70">
            {saudacao()}, {nome}
          </p>
          <h1 className="mt-2 text-white">
            Pronto para criar a próxima oferta?
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Monte um encarte com seus produtos, preços e identidade visual em
            poucos passos.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/generate-encarte"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[rgb(var(--accent))] px-5 py-2.5 text-sm font-bold text-neutral-950 shadow-lg transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <NavIcon name="create" className="h-5 w-5" />
              Criar novo encarte
            </Link>
            <Link
              href="/drafts"
              className="inline-flex min-h-11 items-center rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Ver meus encartes
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">Visão geral</h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Seus cadastros e materiais disponíveis.
            </p>
          </div>
          <Link
            href="/preparation"
            className="text-xs font-semibold text-[rgb(var(--brand))] hover:underline"
          >
            Gerenciar cadastros
          </Link>
        </div>

        {carregandoEmpresas ? (
          <SkeletonLista linhas={4} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Empresas"
              valor={empresas?.length ?? 0}
              detalhe="Identidades cadastradas"
              href="/preparation"
              icon="preparation"
            />
            <StatCard
              label="Lojas"
              valor={totais.lojas}
              detalhe="Endereços para o rodapé"
              href="/preparation"
              icon="preparation"
            />
            <StatCard
              label="Produtos"
              valor={totais.produtos}
              detalhe="Itens no seu catálogo"
              href="/preparation/products"
              icon="drafts"
            />
            <StatCard
              label="Modelos"
              valor={totais.modelos}
              detalhe="Artes personalizadas"
              href="/temas"
              icon="themes"
            />
          </div>
        )}
      </section>

      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Encartes recentes</h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Continue rapidamente de onde parou.
              </p>
            </div>
            <Link
              href="/drafts"
              className="text-xs font-semibold text-[rgb(var(--brand))] hover:underline"
            >
              Ver todos
            </Link>
          </div>

          <div className="mt-5">
            {carregandoEmpresas || carregandoEncartes ? (
              <SkeletonLista linhas={3} />
            ) : encartes?.length ? (
              <ul className="divide-y divide-[rgb(var(--line))]">
                {encartes.slice(0, 3).map((encarte) => (
                  <li key={encarte.id}>
                    <Link
                      href={`/generate-encarte?draftId=${encarte.id}`}
                      className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[rgb(var(--surface-subtle))] text-[rgb(var(--brand))]">
                        <NavIcon name="drafts" className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold group-hover:text-[rgb(var(--brand))]">
                          {encarte.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-neutral-400">
                          {encarte.selectedFormat} itens · atualizado{" "}
                          {dataCurta(encarte.updatedAt)}
                        </span>
                      </span>
                      <span className="text-lg text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-[rgb(var(--brand))]">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-[rgb(var(--line))] bg-[rgb(var(--surface-subtle)/0.45)] px-5 py-8 text-center">
                <p className="text-sm font-semibold">
                  Nenhum encarte salvo ainda
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Sua próxima criação aparecerá aqui.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          {concluidos === checklist.length ? (
            <>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[rgb(var(--brand))] text-lg text-white dark:text-neutral-950">
                  ✓
                </span>
                <div>
                  <h2 className="text-base font-bold">Tudo configurado</h2>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    Empresa, loja, catálogo e modelo prontos.
                  </p>
                </div>
              </div>
              <Link
                href="/preparation"
                className="mt-6 inline-flex text-sm font-semibold text-[rgb(var(--brand))] hover:underline"
              >
                Gerenciar cadastros →
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold">Configuração inicial</h2>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {concluidos} de {checklist.length} concluídos
                  </p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[rgb(var(--accent-soft))] text-sm font-bold text-[rgb(var(--accent))]">
                  {Math.round((concluidos / checklist.length) * 100)}%
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[rgb(var(--surface-subtle))]">
                <div
                  className="h-full rounded-full bg-[rgb(var(--brand))] transition-all"
                  style={{ width: `${(concluidos / checklist.length) * 100}%` }}
                />
              </div>
              <ul className="mt-5 space-y-3">
                {checklist.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${item.pronto ? "bg-[rgb(var(--brand))] text-white dark:text-neutral-950" : "border border-[rgb(var(--line))] text-neutral-400"}`}
                    >
                      {item.pronto ? "✓" : ""}
                    </span>
                    <span
                      className={
                        item.pronto
                          ? "text-neutral-500 line-through dark:text-neutral-400"
                          : "font-medium"
                      }
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/onboarding"
                className="mt-6 inline-flex text-sm font-semibold text-[rgb(var(--brand))] hover:underline"
              >
                Continuar configuração →
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
