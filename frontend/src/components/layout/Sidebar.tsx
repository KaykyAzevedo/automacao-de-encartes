"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", rotulo: "Dashboard" },
  { href: "/preparation", rotulo: "Preparação" },
];

export function Sidebar() {
  const atual = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-neutral-200 px-4 py-2 md:h-full md:w-52 md:shrink-0 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:px-3 md:py-4 dark:border-neutral-800">
      {LINKS.map((l) => {
        const ativo = atual === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
              ativo
                ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            {l.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
