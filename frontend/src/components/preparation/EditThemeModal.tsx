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
      titulo={editando ? "Editar modelo" : "Novo modelo"}
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
      setErroGeral("Informe o nome do modelo");
      return;
    }
    if (!svgs.format8Svg.trim()) {
      setErroGeral("Envie a arte do formato de 8 itens");
      return;
    }

    // Etapa 27: foco exclusivo em 8 itens - o formulario so pede essa
    // arte, mas o Theme no banco ainda exige as 6 (schema intacto de
    // proposito, pra nao precisar de migration quando reativarmos os
    // outros formatos). Formato sem arte propria (nunca teve, ou este
    // e um tema novo) reaproveita a arte de 8 itens; se o tema ja
    // tinha arte distinta de antes desta etapa, ela e preservada.
    const svgsCompletos: CamposSvg = FORMATOS_TEMA.reduce(
      (acc, f) => {
        const campo = campoDoFormato(f);
        acc[campo] = svgs[campo].trim() || svgs.format8Svg;
        return acc;
      },
      { ...svgs }
    );

    try {
      if (editando && tema) {
        await atualizar.mutateAsync({
          id: tema.id,
          themeName: themeName.trim(),
          day,
          ...svgsCompletos,
        });
        mostrar("sucesso", `Modelo "${themeName}" atualizado.`);
      } else {
        await criar.mutateAsync({
          themeName: themeName.trim(),
          day,
          ...svgsCompletos,
        });
        mostrar("sucesso", `Modelo "${themeName}" criado.`);
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
        <Campo label="Nome do modelo">
          <Input
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            placeholder="Ofertas de quarta-feira"
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
          Arte do modelo para 8 itens — SVG ou imagem (PNG/JPG gera uma prévia
          automaticamente)
        </span>
        {/* Etapa 27: foco exclusivo em 8 itens - so pede essa arte
            aqui; os outros 5 formatos do Theme sao preenchidos por
            baixo dos panos no salvar() (ver comentario la). */}
        <div className="max-w-[180px] rounded-lg border border-neutral-200 p-2 dark:border-neutral-800">
          <div
            className="mb-2 aspect-[4/5] overflow-hidden rounded border border-dashed border-neutral-300 bg-neutral-50 [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:object-cover dark:border-neutral-700 dark:bg-neutral-900"
            dangerouslySetInnerHTML={
              svgs.format8Svg ? { __html: svgs.format8Svg } : undefined
            }
          />
          <p className="mb-1 text-center text-[11px] text-neutral-500 dark:text-neutral-400">
            8 itens
          </p>
          <label className="block">
            <input
              type="file"
              accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={salvando || enviando === 8}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void tratarArquivo(8, file);
                e.target.value = "";
              }}
            />
            <span className="flex cursor-pointer items-center justify-center gap-1 rounded border border-neutral-300 px-2 py-1 text-center text-[11px] transition hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500">
              {enviando === 8 ? <Spinner tamanho="sm" /> : null}
              {enviando === 8
                ? "Enviando..."
                : svgs.format8Svg
                  ? "Trocar"
                  : "Enviar"}
            </span>
          </label>
        </div>
      </div>

      {erroGeral ? <Erro>{erroGeral}</Erro> : null}

      <div className="flex gap-2 pt-1">
        <Button
          onClick={() => void salvar()}
          disabled={enviando !== null}
          carregando={salvando}
        >
          {salvando
            ? "Salvando..."
            : editando
              ? "Salvar alterações"
              : "Criar modelo"}
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
