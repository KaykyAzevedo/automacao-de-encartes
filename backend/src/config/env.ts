import "dotenv/config";

// "local": nao exige login, tudo roda como um usuario local fixo.
// "google": exige sessao do NextAuth (o modo definitivo).
const modoAuth = process.env.AUTH_MODE === "google" ? "google" : "local";

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  modoAuth,
  emailUsuarioLocal: process.env.LOCAL_USER_EMAIL ?? "local@encarte.local",
};
