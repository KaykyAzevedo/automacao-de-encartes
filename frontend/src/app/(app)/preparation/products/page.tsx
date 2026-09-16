"use client";

import Link from "next/link";
import { useState } from "react";

import { ProductPhotoCard } from "@/components/preparation/ProductPhotoCard";
import { SecaoVazia } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useProducts } from "@/hooks/useProducts";

type FiltroFoto = "todos" | "com-upload" | "sem-upload";

export default function ProductsPage() {
  const { data: empresas, isLoading: carregandoEmpresas } = useCompanies();
  const empresa = empresas?.[0];
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroFoto>("todos");

  const { data: produtos, isLoading: carregandoProdutos } = useProducts(
    empresa?.id ?? null,
    busca
  );

  const comUpload =
    produtos?.filter((produto) => produto.userPhotos.length > 0).length ?? 0;
  const semUpload = (produtos?.length ?? 0) - comUpload;
  const produtosFiltrados = produtos?.filter((produto) => {
    if (filtro === "com-upload") return produto.userPhotos.length > 0;
    if (filtro === "sem-upload") return produto.userPhotos.length === 0;
    return true;
  });

  const filtros: { id: FiltroFoto; label: string; quantidade: number }[] = [
    { id: "todos", label: "Todos", quantidade: produtos?.length ?? 0 },
    { id: "com-upload", label: "Com foto própria", quantidade: comUpload },
    { id: "sem-upload", label: "Só foto do catálogo", quantidade: semUpload },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/preparation"
        className="text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        ← Cadastros
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--brand))]">
            Catálogo visual
          </p>
          <h1 className="text-lg font-semibold">Produtos</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {empresa
              ? `Gerencie as imagens usadas nos encartes de ${empresa.name}.`
              : "Cadastre uma empresa antes"}
          </p>
        </div>
        {produtos ? (
          <span className="rounded-full bg-[rgb(var(--surface-subtle))] px-3 py-1.5 text-xs font-semibold text-neutral-500">
            {produtos.length} produto(s)
          </span>
        ) : null}
      </div>

      {empresa ? (
        <div className="mt-6 rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                ⌕
              </span>
              <Input
                aria-label="Buscar produtos"
                placeholder="Buscar por nome do produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <div
              className="flex gap-2 overflow-x-auto pb-1 lg:pb-0"
              aria-label="Filtrar produtos por foto"
            >
              {filtros.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={filtro === item.id}
                  onClick={() => setFiltro(item.id)}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition ${filtro === item.id ? "bg-[rgb(var(--brand))] text-white dark:text-neutral-950" : "bg-[rgb(var(--surface-subtle))] text-neutral-500 hover:text-[rgb(var(--foreground))]"}`}
                >
                  {item.label}{" "}
                  <span className="ml-1 opacity-65">{item.quantidade}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        {carregandoEmpresas || (empresa && carregandoProdutos) ? (
          <SkeletonLista />
        ) : !empresa ? (
          <SecaoVazia>
            Cadastre uma empresa em Cadastros antes de gerenciar produtos.
          </SecaoVazia>
        ) : !produtosFiltrados?.length ? (
          <SecaoVazia>
            <span className="block font-semibold text-[rgb(var(--foreground))]">
              Nenhum produto encontrado
            </span>
            <span className="mt-1 block">
              Tente outro termo ou altere o filtro de fotos.
            </span>
          </SecaoVazia>
        ) : (
          <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {produtosFiltrados.map((produto) => (
              <ProductPhotoCard
                key={produto.id}
                produto={produto}
                companyId={empresa.id}
                search={busca}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
