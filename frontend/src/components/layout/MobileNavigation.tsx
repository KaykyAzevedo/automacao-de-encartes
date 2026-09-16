"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavIcon } from "./NavIcon";
import { NAV_ITEMS, navItemEstaAtivo } from "./navigation";

export function MobileNavigation() {
  const atual = usePathname();

  return (
    <nav
      aria-label="Navegação principal no celular"
      className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border border-[rgb(var(--line)/0.8)] bg-[rgb(var(--surface)/0.95)] p-1.5 shadow-[0_18px_55px_-18px_rgb(0_0_0/0.4)] backdrop-blur-xl md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const ativo = navItemEstaAtivo(atual, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${
              ativo
                ? "bg-[rgb(var(--brand))] text-white dark:text-neutral-950"
                : "text-neutral-500 active:bg-[rgb(var(--surface-subtle))] dark:text-neutral-400"
            }`}
          >
            <NavIcon name={item.icon} className="h-5 w-5" />
            <span className="max-w-full truncate">{item.rotuloCurto}</span>
            {item.destaque && !ativo ? (
              <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[rgb(var(--accent))]" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
