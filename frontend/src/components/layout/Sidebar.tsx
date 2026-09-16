"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavIcon } from "./NavIcon";
import { NAV_ITEMS, navItemEstaAtivo } from "./navigation";

export function Sidebar() {
  const atual = usePathname();

  return (
    <aside className="sticky top-[4.5rem] hidden h-[calc(100vh-4.5rem)] w-64 shrink-0 border-r border-[rgb(var(--line)/0.8)] bg-[rgb(var(--surface)/0.75)] px-4 py-6 backdrop-blur-xl md:block">
      <nav aria-label="Navegação principal" className="flex h-full flex-col">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
          Menu principal
        </p>

        <div className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const ativo = navItemEstaAtivo(atual, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  ativo
                    ? "bg-[rgb(var(--brand))] text-white shadow-[0_8px_24px_-12px_rgb(var(--brand))] dark:text-neutral-950"
                    : "text-neutral-600 hover:bg-[rgb(var(--surface-subtle))] hover:text-[rgb(var(--foreground))] dark:text-neutral-400"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors ${
                    ativo
                      ? "bg-white/15 dark:bg-black/10"
                      : item.destaque
                        ? "bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))]"
                        : "bg-[rgb(var(--surface-subtle))] text-neutral-500 group-hover:text-[rgb(var(--brand))]"
                  }`}
                >
                  <NavIcon name={item.icon} className="h-[19px] w-[19px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight">
                    {item.rotulo}
                  </span>
                  <span
                    className={`mt-0.5 block truncate text-[11px] ${
                      ativo
                        ? "text-white/70 dark:text-neutral-900/60"
                        : "text-neutral-400"
                    }`}
                  >
                    {item.descricao}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface-subtle)/0.7)] p-4">
          <div className="mb-2 flex items-center gap-2 text-[rgb(var(--brand))]">
            <span className="h-2 w-2 rounded-full bg-[rgb(var(--accent))]" />
            <span className="text-xs font-semibold">Dica rápida</span>
          </div>
          <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            Revise produtos e lojas antes de criar uma nova arte.
          </p>
        </div>
      </nav>
    </aside>
  );
}
