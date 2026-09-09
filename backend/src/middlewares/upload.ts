import multer from "multer";

import { MIME_PERMITIDOS, TAMANHO_MAXIMO_BYTES } from "../lib/arquivo";

function filtroDeImagem(
  _req: unknown,
  file: Express.Multer.File,
  cb: (erro: Error | null, aceitar?: boolean) => void
) {
  if (!MIME_PERMITIDOS[file.mimetype]) {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    return;
  }
  cb(null, true);
}

// memoryStorage: o buffer vai direto para storageService, sem passar
// por um arquivo temporario em disco - tanto o modo local quanto o S3
// recebem o mesmo Buffer.
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO_BYTES, files: 1 },
  fileFilter: filtroDeImagem,
}).single("file");

// Etapa 25: import de template de tema - ate 4 PNGs num request so
// (um por formato), cada um em seu proprio campo. Todos opcionais no
// multer (quem decide o que e obrigatorio e o controller, pois pelo
// menos 1 formato precisa vir).
export const uploadTemplatesMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO_BYTES, files: 4 },
  fileFilter: filtroDeImagem,
}).fields([
  { name: "format1", maxCount: 1 },
  { name: "format4", maxCount: 1 },
  { name: "format8", maxCount: 1 },
  { name: "format10", maxCount: 1 },
]);
