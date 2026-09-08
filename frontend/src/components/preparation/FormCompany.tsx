"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Erro } from "@/components/ui/Card";
import { Campo, Input, Select } from "@/components/ui/Input";
import { useAtualizarEmpresa, useCriarEmpresa } from "@/hooks/useCompanies";
import { ApiError } from "@/lib/api";
import type { Company, EstiloEmpresa } from "@/types";

export function FormCompany({
  empresa,
  onFechar,
}: {
  empresa?: Company;
  onFechar: () => void;
}) {
  const editando = Boolean(empresa);
  const [name, setName] = useState(empresa?.name ?? "");
  const [style, setStyle] = useState<EstiloEmpresa>(
    empresa?.style ?? "sofisticado"
  );
  const [logo, setLogo] = useState(empresa?.logo ?? "");

  const criar = useCriarEmpresa();
  const atualizar = useAtualizarEmpresa();
  const mutation = editando ? atualizar : criar;

  const erro = mutation.error;
  const mensagemErro =
    erro instanceof ApiError
      ? (erro.details?.map((d) => `${d.campo}: ${d.mensagem}`).join(" · ") ??
        erro.message)
      : erro
        ? "Falha ao salvar"
        : null;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const dados = { name, style, logo: logo.trim() || null };
    try {
      if (editando && empresa) {
        await atualizar.mutateAsync({ id: empresa.id, ...dados });
      } else {
        await criar.mutateAsync(dados);
      }
      onFechar();
    } catch {
      // o erro ja fica em mutation.error e e exibido no formulario;
      // sem o catch a promise rejeitada vazaria como unhandled rejection
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo label="Nome da empresa">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Empório Hortifruti"
          autoFocus
        />
      </Campo>

      <Campo label="Estilo dos encartes">
        <Select
          value={style}
          onChange={(e) => setStyle(e.target.value as EstiloEmpresa)}
        >
          <option value="sofisticado">Sofisticado (preto e dourado)</option>
          <option value="agressivo">Agressivo (amarelo e preto)</option>
        </Select>
      </Campo>

      <Campo label="URL do logo (opcional)">
        <Input
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          placeholder="https://..."
        />
      </Campo>

      {mensagemErro ? <Erro>{mensagemErro}</Erro> : null}

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Salvando..."
            : editando
              ? "Salvar"
              : "Criar empresa"}
        </Button>
        <Button type="button" variante="secundario" onClick={onFechar}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
