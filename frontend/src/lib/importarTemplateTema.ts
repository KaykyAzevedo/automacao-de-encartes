import type { DiaSemana, ThemeCompleto } from "@/hooks/useThemes";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// Etapa 25: espelha uploadFotoProduto (lib/uploadFotoProduto.ts), mas
// manda ate 4 PNGs de uma vez (um por formato) - o backend monta o
// tema completo (formatos sem PNG proprio reaproveitam o mais
// proximo ja enviado).
export interface ArquivosTemplate {
  format1?: File | null;
  format4?: File | null;
  format8?: File | null;
  format10?: File | null;
}

export interface RespostaImportarTemplate {
  tema: ThemeCompleto;
  formatosComArtePropria: number[];
}

export async function importarTemplateTema(dados: {
  companyId: string;
  themeName: string;
  day: DiaSemana;
  arquivos: ArquivosTemplate;
}): Promise<RespostaImportarTemplate> {
  const form = new FormData();
  form.append("companyId", dados.companyId);
  form.append("themeName", dados.themeName);
  form.append("day", dados.day);

  for (const [campo, arquivo] of Object.entries(dados.arquivos)) {
    if (arquivo) form.append(campo, arquivo);
  }

  const res = await fetch(`${BASE}/api/themes/import-png`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  if (!res.ok) {
    const corpo = await res.json().catch(() => null);
    throw new Error(corpo?.error ?? `Erro ${res.status} ao importar template`);
  }

  return (await res.json()) as RespostaImportarTemplate;
}
