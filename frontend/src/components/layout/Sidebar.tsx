"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", rotulo: "Dashboard" },
  { href: "/preparation", rotulo: "Preparação" },
  { href: "/temas", rotulo: "Temas" },
  { href: "/generate-encarte", rotulo: "Gerar encarte" },
  { href: "/drafts", rotulo: "Rascunhos" },
];

export function Sidebar() {
  const atual = usePathname();

  return (
    // Etapa 26: sticky (nao mais um bloco comum) pra flutuar sobre o
    // conteudo enquanto a pagina rola - "top-14" encosta logo abaixo
    // do Header (h-14). self-start evita que o flex-row estique a
    // sidebar pra altura inteira do main, o que quebraria o sticky.
    <nav
      aria-label="Navegação principal"
      className="glass sticky top-14 z-30 flex gap-1 overflow-x-auto px-4 py-2 md:top-14 md:w-52 md:shrink-0 md:flex-col md:self-start md:overflow-visible md:px-3 md:py-4"
    >
      {LINKS.map((l) => {
        const ativo = atual === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={ativo ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
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
