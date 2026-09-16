import Link from "next/link";

// Etapa 33: terceira aba "Ajustes" - o modelo padrao do encarte de 8
// itens por empresa (fundo, fontes, tamanhos, posicoes), editado fora
// do fluxo diario de Gerar Encarte.
export function ModelTabs({
  ativo,
}: {
  ativo: "galeria" | "meus" | "ajustes";
}) {
  const itens = [
    { id: "galeria" as const, href: "/temas", label: "Galeria de modelos" },
    { id: "meus" as const, href: "/preparation/themes", label: "Meus modelos" },
    {
      id: "ajustes" as const,
      href: "/temas/editor",
      label: "Ajustes do modelo",
    },
  ];

  return (
    <nav
      aria-label="Seções de modelos"
      className="mt-5 inline-flex rounded-xl bg-[rgb(var(--surface-subtle))] p-1"
    >
      {itens.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          aria-current={ativo === item.id ? "page" : undefined}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${ativo === item.id ? "bg-[rgb(var(--surface))] text-[rgb(var(--brand))] shadow-sm" : "text-neutral-500 hover:text-[rgb(var(--foreground))]"}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
