"use client";

import { useState } from "react";

import { EncartePreviewer } from "@/components/encarte/EncartePreviewer";
import { Button } from "@/components/ui/Button";
import { Card, Erro, SecaoVazia } from "@/components/ui/Card";
import { Campo, Select } from "@/components/ui/Input";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useCompanies } from "@/hooks/useCompanies";
import { matchProduct, type ResultadoMatch } from "@/lib/match";
import { parsearLista, type LinhaProcessada } from "@/lib/parserLista";
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

  const [texto, setTexto] = useState("");
  const [processando, setProcessando] = useState(false);
  const [resultados, setResultados] = useState<LinhaResultado[] | null>(null);

  const [temaFamilia, setTemaFamilia] = useState(TEMAS_DISPONIVEIS[0].familia);
  const [formato, setFormato] = useState<FormatoEncarte>(4);

  const empresa = empresas?.[0];

  async function processar() {
    if (!empresa) return;

    const linhas = parsearLista(texto);
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
          };
        } catch {
          return {
            linha,
            carregando: false,
            erro: true,
            suggestions: [],
            escolhida: null,
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

  function escolherSugestao(indice: number, sugestao: ResultadoMatch) {
    setResultados((atual) =>
      atual
        ? atual.map((r, i) =>
            i === indice ? { ...r, escolhida: sugestao } : r
          )
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
        fotoUrl: r.escolhida.product.photoS3Url,
      })) ?? [];

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
                <EncartePreviewer
                  produtos={itensParaPreview}
                  temaId={`${temaFamilia}-${formato}`}
                  formato={formato}
                  lojas={LOJAS_PADRAO}
                  validade={new Date().toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                />
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
    </div>
  );
}
