import { redirect } from "next/navigation";

import { Header } from "@/components/layout/Header";
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
        <div className="flex min-h-screen flex-col">
          <Header
            nome={usuario.name}
            email={usuario.email}
            imagem={usuario.image}
            mostrarLogout={MODO_AUTH === "google"}
          />
          <div className="flex flex-1 flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
          </div>
        </div>
      </ToastProvider>
    </QueryProvider>
  );
}
