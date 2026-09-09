"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Erro } from "@/components/ui/Card";
import { Campo, Input } from "@/components/ui/Input";
import { LogoPreview } from "@/components/ui/LogoPreview";
import { useToast } from "@/components/ui/Toast";
import { useAtualizarLoja, useCriarLoja } from "@/hooks/useStores";
import { ApiError } from "@/lib/api";
import { errosPorCampo, lojaSchema } from "@/lib/schemas";
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
  const { mostrar } = useToast();

  const [name, setName] = useState(loja?.name ?? "");
  const [address, setAddress] = useState(loja?.address ?? "");
  const [deliveryPhone, setDeliveryPhone] = useState(loja?.deliveryPhone ?? "");
  const [logo, setLogo] = useState(loja?.logo ?? "");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const criar = useCriarLoja(companyId);
  const atualizar = useAtualizarLoja(companyId);
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

    const analise = lojaSchema.safeParse({
      name,
      address,
      deliveryPhone,
      logo,
    });
    if (!analise.success) {
      setErros(errosPorCampo(analise.error));
      return;
    }
    setErros({});

    const dados = {
      name: analise.data.name,
      address: analise.data.address,
      deliveryPhone: analise.data.deliveryPhone?.trim()
        ? analise.data.deliveryPhone.trim()
        : null,
      logo: analise.data.logo?.trim() ? analise.data.logo.trim() : null,
    };

    try {
      if (editando && loja) {
        await atualizar.mutateAsync({ id: loja.id, ...dados });
        mostrar("sucesso", `Loja "${dados.name}" atualizada.`);
      } else {
        await criar.mutateAsync(dados);
        mostrar("sucesso", `Loja "${dados.name}" criada.`);
      }
      onFechar();
    } catch (err) {
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
      <Campo label="Nome da loja" erro={erros.name}>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            limpaErro("name");
          }}
          placeholder="Freguesia"
          disabled={salvando}
          autoFocus
        />
      </Campo>

      <Campo label="Endereço" erro={erros.address}>
        <Input
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            limpaErro("address");
          }}
          placeholder="Estrada do Bananal, 477"
          disabled={salvando}
        />
      </Campo>

      <Campo label="WhatsApp do delivery (opcional)" erro={erros.deliveryPhone}>
        <Input
          value={deliveryPhone}
          onChange={(e) => {
            setDeliveryPhone(e.target.value);
            limpaErro("deliveryPhone");
          }}
          placeholder="(21) 97384-7640"
          disabled={salvando}
        />
      </Campo>

      <Campo label="URL do logo da loja (opcional)" erro={erros.logo}>
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
        <Button type="submit" carregando={salvando}>
          {salvando ? "Salvando..." : editando ? "Salvar" : "Criar loja"}
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
