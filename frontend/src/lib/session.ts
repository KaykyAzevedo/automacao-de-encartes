import { getServerSession } from "next-auth";

import { authOptions } from "./auth";
import { prisma } from "./prisma";

export const MODO_AUTH =
  process.env.AUTH_MODE === "google" ? "google" : "local";

const EMAIL_LOCAL = process.env.LOCAL_USER_EMAIL ?? "local@encarte.local";

export interface UsuarioAtual {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

// No modo local nao existe login: o app opera como um usuario fixo,
// criado sob demanda. Todo o resto do sistema continua igual, porque
// empresas, lojas e produtos seguem tendo dono.
export async function getUsuarioAtual(): Promise<UsuarioAtual | null> {
  if (MODO_AUTH === "local") {
    const user = await prisma.user.upsert({
      where: { email: EMAIL_LOCAL },
      update: {},
      create: { email: EMAIL_LOCAL, name: "Usuário local" },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    };
  }

  const session = await getServerSession(authOptions);
  if (!session) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };
}
