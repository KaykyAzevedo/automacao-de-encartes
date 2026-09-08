"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Erro } from "@/components/ui/Card";
import { Campo, Input } from "@/components/ui/Input";
import { useAtualizarLoja, useCriarLoja } from "@/hooks/useStores";
import { ApiError } from "@/lib/api";
import type { Store } from "@/types";

export function FormStore({
  companyId,
  loja,
  onFechar,
}: {
  companyId: string;
  loja?: Store;
  onFechar: () => void;
}) {
  const editando = Boolean(loja);
  const [name, setName] = useState(loja?.name ?? "");
  const [address, setAddress] = useState(loja?.address ?? "");
  const [deliveryPhone, setDeliveryPhone] = useState(loja?.deliveryPhone ?? "");

  const criar = useCriarLoja(companyId);
  const atualizar = useAtualizarLoja(companyId);
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
    const dados = {
      name,
      address,
      deliveryPhone: deliveryPhone.trim() || null,
    };
    try {
      if (editando && loja) {
        await atualizar.mutateAsync({ id: loja.id, ...dados });
      } else {
        await criar.mutateAsync(dados);
      }
      onFechar();
    } catch {
      // idem FormCompany: o erro e exibido pelo mutation.error
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <Campo label="Nome da loja">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Freguesia"
          autoFocus
        />
      </Campo>

      <Campo label="Endereço">
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Estrada do Bananal, 477"
        />
      </Campo>

      <Campo label="WhatsApp do delivery (opcional)">
        <Input
          value={deliveryPhone}
          onChange={(e) => setDeliveryPhone(e.target.value)}
          placeholder="(21) 97384-7640"
        />
      </Campo>

      {mensagemErro ? <Erro>{mensagemErro}</Erro> : null}

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Salvando..."
            : editando
              ? "Salvar"
              : "Criar loja"}
        </Button>
        <Button type="button" variante="secundario" onClick={onFechar}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
