"use client";

import Link from "next/link";
import { useState } from "react";

import { ProductPhotoCard } from "@/components/preparation/ProductPhotoCard";
import { SecaoVazia } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useProducts } from "@/hooks/useProducts";

export default function ProductsPage() {
  const { data: empresas, isLoading: carregandoEmpresas } = useCompanies();
  const empresa = empresas?.[0];
  const [busca, setBusca] = useState("");

  const { data: produtos, isLoading: carregandoProdutos } = useProducts(
    empresa?.id ?? null,
    busca
  );

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/preparation"
        className="text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        ← Preparação
      </Link>

      <div className="mt-2">
        <h1 className="text-lg font-semibold">Produtos</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {empresa
            ? `Fotos de ${empresa.name} - envie fotos suas além das do banco público`
            : "Cadastre uma empresa antes"}
        </p>
      </div>

      {empresa ? (
        <div className="mt-4 max-w-xs">
          <Input
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      ) : null}

      <div className="mt-6">
        {carregandoEmpresas || (empresa && carregandoProdutos) ? (
          <SkeletonLista />
        ) : !empresa ? (
          <SecaoVazia>
            Cadastre uma empresa em Preparação antes de gerenciar produtos.
          </SecaoVazia>
        ) : !produtos?.length ? (
          <SecaoVazia>Nenhum produto encontrado.</SecaoVazia>
        ) : (
          <div className="space-y-3">
            {produtos.map((produto) => (
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
