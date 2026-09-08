import { redirect } from "next/navigation";

import { getUsuarioAtual } from "@/lib/session";

export default async function Home() {
  const usuario = await getUsuarioAtual();
  redirect(usuario ? "/dashboard" : "/login");
}
