import { redirect } from "next/navigation";

import { SignIn } from "@/components/auth/SignIn";
import { getUsuarioAtual, MODO_AUTH } from "@/lib/session";

export default async function LoginPage() {
  // no modo local nao ha o que logar
  if (MODO_AUTH === "local") redirect("/dashboard");

  const usuario = await getUsuarioAtual();
  if (usuario) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 p-8 dark:border-neutral-800">
        <h1 className="text-xl font-semibold">Encarte Gerador</h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Entre para montar seus encartes.
        </p>

        <div className="mt-8">
          <SignIn />
        </div>
      </div>
    </main>
  );
}
