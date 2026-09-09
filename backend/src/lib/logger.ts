import pino from "pino";

import { env } from "../config/env";

// "pretty" so quando rodando local no terminal (dev); em producao (e
// nos testes, pra nao abrir worker thread do pino-pretty no jest) sai
// JSON puro de linha unica - o formato que ferramentas de log
// estruturado (Datadog, CloudWatch, etc) esperam.
export const logger = pino({
  level:
    process.env.LOG_LEVEL ?? (env.nodeEnv === "development" ? "debug" : "info"),
  transport:
    env.nodeEnv === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});
