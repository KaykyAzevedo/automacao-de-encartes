import "dotenv/config";

// "local": nao exige login, tudo roda como um usuario local fixo.
// "google": exige sessao do NextAuth (o modo definitivo).
const modoAuth = process.env.AUTH_MODE === "google" ? "google" : "local";

// "local": upload de foto salva em disco, servido pelo proprio backend.
// "s3": envia para o bucket AWS configurado abaixo.
const modoStorage = process.env.STORAGE_MODE === "s3" ? "s3" : "local";

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  modoAuth,
  emailUsuarioLocal: process.env.LOCAL_USER_EMAIL ?? "local@encarte.local",

  modoStorage,
  // URL publica deste backend, usada para montar o link do arquivo
  // quando STORAGE_MODE=local
  publicBaseUrl:
    process.env.PUBLIC_BASE_URL ??
    `http://localhost:${process.env.PORT ?? 5000}`,

  aws: {
    region: process.env.AWS_REGION ?? "",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    bucket: process.env.AWS_S3_BUCKET ?? "",
  },
};
