import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getUsuarioAtual } from "@/lib/session";

export default async function DashboardPage() {
  const user = (await getUsuarioAtual())!;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Bem-vindo, {user.name ?? user.email}.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold">Usuário logado</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500 dark:text-neutral-400">Nome</dt>
              <dd className="truncate">{user.name ?? "(sem nome)"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500 dark:text-neutral-400">E-mail</dt>
              <dd className="truncate">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500 dark:text-neutral-400">ID</dt>
              <dd className="truncate font-mono text-xs">{user.id}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">Primeiros passos</h2>
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            Antes de gerar encartes, cadastre a empresa e as lojas.
          </p>
          <Link
            href="/preparation"
            className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
          >
            Ir para Preparação
          </Link>
        </Card>
      </div>
    </div>
  );
}
