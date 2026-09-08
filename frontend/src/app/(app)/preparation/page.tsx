"use client";

import { useState } from "react";

import { FormCompany } from "@/components/preparation/FormCompany";
import { FormStore } from "@/components/preparation/FormStore";
import { FormTheme } from "@/components/preparation/FormTheme";
import { ListCompanies } from "@/components/preparation/ListCompanies";
import { ListStores } from "@/components/preparation/ListStores";
import { Button } from "@/components/ui/Button";
import { Card, SecaoVazia } from "@/components/ui/Card";
import type { Company, Store } from "@/types";

function Secao({
  titulo,
  descricao,
  acao,
  children,
}: {
  titulo: string;
  descricao: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{titulo}</h2>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {descricao}
          </p>
        </div>
        {acao}
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
}

export default function PreparationPage() {
  const [empresa, setEmpresa] = useState<Company | null>(null);

  const [formEmpresa, setFormEmpresa] = useState<
    { modo: "novo" } | { modo: "editar"; empresa: Company } | null
  >(null);
  const [formLoja, setFormLoja] = useState<
    { modo: "novo" } | { modo: "editar"; loja: Store } | null
  >(null);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Preparação</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Cadastre a empresa, as lojas que aparecem no rodapé do encarte e os
          temas visuais.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Secao
          titulo="Empresas"
          descricao="Selecione uma para ver as lojas"
          acao={
            formEmpresa ? null : (
              <Button
                className="px-3 py-1.5 text-xs"
                onClick={() => setFormEmpresa({ modo: "novo" })}
              >
                Nova
              </Button>
            )
          }
        >
          {formEmpresa ? (
            <FormCompany
              empresa={
                formEmpresa.modo === "editar" ? formEmpresa.empresa : undefined
              }
              onFechar={() => setFormEmpresa(null)}
            />
          ) : (
            <ListCompanies
              selecionadaId={empresa?.id ?? null}
              onSelecionar={setEmpresa}
              onEditar={(e) => setFormEmpresa({ modo: "editar", empresa: e })}
              onRemovida={(id) => {
                // a coluna de lojas nao pode continuar apontando
                // para uma empresa que deixou de existir
                if (empresa?.id === id) setEmpresa(null);
              }}
            />
          )}
        </Secao>

        <Secao
          titulo="Lojas"
          descricao={
            empresa ? `De ${empresa.name}` : "Selecione uma empresa primeiro"
          }
          acao={
            empresa && !formLoja ? (
              <Button
                className="px-3 py-1.5 text-xs"
                onClick={() => setFormLoja({ modo: "novo" })}
              >
                Nova
              </Button>
            ) : null
          }
        >
          {!empresa ? (
            <SecaoVazia>Nenhuma empresa selecionada.</SecaoVazia>
          ) : formLoja ? (
            <FormStore
              companyId={empresa.id}
              loja={formLoja.modo === "editar" ? formLoja.loja : undefined}
              onFechar={() => setFormLoja(null)}
            />
          ) : (
            <ListStores
              companyId={empresa.id}
              onEditar={(l) => setFormLoja({ modo: "editar", loja: l })}
            />
          )}
        </Secao>

        <Secao titulo="Temas" descricao="Arte de fundo por dia da semana">
          <FormTheme />
        </Secao>
      </div>
    </div>
  );
}
