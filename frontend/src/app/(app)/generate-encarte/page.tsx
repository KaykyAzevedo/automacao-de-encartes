"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { EncartePreviewer } from "@/components/encarte/EncartePreviewer";
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
import {
  baixarBlob,
  exportarEncarte,
  RESOLUCOES,
  type FormatoArquivo,
} from "@/lib/exportarEncarte";
import { matchProduct, type ResultadoMatch } from "@/lib/match";
import { parsearLista, type LinhaProcessada } from "@/lib/parserLista";
import { ESCALA_PADRAO, type EscalasTema } from "@/lib/temas/promocaoDoDia";
import { uploadArquivo } from "@/lib/upload";
import type { FormatoEncarte } from "@/types";

// So existe um tema hoje. O SELECT ja fica pronto para os outros
// temas (por dia da semana) que a etapa de upload de temas vai trazer.
const TEMAS_DISPONIVEIS = [
  { familia: "promocao-do-dia", nome: "Promoção do Dia (preto e dourado)" },
];

const FORMATOS: FormatoEncarte[] = [1, 2, 4, 6, 8, 10];

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

// Lojas e validade fixas por enquanto: a etapa de ligar o encarte as
// lojas cadastradas (Etapa 6) e a proxima depois desta integracao.
const LOJAS_PADRAO = [
  {
    nome: "FREGUESIA",
    endereco: "ESTRADA DO BANANAL, 477",
    whatsapp: "(21) 97384-7640",
  },
  {
    nome: "BARRA DA TIJUCA",
    endereco: "RUA GILDÁSIO AMADO, 55 - LOJA A",
    whatsapp: "(21) 97510-3253",
  },
];

function pctTexto(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

export default function GenerateEncartePage() {
  const { data: empresas, isLoading: carregandoEmpresas } = useCompanies();
  const { mostrar } = useToast();

  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");
  const { data: draft } = useEncarte(draftId);
  const [draftCarregado, setDraftCarregado] = useState(false);

  const [texto, setTexto] = useState("");
  const [processando, setProcessando] = useState(false);
  const [resultados, setResultados] = useState<LinhaResultado[] | null>(null);

  const [temaFamilia, setTemaFamilia] = useState(TEMAS_DISPONIVEIS[0].familia);
  const [formato, setFormato] = useState<FormatoEncarte>(4);
  const [escalas, setEscalas] = useState<EscalasTema>(ESCALA_PADRAO);
  const [mostrarSalvar, setMostrarSalvar] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const [resolucaoIndex, setResolucaoIndex] = useState(0);
  const [exportando, setExportando] = useState<FormatoArquivo | null>(null);
  const [linkPersistente, setLinkPersistente] = useState<string | null>(null);

  const empresa = empresas?.[0];

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

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-lg font-semibold">Gerar encarte</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Cole a lista de produtos, escolha o tema e o formato, e acompanhe a
        pré-visualização ao vivo.
      </p>

      {carregandoEmpresas ? (
        <div className="mt-6">
          <SkeletonLista />
        </div>
      ) : !empresa ? (
        <div className="mt-6">
          <SecaoVazia>
            Cadastre uma empresa em Preparação antes de gerar um encarte.
          </SecaoVazia>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-4">
            <Card>
              <Campo label="Lista de produtos (um por linha: nome, preço e unidade)">
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder={PLACEHOLDER}
                  rows={8}
                  disabled={processando}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 outline-none transition placeholder:font-sans placeholder:text-neutral-400 focus:border-neutral-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </Campo>
              <div className="mt-3">
                <Button onClick={() => void processar()} disabled={processando}>
                  {processando ? "Processando..." : "Processar"}
                </Button>
              </div>
            </Card>

            {resultados ? (
              <Card>
                <h2 className="text-sm font-semibold">
                  Produtos reconhecidos (
                  {resultados.filter((r) => r.escolhida).length}/
                  {resultados.length})
                </h2>
                <ul className="mt-3 space-y-2">
                  {resultados.map((r, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="truncate text-neutral-500 dark:text-neutral-400">
                          {r.linha.linhaOriginal}
                        </span>
                        {r.carregando ? (
                          <span className="shrink-0 text-xs text-neutral-400">
                            buscando...
                          </span>
                        ) : r.erro ? (
                          <span className="shrink-0 text-xs text-red-600 dark:text-red-400">
                            falha na busca
                          </span>
                        ) : r.escolhida ? (
                          <span className="shrink-0 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            ✓ {r.escolhida.product.name} (
                            {pctTexto(r.escolhida.confidence)})
                          </span>
                        ) : (
                          <span className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-400">
                            {!r.linha.preco && !r.suggestions.length
                              ? "⚠ preço não reconhecido"
                              : "✕ não encontrado"}
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
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Você quis dizer:
                          </span>
                          {r.suggestions.map((s) => (
                            <button
                              key={s.product.id}
                              type="button"
                              onClick={() => escolherSugestao(i, s)}
                              className="rounded-full border border-neutral-300 px-2.5 py-0.5 text-xs transition hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500"
                            >
                              {s.product.name} ({pctTexto(s.confidence)})
                            </button>
                          ))}
                        </div>
                      ) : null}

                      {!r.carregando &&
                      !r.escolhida &&
                      !r.erro &&
                      r.suggestions.length === 0 &&
                      r.linha.preco ? (
                        <p className="mt-1 text-xs text-neutral-400">
                          Nenhum produto parecido no catálogo.
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card>
              <Campo label="Tema">
                <Select
                  value={temaFamilia}
                  onChange={(e) => setTemaFamilia(e.target.value)}
                >
                  {TEMAS_DISPONIVEIS.map((t) => (
                    <option key={t.familia} value={t.familia}>
                      {t.nome}
                    </option>
                  ))}
                </Select>
              </Campo>

              <div className="mt-4">
                <span className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Formato
                </span>
                <div className="flex flex-wrap gap-2">
                  {FORMATOS.map((f) => (
                    <label
                      key={f}
                      className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition ${
                        formato === f
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                          : "border-neutral-300 hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name="formato"
                        value={f}
                        checked={formato === f}
                        onChange={() => setFormato(f)}
                        className="sr-only"
                      />
                      {f} {f === 1 ? "item" : "itens"}
                    </label>
                  ))}
                </div>
              </div>
            </Card>

            {resultados ? (
              itensParaPreview.length > 0 ? (
                <>
                  <Card>
                    <h2 className="mb-3 text-sm font-semibold">
                      Ajustar tamanhos
                    </h2>
                    <SizeEditor
                      currentSizes={escalas}
                      onSizeChange={setEscalas}
                    />
                  </Card>
                  <div ref={previewRef} className="inline-block w-full">
                    <EncartePreviewer
                      produtos={itensParaPreview}
                      temaId={`${temaFamilia}-${formato}`}
                      formato={formato}
                      lojas={LOJAS_PADRAO}
                      validade={new Date().toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                      escalas={escalas}
                    />
                  </div>

                  <Card>
                    <h2 className="mb-3 text-sm font-semibold">Download</h2>
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
                    <div className="mt-3 flex gap-2">
                      <Button
                        onClick={() => void baixar("png")}
                        disabled={exportando !== null}
                      >
                        {exportando === "png"
                          ? "Gerando..."
                          : "Download como PNG"}
                      </Button>
                      <Button
                        variante="secundario"
                        onClick={() => void baixar("jpeg")}
                        disabled={exportando !== null}
                      >
                        {exportando === "jpeg"
                          ? "Gerando..."
                          : "Download como JPG"}
                      </Button>
                    </div>
                    {linkPersistente ? (
                      <p className="mt-3 truncate text-xs text-neutral-500 dark:text-neutral-400">
                        Link permanente:{" "}
                        <a
                          href={linkPersistente}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4"
                        >
                          {linkPersistente}
                        </a>
                      </p>
                    ) : null}
                  </Card>

                  <Card>
                    <h2 className="mb-3 text-sm font-semibold">Rascunho</h2>
                    <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
                      Salva a lista, o tema/formato e os ajustes de tamanho para
                      retomar depois em Rascunhos.
                    </p>
                    <Button
                      variante="secundario"
                      onClick={() => setMostrarSalvar(true)}
                    >
                      Salvar rascunho
                    </Button>
                  </Card>
                </>
              ) : (
                <Erro>
                  Nenhum produto foi reconhecido ainda. Escolha uma sugestão na
                  lista ao lado, ou ajuste a lista colada.
                </Erro>
              )
            ) : (
              <SecaoVazia>
                A pré-visualização aparece aqui depois de processar a lista.
              </SecaoVazia>
            )}
          </div>
        </div>
      )}

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
