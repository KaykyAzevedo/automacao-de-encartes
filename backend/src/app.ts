import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { join } from "node:path";
import { pinoHttp } from "pino-http";

import { env } from "./config/env";
import { logger } from "./lib/logger";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { limitadorGeral } from "./middlewares/rateLimiter";
import { routes } from "./routes";

export const app = express();

// um log estruturado (JSON em producao) por requisicao, com metodo,
// rota, status e duracao - sem isso, investigar um erro em producao
// dependeria de reproduzir o problema localmente.
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/api/health",
    },
  })
);

// credentials: true para o cookie de sessao do NextAuth chegar ao backend
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// protege as rotas de API de abuso/loop de cliente - arquivos
// estaticos servidos abaixo nao precisam desse limite
app.use("/api", limitadorGeral);

// arquivos enviados via /api/upload quando STORAGE_MODE=local
app.use("/uploads", express.static(join(__dirname, "..", "uploads")));

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);
