"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Tipo = "sucesso" | "erro";

interface Toast {
  id: number;
  tipo: Tipo;
  mensagem: string;
}

const ToastContext = createContext<{
  mostrar: (tipo: Tipo, mensagem: string) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de ToastProvider");
  return ctx;
}

const DURACAO = 4000;

function Item({ toast, aoFechar }: { toast: Toast; aoFechar: () => void }) {
  useEffect(() => {
    const t = setTimeout(aoFechar, DURACAO);
    return () => clearTimeout(t);
  }, [aoFechar]);

  const cor =
    toast.tipo === "sucesso"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
      : "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200";

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${cor}`}
    >
      <span className="flex-1">{toast.mensagem}</span>
      <button
        type="button"
        onClick={aoFechar}
        aria-label="Fechar aviso"
        className="shrink-0 opacity-60 transition hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const mostrar = useCallback((tipo: Tipo, mensagem: string) => {
    setToasts((atual) => [
      ...atual,
      { id: Date.now() + Math.random(), tipo, mensagem },
    ]);
  }, []);

  const remover = useCallback((id: number) => {
    setToasts((atual) => atual.filter((t) => t.id !== id));
  }, []);

  const valor = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
      >
        {toasts.map((t) => (
          <Item key={t.id} toast={t} aoFechar={() => remover(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
