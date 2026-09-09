import rateLimit from "express-rate-limit";

// Limite geral: generoso o bastante pro uso normal do app (varias
// telas fazendo fetch em sequencia), mas corta um cliente com bug em
// loop ou um scraper batendo sem parar.
export const limitadorGeral = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Tente novamente em alguns minutos." },
});

// Upload de foto/tema e mais custoso (processa arquivo, grava em
// disco/S3) - limite mais apertado que o geral pra essa rota especifica.
export const limitadorUpload = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitos envios de arquivo. Tente novamente em alguns minutos.",
  },
});
