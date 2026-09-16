"use client";

import Link from "next/link";
import { useState } from "react";

import { EditThemeModal } from "@/components/preparation/EditThemeModal";
import { ThemeCard } from "@/components/preparation/ThemeCard";
import { ModelTabs } from "@/components/themes/ModelTabs";
import { Button } from "@/components/ui/Button";
import { SecaoVazia } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
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
  const [busca, setBusca] = useState("");
  const [dia, setDia] = useState("todos");

  const temasFiltrados = temas?.filter((tema) => {
    const correspondeBusca = tema.themeName
      .toLocaleLowerCase("pt-BR")
      .includes(busca.trim().toLocaleLowerCase("pt-BR"));
    const correspondeDia = dia === "todos" || tema.day === dia;
    return correspondeBusca && correspondeDia;
  });

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/temas"
        className="text-xs text-neutral-500 underline underline-offset-4 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        ← Modelos
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--brand))]">
            Identidade das ofertas
          </p>
          <h1 className="text-lg font-semibold">Meus modelos</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {empresa
              ? `Modelos de ${empresa.name}, com a arte de cada formato`
              : "Cadastre uma empresa antes"}
          </p>
        </div>
        {empresa ? (
          <Button onClick={() => setModal({ modo: "novo" })}>
            + Criar modelo
          </Button>
        ) : null}
      </div>

      <ModelTabs ativo="meus" />

      {empresa && temas?.length ? (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-md">
            <Input
              aria-label="Buscar modelos"
              placeholder="Buscar modelo por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-52">
            <Select
              aria-label="Filtrar modelos por dia"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
            >
              <option value="todos">Todos os dias</option>
              <option value="segunda">Segunda-feira</option>
              <option value="terca">Terça-feira</option>
              <option value="quarta">Quarta-feira</option>
              <option value="quinta">Quinta-feira</option>
              <option value="sexta">Sexta-feira</option>
              <option value="sabado">Sábado</option>
              <option value="domingo">Domingo</option>
            </Select>
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        {carregandoEmpresas || carregandoTemas ? (
          <SkeletonLista />
        ) : !empresa ? (
          <SecaoVazia>
            Cadastre uma empresa em Cadastros antes de criar modelos.
          </SecaoVazia>
        ) : !temas?.length ? (
          <SecaoVazia>Nenhum modelo ainda. Crie o primeiro.</SecaoVazia>
        ) : !temasFiltrados?.length ? (
          <SecaoVazia>
            <span className="block font-semibold text-[rgb(var(--foreground))]">
              Nenhum modelo encontrado
            </span>
            <span className="mt-1 block">
              Tente outro nome ou selecione um dia diferente.
            </span>
          </SecaoVazia>
        ) : (
          <div className="grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {temasFiltrados.map((tema) => (
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
