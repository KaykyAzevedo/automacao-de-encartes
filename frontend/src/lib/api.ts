const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export interface DetalheErro {
  campo: string;
  mensagem: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: DetalheErro[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    // o cookie de sessao do NextAuth vive em localhost:3000; como o
    // dominio e o mesmo, ele chega ao backend na 5000 com o include
    credentials: "include",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });

  if (!res.ok) {
    const corpo = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      corpo?.error ?? `Erro ${res.status}`,
      corpo?.details
    );
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
