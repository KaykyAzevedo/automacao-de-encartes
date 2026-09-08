import multer from "multer";

import { MIME_PERMITIDOS, TAMANHO_MAXIMO_BYTES } from "../lib/arquivo";

// memoryStorage: o buffer vai direto para storageService, sem passar
// por um arquivo temporario em disco - tanto o modo local quanto o S3
// recebem o mesmo Buffer.
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANHO_MAXIMO_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    if (!MIME_PERMITIDOS[file.mimetype]) {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
      return;
    }
    cb(null, true);
  },
}).single("file");
