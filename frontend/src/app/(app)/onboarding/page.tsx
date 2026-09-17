"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { EncartePreviewer } from "@/components/encarte/EncartePreviewer";
import { FormCompany } from "@/components/preparation/FormCompany";
import { FormStore } from "@/components/preparation/FormStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useAtualizarModeloPadrao, useCompanies } from "@/hooks/useCompanies";
import { useProducts } from "@/hooks/useProducts";
import { useStores } from "@/hooks/useStores";
import { exemploCom } from "@/lib/temas/exemplo";
import { ESCALA_PADRAO, escalasComPadrao } from "@/lib/temas/promocaoDoDia";

type EtapaOnboarding = 1 | 2 | 3 | 4 | 5;

const ETAPAS: { numero: EtapaOnboarding; titulo: string }[] = [
  { numero: 1, titulo: "Empresa" },
  { numero: 2, titulo: "Loja" },
  { numero: 3, titulo: "Catálogo" },
  { numero: 4, titulo: "Modelo" },
  { numero: 5, titulo: "Pronto" },
];

// Etapa "Primeiro acesso" do fluxograma: turna as 3 telas soltas
// (empresa/loja em /preparation, catalogo em /preparation/products,
// modelo em /temas) num fluxo guiado, so uma vez, terminando em
// "sistema pronto pra criar". /preparation continua existindo pra
// edicao avancada depois - aqui e so o primeiro caminho.
export default function OnboardingPage() {
  const { data: empresas, isLoading: carregandoEmpresas } = useCompanies();
  const empresa = empresas?.[0];
  const { data: lojas, isLoading: carregandoLojas } = useStores(
    empresa?.id ?? null
  );
  const { data: produtos, isLoading: carregandoProdutos } = useProducts(
    empresa?.id ?? null
  );
  const salvarModelo = useAtualizarModeloPadrao();
  const { mostrar } = useToast();

  const [etapaAtiva, setEtapaAtiva] = useState<EtapaOnboarding>(1);
  const [inicializado, setInicializado] = useState(false);
  const [editandoEmpresa, setEditandoEmpresa] = useState(false);
  const [editandoLoja, setEditandoLoja] = useState(false);
  const [catalogoRevisado, setCatalogoRevisado] = useState(false);

  const empresaPronta = Boolean(empresa);
  const lojaPronta = Boolean(lojas?.length);

  // Comeca no primeiro passo incompleto, uma unica vez (depois disso o
  // usuario navega livre entre os passos ja liberados).
  useEffect(() => {
    if (inicializado || carregandoEmpresas || carregandoLojas) return;
    if (!empresaPronta) setEtapaAtiva(1);
    else if (!lojaPronta) setEtapaAtiva(2);
    else setEtapaAtiva(3);
    setInicializado(true);
  }, [
    inicializado,
    carregandoEmpresas,
    carregandoLojas,
    empresaPronta,
    lojaPronta,
  ]);

  const etapaMaxima: EtapaOnboarding = !empresaPronta
    ? 1
    : !lojaPronta
      ? 2
      : !catalogoRevisado
        ? 3
        : 4;

  async function confirmarModelo() {
    if (!empresa) return;
    try {
      if (!empresa.defaultEscalas) {
        await salvarModelo.mutateAsync({
          id: empresa.id,
          defaultEscalas: ESCALA_PADRAO as unknown as Record<string, unknown>,
        });
      }
      setEtapaAtiva(5);
    } catch (err) {
      mostrar(
        "erro",
        err instanceof Error ? err.message : "Não foi possível confirmar"
      );
    }
  }

  const exemplo = exemploCom(8);
  const comFoto = produtos?.filter((p) => p.userPhotos.length > 0).length ?? 0;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-7">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--brand))]">
          Primeiro acesso
        </p>
        <h1 className="text-lg font-semibold">Configuração inicial</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Configure uma vez e comece a criar encartes em poucos minutos.
        </p>
      </div>

      <ol className="mb-7 flex gap-2 overflow-x-auto pb-1">
        {ETAPAS.map((etapa) => {
          const ativa = etapa.numero === etapaAtiva;
          const disponivel = etapa.numero <= etapaMaxima || etapa.numero === 5;
          const concluida =
            etapa.numero < etapaAtiva && etapa.numero <= etapaMaxima;
          return (
            <li key={etapa.numero} className="flex-1 min-w-[110px]">
              <button
                type="button"
                disabled={!disponivel}
                onClick={() => setEtapaAtiva(etapa.numero)}
                aria-current={ativa ? "step" : undefined}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                  ativa
                    ? "bg-[rgb(var(--brand))] text-white shadow-sm dark:text-neutral-950"
                    : disponivel
                      ? "text-neutral-600 hover:bg-[rgb(var(--surface-subtle))] dark:text-neutral-300"
                      : "cursor-not-allowed text-neutral-300 dark:text-neutral-600"
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${ativa ? "bg-white/20" : concluida ? "bg-[rgb(var(--brand))] text-white dark:text-neutral-950" : "border border-current/25"}`}
                >
                  {concluida ? "✓" : etapa.numero}
                </span>
                <span className="truncate text-xs font-bold sm:text-sm">
                  {etapa.titulo}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {carregandoEmpresas ? (
        <SkeletonLista />
      ) : etapaAtiva === 1 ? (
        <Card>
          <h2 className="text-base font-bold">Sua empresa</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Nome, estilo visual e logo usados em todos os encartes.
          </p>
          <div className="mt-5">
            {empresa && !editandoEmpresa ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[rgb(var(--line))] p-4">
                <div>
                  <p className="text-sm font-bold">{empresa.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    Estilo:{" "}
                    {empresa.style === "sofisticado"
                      ? "Sofisticado"
                      : "Agressivo"}
                  </p>
                </div>
                <Button
                  variante="fantasma"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setEditandoEmpresa(true)}
                >
                  Editar
                </Button>
              </div>
            ) : (
              <FormCompany
                empresa={empresa}
                onFechar={() => {
                  setEditandoEmpresa(false);
                  setEtapaAtiva(2);
                }}
              />
            )}
          </div>
          {empresa && !editandoEmpresa ? (
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setEtapaAtiva(2)}>Continuar</Button>
            </div>
          ) : null}
        </Card>
      ) : etapaAtiva === 2 && empresa ? (
        <Card>
          <h2 className="text-base font-bold">Sua primeira loja</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Endereço e WhatsApp que aparecem no rodapé do encarte.
          </p>
          <div className="mt-5">
            {carregandoLojas ? (
              <SkeletonLista linhas={2} />
            ) : lojas?.length && !editandoLoja ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[rgb(var(--line))] p-4">
                <div>
                  <p className="text-sm font-bold">{lojas[0].name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {lojas[0].address}
                  </p>
                </div>
                <Button
                  variante="fantasma"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setEditandoLoja(true)}
                >
                  Editar
                </Button>
              </div>
            ) : (
              <FormStore
                companyId={empresa.id}
                loja={lojas?.[0]}
                onFechar={() => {
                  setEditandoLoja(false);
                  setEtapaAtiva(3);
                }}
              />
            )}
          </div>
          {lojas?.length && !editandoLoja ? (
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setEtapaAtiva(3)}>Continuar</Button>
            </div>
          ) : null}
        </Card>
      ) : etapaAtiva === 3 ? (
        <Card>
          <h2 className="text-base font-bold">Prepare o catálogo</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Seus produtos já vêm com fotos do banco público. Suba fotos próprias
            quando quiser um visual mais exclusivo.
          </p>
          <div className="mt-5 rounded-xl border border-[rgb(var(--line))] p-4">
            {carregandoProdutos ? (
              <SkeletonLista linhas={2} />
            ) : (
              <p className="text-sm">
                <span className="font-bold">{produtos?.length ?? 0}</span>{" "}
                produtos disponíveis no catálogo,{" "}
                <span className="font-bold">{comFoto}</span> com foto própria.
              </p>
            )}
            <Link
              href="/preparation/products"
              className="mt-3 inline-flex text-xs font-semibold text-[rgb(var(--brand))] hover:underline"
            >
              Gerenciar fotos do catálogo →
            </Link>
          </div>
          <div className="mt-5 flex justify-end">
            <Button
              onClick={() => {
                setCatalogoRevisado(true);
                setEtapaAtiva(4);
              }}
            >
              Continuar
            </Button>
          </div>
        </Card>
      ) : etapaAtiva === 4 && empresa ? (
        <Card>
          <h2 className="text-base font-bold">Modelo inicial</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Todo encarte novo já nasce com esse visual. Você pode ajustar fundo,
            fontes e tamanhos depois em Modelos.
          </p>
          <div className="mx-auto mt-5 max-w-xs">
            <EncartePreviewer
              produtos={exemplo.itens}
              formato={8}
              titulo={exemplo.titulo}
              subtitulo={exemplo.subtitulo}
              selo={exemplo.selo}
              lojas={exemplo.lojas}
              validade={exemplo.validade}
              escalas={escalasComPadrao(empresa.defaultEscalas)}
            />
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/temas"
              className="text-xs font-semibold text-[rgb(var(--brand))] hover:underline"
            >
              Explorar outros modelos depois →
            </Link>
            <Button
              onClick={() => void confirmarModelo()}
              carregando={salvarModelo.isPending}
            >
              Usar este modelo
            </Button>
          </div>
        </Card>
      ) : etapaAtiva === 5 ? (
        <Card className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[rgb(var(--brand))] text-2xl text-white dark:text-neutral-950">
            ✓
          </div>
          <h2 className="mt-4 text-lg font-bold">Sistema pronto pra criar.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            Empresa, loja, catálogo e modelo configurados. Agora é só colar sua
            lista de ofertas do dia.
          </p>
          <Link
            href="/generate-encarte"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[rgb(var(--brand))] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 dark:text-neutral-950"
          >
            Criar meu primeiro encarte
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
