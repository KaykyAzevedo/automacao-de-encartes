import { env } from "../config/env";
import { localStorageService } from "./localStorage.service";
import { uploadToS3 } from "./s3Service";

// Ponto unico de upload: troca entre disco local e S3 pela mesma
// variavel STORAGE_MODE que o resto do backend ja usa (mesmo padrao
// do AUTH_MODE, para o modo local nao exigir nenhuma conta externa).
export const storageService = {
  async salvar(buffer: Buffer, mimetype: string): Promise<string> {
    if (env.modoStorage === "s3") {
      return uploadToS3(buffer, mimetype, "uploads");
    }
    return localStorageService.salvar(buffer, mimetype);
  },
};
