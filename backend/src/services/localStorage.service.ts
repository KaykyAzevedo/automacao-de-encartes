import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { env } from "../config/env";
import { nomeArquivoSeguro } from "../lib/arquivo";

const PASTA_UPLOADS = join(__dirname, "..", "..", "uploads");

export const localStorageService = {
  async salvar(buffer: Buffer, mimetype: string): Promise<string> {
    await mkdir(PASTA_UPLOADS, { recursive: true });
    const nome = nomeArquivoSeguro(mimetype);
    await writeFile(join(PASTA_UPLOADS, nome), buffer);
    // servido por express.static em app.ts, na rota /uploads
    return `${env.publicBaseUrl}/uploads/${nome}`;
  },
};
