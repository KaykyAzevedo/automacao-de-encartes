import { redirect } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { getUsuarioAtual, MODO_AUTH } from "@/lib/session";

// Shell das telas internas. Fica num route group para o /login
// continuar sem header e sem sidebar.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  return (
    <QueryProvider>
      <ToastProvider>
        <div className="min-h-screen">
          <a
            href="#conteudo-principal"
            className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-xl bg-[rgb(var(--brand))] px-4 py-2 text-sm font-semibold text-white shadow-lg transition focus:translate-y-0 dark:text-neutral-950"
          >
            Pular para o conteúdo
          </a>
          <Header
            nome={usuario.name}
            email={usuario.email}
            imagem={usuario.image}
            mostrarLogout={MODO_AUTH === "google"}
          />
          <div className="flex min-h-[calc(100vh-4.5rem)]">
            <Sidebar />
            <main
              id="conteudo-principal"
              tabIndex={-1}
              className="min-w-0 flex-1 px-4 pb-28 pt-7 sm:px-6 md:px-8 md:pb-10 md:pt-9 lg:px-10"
            >
              {children}
            </main>
          </div>
          <MobileNavigation />
        </div>
      </ToastProvider>
    </QueryProvider>
  );
}
