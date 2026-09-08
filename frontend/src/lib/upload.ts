const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// Fora do cliente generico de src/lib/api.ts de proposito: aquele
// sempre serializa o corpo como JSON, e upload precisa de
// multipart/form-data (o navegador define o boundary sozinho quando
// o body e um FormData, entao nao se define Content-Type na mao).
export async function uploadArquivo(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/api/upload`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  if (!res.ok) {
    const corpo = await res.json().catch(() => null);
    throw new Error(corpo?.error ?? `Erro ${res.status} ao enviar arquivo`);
  }

  const dados = (await res.json()) as { url: string };
  return dados.url;
}
