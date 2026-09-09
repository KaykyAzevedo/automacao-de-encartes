"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Erro } from "@/components/ui/Card";
import { Campo, Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SkeletonLista } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  DIAS_SEMANA,
  FORMATOS_TEMA,
  useAtualizarTema,
  useCriarTema,
  useTheme,
  type CamposSvg,
  type DiaSemana,
  type FormatoTema,
  type ThemeCompleto,
} from "@/hooks/useThemes";
import { ApiError } from "@/lib/api";
import { uploadArquivo } from "@/lib/upload";

const ROTULO_DIA: Record<DiaSemana, string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

function campoDoFormato(f: FormatoTema): keyof CamposSvg {
  return `format${f}Svg` as keyof CamposSvg;
}

export function EditThemeModal({
  companyId,
  temaId,
  onFechar,
}: {
  companyId: string;
  temaId?: string;
  onFechar: () => void;
}) {
  const editando = Boolean(temaId);
  const { data: tema, isLoading } = useTheme(temaId ?? null);

  return (
    <Modal
      titulo={editando ? "Editar tema" : "Novo tema"}
      onFechar={onFechar}
      largura="max-w-3xl"
    >
      {editando && isLoading ? (
        <SkeletonLista linhas={3} />
      ) : (
        <FormularioTema companyId={companyId} tema={tema} onFechar={onFechar} />
      )}
    </Modal>
  );
}

// Separado do modal para inicializar os campos direto do `tema`
// recebido: so monta depois que o fetch (no caso de edicao) resolveu,
// entao o useState pega o valor certo sem precisar de useEffect.
function FormularioTema({
  companyId,
  tema,
  onFechar,
}: {
  companyId: string;
  tema?: ThemeCompleto;
  onFechar: () => void;
}) {
  const editando = Boolean(tema);
  const { mostrar } = useToast();

  const [themeName, setThemeName] = useState(tema?.themeName ?? "");
  const [day, setDay] = useState<DiaSemana>(tema?.day ?? "quarta");
  const [svgs, setSvgs] = useState<CamposSvg>({
    format1Svg: tema?.format1Svg ?? "",
    format2Svg: tema?.format2Svg ?? "",
    format4Svg: tema?.format4Svg ?? "",
    format6Svg: tema?.format6Svg ?? "",
    format8Svg: tema?.format8Svg ?? "",
    format10Svg: tema?.format10Svg ?? "",
  });
  const [enviando, setEnviando] = useState<FormatoTema | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const criar = useCriarTema(companyId);
  const atualizar = useAtualizarTema(companyId);
  const salvando = criar.isPending || atualizar.isPending;

  async function tratarArquivo(formato: FormatoTema, file: File) {
    setEnviando(formato);
    setErroGeral(null);
    try {
      let svg: string;
      const ehSvg =
        file.type === "image/svg+xml" ||
        file.name.toLowerCase().endsWith(".svg");

      if (ehSvg) {
        svg = await file.text();
        if (!/^\s*<svg[\s>]/i.test(svg)) {
          throw new Error("O arquivo não parece ser um SVG válido");
        }
      } else {
        // imagem raster: sobe pelo endpoint real de upload (Etapa 11)
        // e embrulha num SVG minimo, ja que o campo no banco exige SVG
        const url = await uploadArquivo(file);
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350"><image href="${url}" width="1080" height="1350" preserveAspectRatio="xMidYMid slice"/></svg>`;
      }

      setSvgs((atual) => ({ ...atual, [campoDoFormato(formato)]: svg }));
    } catch (err) {
      mostrar(
        "erro",
        err instanceof Error ? err.message : "Falha ao processar o arquivo"
      );
    } finally {
      setEnviando(null);
    }
  }

  async function salvar() {
    setErroGeral(null);

    if (!themeName.trim()) {
      setErroGeral("Informe o nome do tema");
      return;
    }
    const faltando = FORMATOS_TEMA.filter(
      (f) => !svgs[campoDoFormato(f)].trim()
    );
    if (faltando.length > 0) {
      setErroGeral(
        `Envie a arte dos formatos: ${faltando.join(", ")} (${faltando.length > 1 ? "itens" : "item"})`
      );
      return;
    }

    try {
      if (editando && tema) {
        await atualizar.mutateAsync({
          id: tema.id,
          themeName: themeName.trim(),
          day,
          ...svgs,
        });
        mostrar("sucesso", `Tema "${themeName}" atualizado.`);
      } else {
        await criar.mutateAsync({ themeName: themeName.trim(), day, ...svgs });
        mostrar("sucesso", `Tema "${themeName}" criado.`);
      }
      onFechar();
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        setErroGeral(
          err.details.map((d) => `${d.campo}: ${d.mensagem}`).join(" · ")
        );
      } else {
        setErroGeral(
          err instanceof Error ? err.message : "Não foi possível salvar"
        );
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Nome do tema">
          <Input
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            placeholder="Quartou do Empório"
            disabled={salvando}
            autoFocus
          />
        </Campo>
        <Campo label="Dia da semana">
          <Select
            value={day}
            onChange={(e) => setDay(e.target.value as DiaSemana)}
            disabled={salvando}
          >
            {DIAS_SEMANA.map((d) => (
              <option key={d} value={d}>
                {ROTULO_DIA[d]}
              </option>
            ))}
          </Select>
        </Campo>
      </div>

      <div>
        <span className="mb-2 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Arte por formato — SVG ou imagem (PNG/JPG vira uma prévia
          automaticamente)
        </span>
        <div className="grid grid-cols-3 gap-3">
          {FORMATOS_TEMA.map((formato) => {
            const campo = campoDoFormato(formato);
            const conteudo = svgs[campo];
            return (
              <div
                key={formato}
                className="rounded-lg border border-neutral-200 p-2 dark:border-neutral-800"
              >
                <div
                  className="mb-2 aspect-[4/5] overflow-hidden rounded border border-dashed border-neutral-300 bg-neutral-50 [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:object-cover dark:border-neutral-700 dark:bg-neutral-900"
                  dangerouslySetInnerHTML={
                    conteudo ? { __html: conteudo } : undefined
                  }
                />
                <p className="mb-1 text-center text-[11px] text-neutral-500 dark:text-neutral-400">
                  {formato} {formato === 1 ? "item" : "itens"}
                </p>
                <label className="block">
                  <input
                    type="file"
                    accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
                    className="sr-only"
                    disabled={salvando || enviando === formato}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void tratarArquivo(formato, file);
                      e.target.value = "";
                    }}
                  />
                  <span className="flex cursor-pointer items-center justify-center gap-1 rounded border border-neutral-300 px-2 py-1 text-center text-[11px] transition hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500">
                    {enviando === formato ? <Spinner tamanho="sm" /> : null}
                    {enviando === formato
                      ? "Enviando..."
                      : conteudo
                        ? "Trocar"
                        : "Enviar"}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {erroGeral ? <Erro>{erroGeral}</Erro> : null}

      <div className="flex gap-2 pt-1">
        <Button
          onClick={() => void salvar()}
          disabled={enviando !== null}
          carregando={salvando}
        >
          {salvando ? "Salvando..." : editando ? "Salvar" : "Criar tema"}
        </Button>
        <Button
          type="button"
          variante="secundario"
          onClick={onFechar}
          disabled={salvando}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
