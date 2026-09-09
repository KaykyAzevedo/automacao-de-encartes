"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Erro } from "@/components/ui/Card";
import { Campo, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useCriarEncarte, type DadosEncarteDraft } from "@/hooks/useEncartes";
import { ApiError } from "@/lib/api";

// Modal simples de "Nome do rascunho" (Etapa 20) - o resto do payload
// (lista colada, tema/formato escolhidos, produtos ja casados, escalas
// do editor visual) vem pronto de quem abre o modal: a pagina de
// geracao ja tem tudo isso em estado, nao precisa duplicar aqui.
export function SaveDraftModal({
  dados,
  onSalvo,
  onFechar,
}: {
  dados: Omit<DadosEncarteDraft, "name">;
  onSalvo: (nome: string) => void;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const criar = useCriarEncarte(dados.companyId);

  async function salvar() {
    setErro(null);
    if (!nome.trim()) {
      setErro("Informe um nome para o rascunho");
      return;
    }
    try {
      await criar.mutateAsync({ ...dados, name: nome.trim() });
      onSalvo(nome.trim());
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        setErro(err.details.map((d) => d.mensagem).join(" · "));
      } else {
        setErro(err instanceof Error ? err.message : "Não foi possível salvar");
      }
    }
  }

  return (
    <Modal titulo="Salvar rascunho" onFechar={onFechar}>
      <div className="space-y-4">
        <Campo label="Nome do rascunho">
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Promoção de terça-feira"
            disabled={criar.isPending}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") void salvar();
            }}
          />
        </Campo>

        {erro ? <Erro>{erro}</Erro> : null}

        <div className="flex gap-2 pt-1">
          <Button onClick={() => void salvar()} carregando={criar.isPending}>
            {criar.isPending ? "Salvando..." : "Salvar"}
          </Button>
          <Button
            type="button"
            variante="secundario"
            onClick={onFechar}
            disabled={criar.isPending}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
