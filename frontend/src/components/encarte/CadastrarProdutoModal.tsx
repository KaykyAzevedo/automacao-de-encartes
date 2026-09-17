"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Erro } from "@/components/ui/Card";
import { Campo, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useCriarProduct } from "@/hooks/useProducts";
import { ApiError } from "@/lib/api";
import { uploadArquivo } from "@/lib/upload";
import type { Product } from "@/types";

// "Cadastrar sem sair" (fluxograma "Uso Diário"): quando um item da
// lista colada nao bate com nada do catalogo e nao tem nenhuma
// sugestao, isso obrigava o usuario a abandonar o encarte, ir em
// Preparação cadastrar o produto e voltar. Esse modal resolve a linha
// na hora, sem sair do wizard.
export function CadastrarProdutoModal({
  companyId,
  nomeSugerido,
  onCriado,
  onFechar,
}: {
  companyId: string;
  nomeSugerido: string;
  onCriado: (produto: Product) => void;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState(nomeSugerido);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const criar = useCriarProduct(companyId);

  async function salvar() {
    setErro(null);
    if (!nome.trim()) {
      setErro("Informe o nome do produto");
      return;
    }
    if (!arquivo) {
      setErro("Escolha uma foto do produto");
      return;
    }
    setEnviando(true);
    try {
      const photoS3Url = await uploadArquivo(arquivo);
      const produto = await criar.mutateAsync({
        name: nome.trim(),
        photoS3Url,
      });
      onCriado(produto);
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        setErro(err.details.map((d) => d.mensagem).join(" · "));
      } else {
        setErro(
          err instanceof Error ? err.message : "Não foi possível cadastrar"
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal titulo="Cadastrar produto" onFechar={onFechar}>
      <div className="space-y-4">
        <Campo label="Nome do produto">
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Manga Palmer"
            disabled={enviando}
            autoFocus
          />
        </Campo>

        <Campo label="Foto do produto">
          <input
            type="file"
            accept="image/*"
            disabled={enviando}
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-neutral-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[rgb(var(--surface-subtle))] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[rgb(var(--brand))]"
          />
        </Campo>

        {erro ? <Erro>{erro}</Erro> : null}

        <div className="flex gap-2 pt-1">
          <Button onClick={() => void salvar()} carregando={enviando}>
            {enviando ? "Cadastrando..." : "Cadastrar e usar"}
          </Button>
          <Button
            type="button"
            variante="secundario"
            onClick={onFechar}
            disabled={enviando}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
