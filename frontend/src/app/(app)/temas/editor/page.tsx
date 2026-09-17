"use client";

import { useEffect, useState } from "react";

import { EncartePreviewer } from "@/components/encarte/EncartePreviewer";
import { FundoPersonalizadoCard } from "@/components/encarte/FundoPersonalizadoCard";
import { SizeEditor } from "@/components/encarte/SizeEditor";
import { ModelTabs } from "@/components/themes/ModelTabs";
import { Button } from "@/components/ui/Button";
import { Card, SecaoVazia } from "@/components/ui/Card";
import { Campo, Select } from "@/components/ui/Input";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useAtualizarModeloPadrao, useCompanies } from "@/hooks/useCompanies";
import { FUNDO, RESOLUCOES } from "@/lib/exportarEncarte";
import { exemploCom } from "@/lib/temas/exemplo";
import {
  ESCALA_PADRAO,
  escalasComPadrao,
  type EscalasTema,
} from "@/lib/temas/promocaoDoDia";

// Etapa 33: aba "Ajustes do modelo" - editor do "modelo padrao" do
// encarte de 8 itens de uma empresa (fundo, fontes, tamanhos,
// posicoes por elemento). Fica fora do fluxo diario de Gerar Encarte
// de proposito: aqui e onde se ajusta com calma, uma vez; lá é so
// colar a lista e gerar - o encarte já nasce com esses ajustes.
export default function EditorDeModeloPage() {
  const { data: empresas, isLoading: carregandoEmpresas } = useCompanies();
  const { mostrar } = useToast();
  const salvar = useAtualizarModeloPadrao();

  const [companyId, setCompanyId] = useState("");
  const empresa = empresas?.find((e) => e.id === companyId) ?? empresas?.[0];

  const [escalas, setEscalas] = useState<EscalasTema>(ESCALA_PADRAO);
  const [carregado, setCarregado] = useState(false);
  const [modo, setModo] = useState<"facil" | "avancado">("facil");
  const [resolucaoIndex, setResolucaoIndex] = useState(0);

  // Carrega o modelo salvo da empresa assim que ela chega - so uma vez
  // por empresa (troca de empresa reresseta pra recarregar de novo).
  useEffect(() => {
    if (!empresa) return;
    setEscalas(escalasComPadrao(empresa.defaultEscalas));
    setCarregado(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa?.id]);

  const exemplo = exemploCom(8);

  async function salvarModelo() {
    if (!empresa) return;
    try {
      await salvar.mutateAsync({
        id: empresa.id,
        defaultEscalas: escalas as unknown as Record<string, unknown>,
      });
      mostrar(
        "sucesso",
        "Modelo padrão salvo. Todo encarte novo já nasce assim."
      );
    } catch (err) {
      mostrar(
        "erro",
        err instanceof Error ? err.message : "Não foi possível salvar"
      );
    }
  }

  async function restaurarPadraoDoSistema() {
    if (!empresa) return;
    setEscalas(ESCALA_PADRAO);
    try {
      await salvar.mutateAsync({ id: empresa.id, defaultEscalas: null });
      mostrar("sucesso", "Modelo padrão restaurado.");
    } catch (err) {
      mostrar(
        "erro",
        err instanceof Error ? err.message : "Não foi possível restaurar"
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--brand))]">
        Biblioteca visual
      </p>
      <h1 className="text-lg font-semibold">Modelos</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Ajuste fundo, fontes, tamanhos e posições uma vez só - todo encarte novo
        de 8 itens já nasce com essa configuração, sem precisar reajustar no dia
        a dia.
      </p>
      <ModelTabs ativo="ajustes" />

      {carregandoEmpresas ? (
        <div className="mt-7">
          <SkeletonLista />
        </div>
      ) : !empresa ? (
        <div className="mt-7">
          <SecaoVazia>
            Cadastre uma empresa em Preparação antes de ajustar um modelo.
          </SecaoVazia>
        </div>
      ) : (
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.78fr)]">
          <div className="space-y-5">
            <Card>
              <Campo label="Empresa">
                <Select
                  value={empresa.id}
                  onChange={(e) => {
                    setCompanyId(e.target.value);
                    setCarregado(false);
                  }}
                >
                  {empresas!.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </Select>
              </Campo>
            </Card>

            <FundoPersonalizadoCard
              fundoUrl={escalas.fundoUrl}
              onFundoChange={(url) =>
                setEscalas((atual) => ({ ...atual, fundoUrl: url }))
              }
            />

            <Card>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold">
                    Fontes, tamanhos e posição
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Acompanhe a prévia ao lado enquanto ajusta.
                  </p>
                </div>
                <div className="inline-flex shrink-0 rounded-xl bg-[rgb(var(--surface-subtle))] p-1">
                  <button
                    type="button"
                    onClick={() => setModo("facil")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${modo === "facil" ? "bg-[rgb(var(--surface))] text-[rgb(var(--brand))] shadow-sm" : "text-neutral-500"}`}
                  >
                    Fácil
                  </button>
                  <button
                    type="button"
                    onClick={() => setModo("avancado")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${modo === "avancado" ? "bg-[rgb(var(--surface))] text-[rgb(var(--brand))] shadow-sm" : "text-neutral-500"}`}
                  >
                    Avançado
                  </button>
                </div>
              </div>
              <SizeEditor
                currentSizes={escalas}
                onSizeChange={setEscalas}
                modo={modo}
              />
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="button"
                variante="fantasma"
                onClick={() => void restaurarPadraoDoSistema()}
                disabled={salvar.isPending}
              >
                Restaurar padrão do sistema
              </Button>
              <Button
                onClick={() => void salvarModelo()}
                carregando={salvar.isPending}
              >
                {salvar.isPending ? "Salvando..." : "Salvar como modelo padrão"}
              </Button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">Prévia ao vivo</p>
                <p className="text-xs text-neutral-400">
                  Produtos de exemplo, só para conferir o visual.
                </p>
              </div>
              <div className="inline-flex shrink-0 rounded-xl bg-[rgb(var(--surface-subtle))] p-1">
                {RESOLUCOES.map((r, i) => (
                  <button
                    key={r.rotulo}
                    type="button"
                    onClick={() => setResolucaoIndex(i)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${resolucaoIndex === i ? "bg-[rgb(var(--surface))] text-[rgb(var(--brand))] shadow-sm" : "text-neutral-500"}`}
                  >
                    {i === 0 ? "Feed" : "Stories"}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-3 shadow-[0_22px_50px_-34px_rgb(0_0_0/0.5)]">
              {carregado ? (
                <div
                  className="mx-auto flex items-center justify-center overflow-hidden rounded-xl"
                  style={{
                    aspectRatio: `${RESOLUCOES[resolucaoIndex].largura} / ${RESOLUCOES[resolucaoIndex].altura}`,
                    backgroundColor: FUNDO,
                  }}
                >
                  <EncartePreviewer
                    produtos={exemplo.itens}
                    formato={8}
                    titulo={exemplo.titulo}
                    subtitulo={exemplo.subtitulo}
                    selo={exemplo.selo}
                    lojas={exemplo.lojas}
                    validade={exemplo.validade}
                    escalas={escalas}
                    className="w-full"
                  />
                </div>
              ) : (
                <SkeletonLista />
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
