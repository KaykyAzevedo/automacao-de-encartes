"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Erro } from "@/components/ui/Card";
import { Campo, Input, Select } from "@/components/ui/Input";
import { LogoPreview } from "@/components/ui/LogoPreview";
import { useToast } from "@/components/ui/Toast";
import { useAtualizarEmpresa, useCriarEmpresa } from "@/hooks/useCompanies";
import { ApiError } from "@/lib/api";
import { empresaSchema, errosPorCampo } from "@/lib/schemas";
import type { Company, EstiloEmpresa } from "@/types";

export function FormCompany({
  empresa,
  onFechar,
}: {
  empresa?: Company;
  onFechar: () => void;
}) {
  const editando = Boolean(empresa);
  const { mostrar } = useToast();

  const [name, setName] = useState(empresa?.name ?? "");
  const [style, setStyle] = useState<EstiloEmpresa>(
    empresa?.style ?? "sofisticado"
  );
  const [logo, setLogo] = useState(empresa?.logo ?? "");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const criar = useCriarEmpresa();
  const atualizar = useAtualizarEmpresa();
  const salvando = criar.isPending || atualizar.isPending;

  // o erro de um campo some assim que ele e corrigido, em vez de
  // esperar o proximo envio
  function limpaErro(campo: string) {
    setErros((atual) => {
      if (!atual[campo]) return atual;
      const copia = { ...atual };
      delete copia[campo];
      return copia;
    });
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErroGeral(null);

    // valida no cliente antes de gastar uma requisicao
    const analise = empresaSchema.safeParse({ name, style, logo });
    if (!analise.success) {
      setErros(errosPorCampo(analise.error));
      return;
    }
    setErros({});

    const dados = {
      name: analise.data.name,
      style: analise.data.style,
      logo: analise.data.logo?.trim() ? analise.data.logo.trim() : null,
    };

    try {
      if (editando && empresa) {
        await atualizar.mutateAsync({ id: empresa.id, ...dados });
        mostrar("sucesso", `Empresa "${dados.name}" atualizada.`);
      } else {
        await criar.mutateAsync(dados);
        mostrar("sucesso", `Empresa "${dados.name}" criada.`);
      }
      onFechar();
    } catch (err) {
      // o backend e a fonte de verdade: se ele recusar, mostramos
      // os erros dele por campo, mesmo tendo passado no cliente
      if (err instanceof ApiError && err.details?.length) {
        setErros(
          Object.fromEntries(err.details.map((d) => [d.campo, d.mensagem]))
        );
        setErroGeral(err.message);
      } else {
        const msg =
          err instanceof Error ? err.message : "Não foi possível salvar";
        setErroGeral(msg);
        mostrar("erro", msg);
      }
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <Campo label="Nome da empresa" erro={erros.name}>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            limpaErro("name");
          }}
          placeholder="Empório Hortifruti"
          disabled={salvando}
          autoFocus
        />
      </Campo>

      <Campo label="Estilo dos encartes" erro={erros.style}>
        <Select
          value={style}
          onChange={(e) => {
            setStyle(e.target.value as EstiloEmpresa);
            limpaErro("style");
          }}
          disabled={salvando}
        >
          <option value="sofisticado">Sofisticado (preto e dourado)</option>
          <option value="agressivo">Agressivo (amarelo e preto)</option>
        </Select>
      </Campo>

      <Campo label="URL do logo (opcional)" erro={erros.logo}>
        <div className="flex items-center gap-3">
          <Input
            value={logo}
            onChange={(e) => {
              setLogo(e.target.value);
              limpaErro("logo");
            }}
            placeholder="https://..."
            disabled={salvando}
          />
          <LogoPreview url={logo} alt="Prévia do logo" />
        </div>
      </Campo>

      {erroGeral ? <Erro>{erroGeral}</Erro> : null}

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : editando ? "Salvar" : "Criar empresa"}
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
    </form>
  );
}
