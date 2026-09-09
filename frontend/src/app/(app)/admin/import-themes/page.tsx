"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, Erro } from "@/components/ui/Card";
import { Campo, Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useCompanies } from "@/hooks/useCompanies";
import { DIAS_SEMANA, type DiaSemana } from "@/hooks/useThemes";
import {
  importarTemplateTema,
  type ArquivosTemplate,
} from "@/lib/importarTemplateTema";

// Etapa 25: pagina de teste pra converter os PNGs dos temas 1 e 2 (ou
// qualquer outro) direto em Theme, sem precisar mexer em código - so
// escolher a empresa, dar um nome, escolher os PNGs e enviar. Formatos
// que faltarem (incluindo 2 e 6, fora do pedido original) reaproveitam
// a arte do formato mais próximo já enviado - avisado na resposta.
const CAMPOS_FORMATO = [
  { campo: "format1", rotulo: "1 item" },
  { campo: "format4", rotulo: "4 itens" },
  { campo: "format8", rotulo: "8 itens" },
  { campo: "format10", rotulo: "10 itens" },
] as const;

export default function ImportThemesPage() {
  const { data: empresas, isLoading: carregandoEmpresas } = useCompanies();
  const { mostrar } = useToast();

  const [companyId, setCompanyId] = useState("");
  const [themeName, setThemeName] = useState("");
  const [day, setDay] = useState<DiaSemana>("segunda");
  const [arquivos, setArquivos] = useState<ArquivosTemplate>({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<number[] | null>(null);

  const empresaPadrao = empresas?.[0];
  const companyIdEfetivo = companyId || empresaPadrao?.id || "";
  const temPeloMenosUmArquivo = Object.values(arquivos).some(Boolean);

  async function enviar() {
    setErro(null);
    setResultado(null);

    if (!companyIdEfetivo) {
      setErro("Selecione uma empresa.");
      return;
    }
    if (!themeName.trim()) {
      setErro("Dê um nome ao tema.");
      return;
    }
    if (!temPeloMenosUmArquivo) {
      setErro("Escolha ao menos um PNG.");
      return;
    }

    setEnviando(true);
    try {
      const resposta = await importarTemplateTema({
        companyId: companyIdEfetivo,
        themeName: themeName.trim(),
        day,
        arquivos,
      });
      setResultado(resposta.formatosComArtePropria);
      mostrar("sucesso", `Tema "${themeName.trim()}" criado.`);
      setThemeName("");
      setArquivos({});
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao importar";
      setErro(msg);
      mostrar("erro", msg);
    } finally {
      setEnviando(false);
    }
  }

  const formatosSemArte = [1, 2, 4, 6, 8, 10].filter(
    (f) => resultado && !resultado.includes(f)
  );

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-lg font-semibold">Importar templates de tema</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Página de teste (Etapa 25): sobe os PNGs de fundo de um tema e já cria o
        registro no banco, sem precisar desenhar SVG na mão. Formatos não
        enviados (incluindo 2 e 6 itens) reaproveitam a arte do formato mais
        próximo, como aviso temporário até chegar a arte definitiva.
      </p>

      <Card className="mt-6 space-y-4">
        <Campo label="Empresa">
          {carregandoEmpresas ? (
            <p className="text-sm text-neutral-400">Carregando...</p>
          ) : (
            <Select
              value={companyIdEfetivo}
              onChange={(e) => setCompanyId(e.target.value)}
              disabled={enviando}
            >
              {!empresas?.length ? (
                <option value="">Nenhuma empresa cadastrada</option>
              ) : null}
              {empresas?.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.name}
                </option>
              ))}
            </Select>
          )}
        </Campo>

        <Campo label="Nome do tema">
          <Input
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            placeholder="Tema 1"
            disabled={enviando}
          />
        </Campo>

        <Campo label="Dia da semana sugerido">
          <Select
            value={day}
            onChange={(e) => setDay(e.target.value as DiaSemana)}
            disabled={enviando}
          >
            {DIAS_SEMANA.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Campo>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            PNGs por formato (escolha ao menos um)
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {CAMPOS_FORMATO.map(({ campo, rotulo }) => (
              <label key={campo} className="block">
                <span className="mb-1 block text-xs text-neutral-500 dark:text-neutral-400">
                  {rotulo}
                </span>
                <input
                  type="file"
                  accept="image/png"
                  disabled={enviando}
                  onChange={(e) =>
                    setArquivos((atual) => ({
                      ...atual,
                      [campo]: e.target.files?.[0] ?? null,
                    }))
                  }
                  className="block w-full text-xs file:mr-2 file:rounded-lg file:border file:border-neutral-300 file:bg-white file:px-2 file:py-1 file:text-xs dark:file:border-neutral-700 dark:file:bg-neutral-900"
                />
              </label>
            ))}
          </div>
        </div>

        {erro ? <Erro>{erro}</Erro> : null}

        {resultado ? (
          <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            Criado com arte própria em: {resultado.join(", ")} item(ns).
            {formatosSemArte.length > 0
              ? ` Ainda emprestando arte de outro formato em: ${formatosSemArte.join(", ")} item(ns).`
              : ""}
          </p>
        ) : null}

        <Button onClick={() => void enviar()} carregando={enviando}>
          {enviando ? "Importando..." : "Importar tema"}
        </Button>
      </Card>
    </div>
  );
}
