"use client";

import Link from "next/link";
import { useState } from "react";

import { EditThemeModal } from "@/components/preparation/EditThemeModal";
import { ThemeCard } from "@/components/preparation/ThemeCard";
import { Button } from "@/components/ui/Button";
import { SecaoVazia } from "@/components/ui/Card";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useCompanies } from "@/hooks/useCompanies";
import { useThemes } from "@/hooks/useThemes";

type EstadoModal = { modo: "novo" } | { modo: "editar"; id: string } | null;

export default function ThemesPage() {
  const { data: empresas, isLoading: carregandoEmpresas } = useCompanies();
  const empresa = empresas?.[0];

  const { data: temas, isLoading: carregandoTemas } = useThemes(
    empresa?.id ?? null
  );

  const [modal, setModal] = useState<EstadoModal>(null);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/preparation"
        className="text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        ← Preparação
      </Link>

      <div className="mt-2 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Temas</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {empresa
              ? `Temas de ${empresa.name}, com a arte de cada formato`
              : "Cadastre uma empresa antes"}
          </p>
        </div>
        {empresa ? (
          <Button
            className="px-3 py-1.5 text-xs"
            onClick={() => setModal({ modo: "novo" })}
          >
            Novo tema
          </Button>
        ) : null}
      </div>

      <div className="mt-6">
        {carregandoEmpresas || carregandoTemas ? (
          <SkeletonLista />
        ) : !empresa ? (
          <SecaoVazia>
            Cadastre uma empresa em Preparação antes de criar temas.
          </SecaoVazia>
        ) : !temas?.length ? (
          <SecaoVazia>Nenhum tema ainda. Crie o primeiro.</SecaoVazia>
        ) : (
          <div className="space-y-4">
            {temas.map((tema) => (
              <ThemeCard
                key={tema.id}
                tema={tema}
                companyId={empresa.id}
                onEditar={() => setModal({ modo: "editar", id: tema.id })}
              />
            ))}
          </div>
        )}
      </div>

      {modal && empresa ? (
        <EditThemeModal
          companyId={empresa.id}
          temaId={modal.modo === "editar" ? modal.id : undefined}
          onFechar={() => setModal(null)}
        />
      ) : null}
    </div>
  );
}
