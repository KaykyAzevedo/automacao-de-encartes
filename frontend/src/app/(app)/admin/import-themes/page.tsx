"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, Erro } from "@/components/ui/Card";
import { Campo, Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useCompanies } from "@/hooks/useCompanies";
import { DIAS_SEMANA, type DiaSemana } from "@/hooks/useThemes";
import { importarTemplateTema } from "@/lib/importarTemplateTema";

// Etapa 25: pagina de teste pra converter o PNG de um tema direto em
// Theme, sem precisar mexer em código. Etapa 27: foco exclusivo em 8
// itens - o formulario so pede esse formato agora; os outros 5 do
// Theme continuam existindo no banco (schema intacto) e sao
// preenchidos com a mesma arte de 8 itens por baixo dos panos (ver
// backend/src/controllers/themeTemplate.controller.ts).
export default function ImportThemesPage() {
  const { data: empresas, isLoading: carregandoEmpresas } = useCompanies();
  const { mostrar } = useToast();

  const [companyId, setCompanyId] = useState("");
  const [themeName, setThemeName] = useState("");
  const [day, setDay] = useState<DiaSemana>("segunda");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const empresaPadrao = empresas?.[0];
  const companyIdEfetivo = companyId || empresaPadrao?.id || "";

  async function enviar() {
    setErro(null);
    setSucesso(false);

    if (!companyIdEfetivo) {
      setErro("Selecione uma empresa.");
      return;
    }
    if (!themeName.trim()) {
      setErro("Dê um nome ao tema.");
      return;
    }
    if (!arquivo) {
      setErro("Escolha o PNG de fundo.");
      return;
    }

    setEnviando(true);
    try {
      await importarTemplateTema({
        companyId: companyIdEfetivo,
        themeName: themeName.trim(),
        day,
        arquivos: { format8: arquivo },
      });
      setSucesso(true);
      mostrar("sucesso", `Tema "${themeName.trim()}" criado.`);
      setThemeName("");
      setArquivo(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Falha ao importar";
      setErro(msg);
      mostrar("erro", msg);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-lg font-semibold">Importar template de tema</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Página de teste: sobe o PNG de fundo do encarte de 8 itens e já cria o
        registro no banco, sem precisar desenhar SVG na mão.
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

        <Campo label="PNG de fundo (8 itens)">
          <input
            type="file"
            accept="image/png"
            disabled={enviando}
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            className="block w-full text-xs file:mr-2 file:rounded-lg file:border file:border-neutral-300 file:bg-white file:px-2 file:py-1 file:text-xs dark:file:border-neutral-700 dark:file:bg-neutral-900"
          />
        </Campo>

        {erro ? <Erro>{erro}</Erro> : null}

        {sucesso ? (
          <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            Tema criado com a arte de 8 itens.
          </p>
        ) : null}

        <Button onClick={() => void enviar()} carregando={enviando}>
          {enviando ? "Importando..." : "Importar tema"}
        </Button>
      </Card>
    </div>
  );
}
