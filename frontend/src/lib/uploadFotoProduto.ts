import type { Product } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// Etapa 21: igual uploadArquivo (lib/upload.ts), mas manda o productId
// junto no mesmo form e ja devolve o produto atualizado (com o novo
// item em userPhotos) - nao precisa de uma segunda chamada pra
// associar a foto ao produto.
export async function uploadFotoProduto(
  productId: string,
  file: File
): Promise<Product> {
  const form = new FormData();
  form.append("productId", productId);
  form.append("file", file);

  const res = await fetch(`${BASE}/api/products/upload-photo`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  if (!res.ok) {
    const corpo = await res.json().catch(() => null);
    throw new Error(corpo?.error ?? `Erro ${res.status} ao enviar foto`);
  }

  return (await res.json()) as Product;
}
