"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { EncartePreviewer } from "@/components/encarte/EncartePreviewer";
import { FundoPersonalizadoCard } from "@/components/encarte/FundoPersonalizadoCard";
import { SaveDraftModal } from "@/components/encarte/SaveDraftModal";
import { SeletorDeFoto } from "@/components/encarte/SeletorDeFoto";
import { SizeEditor } from "@/components/encarte/SizeEditor";
import { Button } from "@/components/ui/Button";
import { Card, Erro, SecaoVazia } from "@/components/ui/Card";
import { Campo, Select } from "@/components/ui/Input";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useCompanies } from "@/hooks/useCompanies";
import { useEncarte } from "@/hooks/useEncartes";
import { useStores } from "@/hooks/useStores";
import {
  baixarBlob,
  exportarEncarte,
  RESOLUCOES,
  type FormatoArquivo,
} from "@/lib/exportarEncarte";
import { matchProduct, type ResultadoMatch } from "@/lib/match";
import { parsearLista, type LinhaProcessada } from "@/lib/parserLista";
import {
  ESCALA_PADRAO,
  escalasComPadrao,
  type EscalasTema,
} from "@/lib/temas/promocaoDoDia";
import { uploadArquivo } from "@/lib/upload";
import type { FormatoEncarte } from "@/types";

// So existe um tema hoje. O SELECT ja fica pronto para os outros
// temas (por dia da semana) que a etapa de upload de temas vai trazer.
const TEMAS_DISPONIVEIS = [
  { familia: "promocao-do-dia", nome: "Promoção do Dia (preto e dourado)" },
];

// Etapa 27: foco exclusivo no formato de 8 itens - os outros (1, 2, 4,
// 6, 10) continuam existindo em lib/temas/promocaoDoDia.ts e no schema
// do Theme (banco), so saem da UI. Reativar e so trazer o seletor de
// volta.
const FORMATO_UNICO: FormatoEncarte = 8;

type EtapaCriacao = 1 | 2 | 3 | 4;

const ETAPAS: { numero: EtapaCriacao; titulo: string; descricao: string }[] = [
  { numero: 1, titulo: "Produtos", descricao: "Cole sua lista" },
  { numero: 2, titulo: "Revisar", descricao: "Confira os itens" },
  { numero: 3, titulo: "Personalizar", descricao: "Ajuste a arte" },
  { numero: 4, titulo: "Finalizar", descricao: "Salve e baixe" },
];

interface LinhaResultado {
  linha: LinhaProcessada;
  carregando: boolean;
  erro: boolean;
  suggestions: ResultadoMatch[];
  escolhida: ResultadoMatch | null;
  // Etapa 21: qual foto usar pra esse item - null = usa a do banco
  // (product.photoS3Url); senao, uma das userPhotos escolhida.
  fotoEscolhida: string | null;
}

const PLACEHOLDER = `Agrião 1,48 un
Rúcula 2,50 un
Abobora Sergipana 3,98 kg
Manga Palmer 5,98 kg`;

function pctTexto(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

export default function GenerateEncartePage() {
  const { data: empresas, isLoading: carregandoEmpresas } = useCompanies();
  const { mostrar } = useToast();

  // Etapa 29: antes de qualquer coisa, o usuario escolhe pra qual
  // empresa esta gerando - isso decide o catalogo de produtos, os
  // temas e as lojas do rodape. "" ate o usuario mexer = cai no
  // fallback (primeira empresa), sem precisar de useEffect so pra
  // sincronizar o valor inicial do <Select>.
  const [companyIdEscolhido, setCompanyIdEscolhido] = useState("");

  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const { data: draft } = useEncarte(draftId);
  const [draftCarregado, setDraftCarregado] = useState(false);

  const [texto, setTexto] = useState("");
  const [processando, setProcessando] = useState(false);
  const [resultados, setResultados] = useState<LinhaResultado[] | null>(null);
  const [etapaAtiva, setEtapaAtiva] = useState<EtapaCriacao>(1);
  const [etapaLiberada, setEtapaLiberada] = useState<EtapaCriacao>(1);
  const [previewMobileAberto, setPreviewMobileAberto] = useState(false);

  useEffect(() => {
    if (!previewMobileAberto) return;

    const overflowAnterior = document.body.style.overflow;
    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewMobileAberto(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", fecharComEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", fecharComEscape);
    };
  }, [previewMobileAberto]);

  const [temaFamilia, setTemaFamilia] = useState(TEMAS_DISPONIVEIS[0].familia);
  const [formato, setFormato] = useState<FormatoEncarte>(FORMATO_UNICO);
  const [escalas, setEscalas] = useState<EscalasTema>(ESCALA_PADRAO);
  const [mostrarSalvar, setMostrarSalvar] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const [resolucaoIndex, setResolucaoIndex] = useState(0);
  const [exportando, setExportando] = useState<FormatoArquivo | null>(null);
  const [linkPersistente, setLinkPersistente] = useState<string | null>(null);

  const empresa =
    empresas?.find((e) => e.id === companyIdEscolhido) ?? empresas?.[0];

  // Etapa 29: rodape do encarte com dado real da loja, em vez do
  // LOJAS_PADRAO fixo que existia antes (nomes nem batiam com o
  // cadastro real). Sem loja cadastrada ainda, os placeholders de
  // loja no SVG so ficam vazios (ver frontend/src/lib/temas/render.ts).
  const { data: lojasDaEmpresa } = useStores(empresa?.id ?? null);
  const lojasParaEncarte = (lojasDaEmpresa ?? []).map((loja) => ({
    nome: loja.name.toUpperCase(),
    endereco: loja.address.toUpperCase(),
    whatsapp: loja.deliveryPhones.join(" / "),
  }));

  // Etapa 33: assim que a empresa carrega pela primeira vez, aplica o
  // "modelo padrao" dela (editado fora daqui, em Modelos > Ajustes) em
  // vez de sempre comecar do ESCALA_PADRAO do sistema. So roda uma vez
  // no carregamento - abrir um rascunho (efeito abaixo) ou trocar de
  // empresa (Select de empresa, mais abaixo) tomam conta depois disso.
  const [modeloPadraoAplicado, setModeloPadraoAplicado] = useState(false);
  useEffect(() => {
    if (!empresa || modeloPadraoAplicado || draftId) return;
    setEscalas(escalasComPadrao(empresa.defaultEscalas));
    setModeloPadraoAplicado(true);
  }, [empresa, modeloPadraoAplicado, draftId]);

  // Abrir um rascunho (Etapa 20, "?draftId=..." vindo de /drafts):
  // preenche os campos e reprocessa a lista contra o catalogo atual -
  // de proposito, em vez de so reidratar o preview com os
  // parsedProducts salvos, ja que o produto pode ter mudado de foto ou
  // saido do catalogo desde que o rascunho foi salvo.
  useEffect(() => {
    // espera a empresa tambem carregar - processar() precisa dela e
    // nao ha garantia de qual das duas consultas volta primeiro
    if (!draft || draftCarregado || !empresa) return;
    setDraftCarregado(true);
    setTexto(draft.productList);
    setFormato(draft.selectedFormat);
    if (draft.selectedThemeId) setTemaFamilia(draft.selectedThemeId);
    const edicoes = draft.edits as Partial<EscalasTema>;
    setEscalas({
      foto: edicoes.foto ?? ESCALA_PADRAO.foto,
      nome: edicoes.nome ?? ESCALA_PADRAO.nome,
      preco: edicoes.preco ?? ESCALA_PADRAO.preco,
      // Etapa 30: fonte por elemento - rascunhos salvos antes desta
      // etapa nao tem essas chaves, cai no padrao (mesmo visual de
      // sempre)
      fonteNome: edicoes.fonteNome ?? ESCALA_PADRAO.fonteNome,
      fontePreco: edicoes.fontePreco ?? ESCALA_PADRAO.fontePreco,
      fonteUnidade: edicoes.fonteUnidade ?? ESCALA_PADRAO.fonteUnidade,
      // Etapa 31: posicao e fundo customizado - mesmo raciocinio,
      // rascunho antigo cai no padrao (sem deslocamento, sem fundo
      // proprio).
      fotoOffsetX: edicoes.fotoOffsetX ?? ESCALA_PADRAO.fotoOffsetX,
      fotoOffsetY: edicoes.fotoOffsetY ?? ESCALA_PADRAO.fotoOffsetY,
      nomeOffsetX: edicoes.nomeOffsetX ?? ESCALA_PADRAO.nomeOffsetX,
      nomeOffsetY: edicoes.nomeOffsetY ?? ESCALA_PADRAO.nomeOffsetY,
      precoOffsetX: edicoes.precoOffsetX ?? ESCALA_PADRAO.precoOffsetX,
      precoOffsetY: edicoes.precoOffsetY ?? ESCALA_PADRAO.precoOffsetY,
      fundoUrl: edicoes.fundoUrl,
    });
    void processar(draft.productList);
    mostrar("sucesso", `Rascunho "${draft.name}" carregado.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, draftCarregado, empresa]);

  async function processar(textoParaProcessar = texto) {
    if (!empresa) return;

    const linhas = parsearLista(textoParaProcessar);
    if (linhas.length === 0) {
      mostrar("erro", "Cole ao menos uma linha com produto e preço.");
      return;
    }

    setProcessando(true);
    // estado inicial: tudo carregando, para a lista aparecer na hora
    setResultados(
      linhas.map((linha) => ({
        linha,
        carregando: true,
        erro: false,
        suggestions: [],
        escolhida: null,
        fotoEscolhida: null,
      }))
    );

    const respostas = await Promise.all(
      linhas.map(async (linha) => {
        if (!linha.nome) {
          return {
            linha,
            carregando: false,
            erro: false,
            suggestions: [],
            escolhida: null,
            fotoEscolhida: null,
          };
        }
        try {
          const resp = await matchProduct(empresa.id, linha.nome);
          return {
            linha,
            carregando: false,
            erro: false,
            suggestions: resp.suggestions,
            escolhida: resp.exactMatch,
            fotoEscolhida: null,
          };
        } catch {
          return {
            linha,
            carregando: false,
            erro: true,
            suggestions: [],
            escolhida: null,
            fotoEscolhida: null,
          };
        }
      })
    );

    setResultados(respostas);
    setProcessando(false);
    setEtapaAtiva(2);
    setEtapaLiberada((atual) => (atual < 2 ? 2 : atual));

    const reconhecidos = respostas.filter((r) => r.escolhida).length;
    mostrar(
      reconhecidos === respostas.length ? "sucesso" : "erro",
      `${reconhecidos} de ${respostas.length} produto(s) reconhecido(s) automaticamente.`
    );
  }

  async function baixar(formato: FormatoArquivo) {
    if (!previewRef.current) return;
    setExportando(formato);
    setLinkPersistente(null);
    try {
      const resolucao = RESOLUCOES[resolucaoIndex];
      const blob = await exportarEncarte(
        previewRef.current,
        resolucao,
        formato
      );
      const extensao = formato === "png" ? "png" : "jpg";
      const nomeArquivo = `encarte-${resolucao.largura}x${resolucao.altura}.${extensao}`;

      // o download acontece na hora, direto do navegador - nao depende
      // do proximo passo (upload) para funcionar
      baixarBlob(blob, nomeArquivo);
      mostrar("sucesso", `Download de ${nomeArquivo} iniciado.`);

      // bonus: sobe pelo endpoint de upload ja existente (Etapa 11)
      // para gerar um link permanente, alem do arquivo baixado. Se
      // falhar, o download acima ja aconteceu mesmo assim.
      try {
        const arquivo = new File([blob], nomeArquivo, { type: blob.type });
        const url = await uploadArquivo(arquivo);
        setLinkPersistente(url);
      } catch {
        // silencioso: o download direto e o que importa aqui
      }
    } catch (err) {
      mostrar(
        "erro",
        err instanceof Error
          ? err.message
          : "Não foi possível exportar o encarte"
      );
    } finally {
      setExportando(null);
    }
  }

  function escolherSugestao(indice: number, sugestao: ResultadoMatch) {
    setResultados((atual) =>
      atual
        ? atual.map((r, i) =>
            // troca de produto: a foto escolhida antes era de outro
            // produto, entao volta pro padrao (banco do novo produto)
            i === indice
              ? { ...r, escolhida: sugestao, fotoEscolhida: null }
              : r
          )
        : atual
    );
  }

  // Etapa 21: escolhe entre a foto do banco e um dos uploads do
  // usuario pra esse item especifico - so vale pra este encarte, nao
  // muda a foto principal do produto (isso e feito em Preparação).
  function escolherFoto(indice: number, url: string | null) {
    setResultados((atual) =>
      atual
        ? atual.map((r, i) => (i === indice ? { ...r, fotoEscolhida: url } : r))
        : atual
    );
  }

  const itensParaPreview =
    resultados
      ?.filter((r): r is LinhaResultado & { escolhida: ResultadoMatch } =>
        Boolean(r.escolhida)
      )
      .map((r) => ({
        nome: r.escolhida.product.name,
        preco: r.linha.preco || "0,00",
        unidade: r.linha.unidade,
        fotoUrl: r.fotoEscolhida ?? r.escolhida.product.photoS3Url,
      })) ?? [];

  // Mesmos itens do preview, so com os nomes de campo em ingles que o
  // rascunho espera (backend/src/schemas/encarteDraft.schema.ts).
  const parsedProductsParaSalvar = itensParaPreview.map((item) => ({
    name: item.nome,
    price: item.preco,
    unit: item.unidade,
    photoUrl: item.fotoUrl,
  }));

  const reconhecidos = resultados?.filter((r) => r.escolhida).length ?? 0;
  const linhasDigitadas = texto
    .split("\n")
    .filter((linha) => linha.trim()).length;
  const etapaMaxima = etapaLiberada;

  const preview = (
    <EncartePreviewer
      produtos={itensParaPreview}
      temaId={`${temaFamilia}-${formato}`}
      formato={formato}
      lojas={lojasParaEncarte}
      validade={new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })}
      escalas={escalas}
    />
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--brand))]">
            Estúdio de criação
          </p>
          <h1>Criar encarte</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Siga as etapas para transformar sua lista de ofertas em uma arte
            pronta para publicar.
          </p>
        </div>
        {draft ? (
          <span className="rounded-full bg-[rgb(var(--accent-soft))] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--accent))]">
            Editando: {draft.name}
          </span>
        ) : null}
      </div>

      <ol className="mt-7 grid grid-cols-4 gap-1 rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-2 sm:gap-2 sm:p-3">
        {ETAPAS.map((etapa) => {
          const ativa = etapa.numero === etapaAtiva;
          const concluida =
            etapa.numero < etapaAtiva && etapa.numero <= etapaMaxima;
          const disponivel = etapa.numero <= etapaMaxima;
          return (
            <li key={etapa.numero}>
              <button
                type="button"
                disabled={!disponivel}
                onClick={() => setEtapaAtiva(etapa.numero)}
                aria-current={ativa ? "step" : undefined}
                className={`flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left transition sm:px-3 ${
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
                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate text-xs font-bold sm:text-sm">
                    {etapa.titulo}
                  </span>
                  <span
                    className={`mt-0.5 hidden truncate text-[10px] lg:block ${ativa ? "text-white/70 dark:text-neutral-900/60" : "text-neutral-400"}`}
                  >
                    {etapa.descricao}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {carregandoEmpresas ? (
        <div className="mt-6">
          <SkeletonLista />
        </div>
      ) : !empresa ? (
        <div className="mt-6">
          <SecaoVazia>
            <span className="block font-semibold text-[rgb(var(--foreground))]">
              Cadastre uma empresa antes de começar
            </span>
            <span className="mt-1 block">
              Acesse Cadastros para configurar sua empresa, lojas e produtos.
            </span>
          </SecaoVazia>
        </div>
      ) : (
        <div className="mt-6">
          {etapaAtiva === 1 ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
              <Card>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-soft))] text-sm font-bold text-[rgb(var(--accent))]">
                    1
                  </span>
                  <div>
                    <h2 className="text-base font-bold">
                      Adicione os produtos da oferta
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                      Cole um produto por linha, com preço e unidade. Nós
                      encontramos as fotos no seu catálogo.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-5">
                  <Campo label="Empresa responsável pelo encarte">
                    <Select
                      value={empresa.id}
                      onChange={(e) => {
                        setCompanyIdEscolhido(e.target.value);
                        setResultados(null);
                        setEtapaAtiva(1);
                        setEtapaLiberada(1);
                        // Etapa 33: cada empresa tem seu proprio
                        // modelo padrao - troca de empresa, troca a
                        // base de fonte/tamanho/posicao/fundo tambem.
                        const novaEmpresa = empresas?.find(
                          (emp) => emp.id === e.target.value
                        );
                        setEscalas(
                          escalasComPadrao(novaEmpresa?.defaultEscalas)
                        );
                      }}
                    >
                      {(empresas ?? []).map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </Select>
                  </Campo>

                  <Campo label="Lista de produtos">
                    <textarea
                      value={texto}
                      onChange={(e) => {
                        setTexto(e.target.value);
                        if (resultados) {
                          setResultados(null);
                          setEtapaLiberada(1);
                        }
                      }}
                      placeholder={PLACEHOLDER}
                      rows={10}
                      disabled={processando}
                      className="w-full resize-y rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] px-4 py-3 font-mono text-sm leading-relaxed text-[rgb(var(--foreground))] shadow-sm outline-none transition-all placeholder:font-sans placeholder:text-neutral-400 hover:border-[rgb(var(--brand)/0.4)] focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgb(var(--brand)/0.1)] disabled:opacity-60"
                    />
                  </Campo>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[rgb(var(--line))] pt-5">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {linhasDigitadas
                      ? `${linhasDigitadas} produto(s) na lista`
                      : "Nenhum produto adicionado"}
                  </p>
                  <Button
                    onClick={() => void processar()}
                    carregando={processando}
                  >
                    {processando ? "Importando..." : "Importar produtos →"}
                  </Button>
                </div>
              </Card>

              <div className="space-y-4">
                <Card className="bg-[rgb(var(--surface-subtle)/0.55)]">
                  <p className="text-sm font-bold">Como escrever a lista</p>
                  <div className="mt-4 rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-4 font-mono text-xs leading-7 text-neutral-500 dark:text-neutral-400">
                    <p>Agrião 1,48 un</p>
                    <p>Rúcula 2,50 un</p>
                    <p>Manga Palmer 5,98 kg</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    <li className="flex gap-2">
                      <span className="text-[rgb(var(--brand))]">✓</span> Use
                      vírgula ou ponto no preço.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[rgb(var(--brand))]">✓</span>{" "}
                      Informe uma unidade por item.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[rgb(var(--brand))]">✓</span> O
                      formato atual aceita até 8 produtos.
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          ) : null}

          {etapaAtiva === 2 && resultados ? (
            <div className="mx-auto max-w-5xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">
                    Confira os produtos encontrados
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {reconhecidos} de {resultados.length} reconhecidos. Corrija
                    os pendentes antes de continuar.
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${reconhecidos === resultados.length ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}`}
                >
                  {reconhecidos}/{resultados.length} prontos
                </span>
              </div>

              <Card>
                <ul className="divide-y divide-[rgb(var(--line))]">
                  {resultados.map((r, i) => (
                    <li key={i} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {r.linha.linhaOriginal}
                          </p>
                          {r.escolhida ? (
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                              Encontrado como: {r.escolhida.product.name}
                            </p>
                          ) : null}
                        </div>
                        {r.carregando ? (
                          <span className="rounded-full bg-[rgb(var(--surface-subtle))] px-2.5 py-1 text-xs text-neutral-400">
                            Buscando...
                          </span>
                        ) : r.erro ? (
                          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                            Falha na busca
                          </span>
                        ) : r.escolhida ? (
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            ✓ {pctTexto(r.escolhida.confidence)} compatível
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                            Precisa de revisão
                          </span>
                        )}
                      </div>

                      {r.escolhida ? (
                        <SeletorDeFoto
                          produto={r.escolhida.product}
                          fotoEscolhida={r.fotoEscolhida}
                          onEscolher={(url) => escolherFoto(i, url)}
                        />
                      ) : null}

                      {!r.carregando &&
                      !r.escolhida &&
                      r.suggestions.length > 0 ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Você quis dizer:
                          </span>
                          {r.suggestions.map((s) => (
                            <button
                              key={s.product.id}
                              type="button"
                              onClick={() => escolherSugestao(i, s)}
                              className="rounded-full border border-[rgb(var(--line))] bg-[rgb(var(--surface-subtle))] px-3 py-1 text-xs font-medium transition hover:border-[rgb(var(--brand)/0.5)] hover:text-[rgb(var(--brand))]"
                            >
                              {s.product.name} · {pctTexto(s.confidence)}
                            </button>
                          ))}
                        </div>
                      ) : null}

                      {!r.carregando &&
                      !r.escolhida &&
                      !r.erro &&
                      r.suggestions.length === 0 ? (
                        <p className="mt-2 text-xs text-neutral-400">
                          Nenhum produto parecido foi encontrado no catálogo.
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Card>

              {itensParaPreview.length === 0 ? (
                <div className="mt-4">
                  <Erro>
                    Nenhum produto foi reconhecido. Volte e ajuste a lista ou
                    escolha uma sugestão.
                  </Erro>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap justify-between gap-3">
                <Button variante="secundario" onClick={() => setEtapaAtiva(1)}>
                  ← Editar lista
                </Button>
                <Button
                  disabled={itensParaPreview.length === 0}
                  onClick={() => {
                    setEtapaAtiva(3);
                    setEtapaLiberada((atual) => (atual < 3 ? 3 : atual));
                  }}
                >
                  Personalizar encarte →
                </Button>
              </div>
            </div>
          ) : null}

          {etapaAtiva === 3 && itensParaPreview.length > 0 ? (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.78fr)]">
              <div className="space-y-5">
                <Card>
                  <div className="mb-5">
                    <h2 className="text-base font-bold">Escolha o modelo</h2>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      O modelo define cores, composição e estilo da sua oferta.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {TEMAS_DISPONIVEIS.map((tema) => {
                      const selecionado = temaFamilia === tema.familia;
                      return (
                        <button
                          key={tema.familia}
                          type="button"
                          onClick={() => setTemaFamilia(tema.familia)}
                          className={`overflow-hidden rounded-2xl border-2 text-left transition ${selecionado ? "border-[rgb(var(--brand))] shadow-[0_12px_30px_-20px_rgb(var(--brand))]" : "border-[rgb(var(--line))] hover:border-[rgb(var(--brand)/0.4)]"}`}
                        >
                          <span className="flex h-28 items-center justify-center bg-[radial-gradient(circle_at_top,rgb(128_83_25),rgb(8_8_8)_65%)] px-4 text-center font-serif text-lg font-bold tracking-[0.14em] text-amber-300">
                            PROMOÇÃO
                            <br />
                            DO DIA
                          </span>
                          <span className="flex items-center justify-between gap-2 bg-[rgb(var(--surface))] px-4 py-3">
                            <span>
                              <span className="block text-sm font-bold">
                                Promoção do Dia
                              </span>
                              <span className="mt-0.5 block text-xs text-neutral-400">
                                Preto e dourado
                              </span>
                            </span>
                            <span
                              className={`grid h-6 w-6 place-items-center rounded-full text-xs ${selecionado ? "bg-[rgb(var(--brand))] text-white dark:text-neutral-950" : "border border-[rgb(var(--line))]"}`}
                            >
                              {selecionado ? "✓" : ""}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-bold">Formato da arte</h2>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        O modelo atual está preparado para oito produtos.
                      </p>
                    </div>
                    <span className="rounded-xl bg-[rgb(var(--surface-subtle))] px-4 py-2 text-sm font-bold text-[rgb(var(--brand))]">
                      8 itens
                    </span>
                  </div>
                </Card>

                <FundoPersonalizadoCard
                  fundoUrl={escalas.fundoUrl}
                  onFundoChange={(url) =>
                    setEscalas((atual) => ({ ...atual, fundoUrl: url }))
                  }
                />

                <Card>
                  <h2 className="mb-1 text-base font-bold">
                    Ajustes da composição
                  </h2>
                  <p className="mb-5 text-xs text-neutral-500 dark:text-neutral-400">
                    Ajuste fotos, textos, fontes e posição acompanhando a prévia
                    ao lado.
                  </p>
                  <SizeEditor
                    currentSizes={escalas}
                    onSizeChange={setEscalas}
                  />
                </Card>

                <div className="flex flex-wrap justify-between gap-3">
                  <Button
                    variante="secundario"
                    onClick={() => setEtapaAtiva(2)}
                  >
                    ← Revisar produtos
                  </Button>
                  <Button
                    onClick={() => {
                      setEtapaAtiva(4);
                      setEtapaLiberada(4);
                    }}
                  >
                    Continuar para finalizar →
                  </Button>
                </div>
              </div>

              <aside className="lg:sticky lg:top-24">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">Prévia ao vivo</p>
                    <p className="text-xs text-neutral-400">
                      Atualizada automaticamente
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewMobileAberto(true)}
                    className="rounded-lg border border-[rgb(var(--line))] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--brand))] lg:hidden"
                  >
                    Ampliar
                  </button>
                </div>
                <div className="rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-3 shadow-[0_22px_50px_-34px_rgb(0_0_0/0.5)]">
                  {preview}
                </div>
              </aside>
            </div>
          ) : null}

          {etapaAtiva === 4 && itensParaPreview.length > 0 ? (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(320px,0.65fr)_minmax(0,1fr)]">
              <div className="space-y-5 lg:sticky lg:top-24">
                <Card>
                  <div className="mb-5 flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[rgb(var(--accent-soft))] text-lg text-[rgb(var(--accent))]">
                      ↓
                    </span>
                    <div>
                      <h2 className="text-base font-bold">Baixar arte</h2>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Escolha a qualidade e o formato do arquivo.
                      </p>
                    </div>
                  </div>
                  <Campo label="Resolução">
                    <Select
                      value={resolucaoIndex}
                      onChange={(e) =>
                        setResolucaoIndex(Number(e.target.value))
                      }
                    >
                      {RESOLUCOES.map((r, i) => (
                        <option key={r.rotulo} value={i}>
                          {r.rotulo}
                        </option>
                      ))}
                    </Select>
                  </Campo>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <Button
                      onClick={() => void baixar("png")}
                      disabled={exportando !== null}
                      carregando={exportando === "png"}
                    >
                      {exportando === "png" ? "Gerando..." : "Baixar PNG"}
                    </Button>
                    <Button
                      variante="secundario"
                      onClick={() => void baixar("jpeg")}
                      disabled={exportando !== null}
                      carregando={exportando === "jpeg"}
                    >
                      {exportando === "jpeg" ? "Gerando..." : "Baixar JPG"}
                    </Button>
                  </div>
                  {linkPersistente ? (
                    <p className="mt-3 truncate text-xs text-neutral-500 dark:text-neutral-400">
                      Link permanente:{" "}
                      <a
                        href={linkPersistente}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[rgb(var(--brand))] underline underline-offset-4"
                      >
                        {linkPersistente}
                      </a>
                    </p>
                  ) : null}
                </Card>

                <Card>
                  <h2 className="text-base font-bold">Continuar depois</h2>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Salve a lista, as fotos e os ajustes para editar novamente
                    em Meus encartes.
                  </p>
                  <Button
                    variante="secundario"
                    className="mt-4 w-full"
                    onClick={() => setMostrarSalvar(true)}
                  >
                    Salvar em Meus encartes
                  </Button>
                </Card>

                <Button variante="fantasma" onClick={() => setEtapaAtiva(3)}>
                  ← Voltar aos ajustes
                </Button>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold">Arte final</h2>
                    <p className="mt-1 text-xs text-neutral-400">
                      Revise todos os detalhes antes de baixar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewMobileAberto(true)}
                    className="rounded-lg border border-[rgb(var(--line))] px-3 py-1.5 text-xs font-semibold text-[rgb(var(--brand))] lg:hidden"
                  >
                    Ver em tela cheia
                  </button>
                </div>
                <div className="rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-3 shadow-[0_22px_50px_-34px_rgb(0_0_0/0.5)]">
                  <div ref={previewRef} className="inline-block w-full">
                    {preview}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {previewMobileAberto && itensParaPreview.length > 0 ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Prévia do encarte"
          className="fixed inset-0 z-[70] overflow-y-auto bg-[rgb(var(--background)/0.98)] p-4 lg:hidden"
        >
          <div className="mx-auto max-w-lg">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">Prévia do encarte</p>
                <p className="text-xs text-neutral-400">
                  Visualização ampliada
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMobileAberto(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] text-xl"
                aria-label="Fechar prévia"
              >
                ×
              </button>
            </div>
            {preview}
          </div>
        </div>
      ) : null}

      {mostrarSalvar && empresa ? (
        <SaveDraftModal
          dados={{
            companyId: empresa.id,
            productList: texto,
            selectedThemeId: temaFamilia,
            selectedFormat: formato,
            parsedProducts: parsedProductsParaSalvar,
            edits: { ...escalas } as Record<string, unknown>,
          }}
          onSalvo={(nome) => {
            setMostrarSalvar(false);
            mostrar("sucesso", `Rascunho "${nome}" salvo com sucesso.`);
          }}
          onFechar={() => setMostrarSalvar(false)}
        />
      ) : null}
    </div>
  );
}
