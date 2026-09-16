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
  // Etapa 28: lista de numeros em vez de um so. Sempre comeca com pelo
  // menos uma linha (vazia se a loja ainda nao tem nenhum numero) pra
  // o botao de "+ Adicionar numero" nao ser a unica forma de ver o
  // campo.
  const [phones, setPhones] = useState<string[]>(
    loja?.deliveryPhones.length ? loja.deliveryPhones : [""]
  );
  const [logo, setLogo] = useState(loja?.logo ?? "");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const MAX_TELEFONES = 5;

  function alterarTelefone(indice: number, valor: string) {
    setPhones((atual) => atual.map((p, i) => (i === indice ? valor : p)));
    // erro de validacao por item vem como "deliveryPhones.0", "...1"
    // etc (path do zod) - limpa qualquer um deles, nao so a chave exata
    setErros((atual) => {
      const chaves = Object.keys(atual).filter((k) =>
        k.startsWith("deliveryPhones")
      );
      if (chaves.length === 0) return atual;
      const copia = { ...atual };
      chaves.forEach((k) => delete copia[k]);
      return copia;
    });
  }

  function removerTelefone(indice: number) {
    setPhones((atual) => atual.filter((_, i) => i !== indice));
  }

  function adicionarTelefone() {
    setPhones((atual) => [...atual, ""]);
  }

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

    // linhas vazias (o "+ Adicionar numero" sem preencher) nao contam
    // como numero de verdade - filtra antes de validar
    const telefonesPreenchidos = phones.map((p) => p.trim()).filter(Boolean);

    const analise = lojaSchema.safeParse({
      name,
      address,
      deliveryPhones: telefonesPreenchidos,
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
      deliveryPhones: analise.data.deliveryPhones,
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

      <Campo
        label="Números de contato (opcional)"
        erro={
          Object.entries(erros).find(([k]) =>
            k.startsWith("deliveryPhones")
          )?.[1]
        }
      >
        <div className="space-y-2">
          {phones.map((telefone, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={telefone}
                onChange={(e) => alterarTelefone(i, e.target.value)}
                placeholder="(21) 97384-7640"
                disabled={salvando}
              />
              <Button
                type="button"
                variante="fantasma"
                className="shrink-0 px-2"
                disabled={salvando}
                onClick={() => removerTelefone(i)}
                aria-label="Remover este número"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
        {phones.length < MAX_TELEFONES ? (
          <Button
            type="button"
            variante="secundario"
            className="mt-2 px-3 py-1.5 text-xs"
            disabled={salvando}
            onClick={adicionarTelefone}
          >
            + Adicionar número
          </Button>
        ) : null}
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
