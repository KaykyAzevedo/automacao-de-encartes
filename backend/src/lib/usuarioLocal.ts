import { env } from "../config/env";
import { prisma } from "./prisma";

// No modo local nao ha login: todo o app opera como este usuario.
// Ele e criado na primeira requisicao e reaproveitado depois, para
// que empresas, lojas e produtos continuem tendo dono - o modelo de
// dados inteiro depende disso.
export function usuarioLocal() {
  return prisma.user.upsert({
    where: { email: env.emailUsuarioLocal },
    update: {},
    create: { email: env.emailUsuarioLocal, name: "Usuário local" },
  });
}
