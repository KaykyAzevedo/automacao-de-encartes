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
      ? "border-emerald-500/30 bg-emerald-950/95 text-emerald-50"
      : "border-red-500/30 bg-red-950/95 text-red-50";

  return (
    <div
      role={toast.tipo === "erro" ? "alert" : "status"}
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm shadow-2xl backdrop-blur-xl ${cor}`}
    >
      <span
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold"
        aria-hidden="true"
      >
        {toast.tipo === "sucesso" ? "✓" : "!"}
      </span>
      <span className="flex-1">{toast.mensagem}</span>
      <button
        type="button"
        onClick={aoFechar}
        aria-label="Fechar aviso"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-lg opacity-60 transition hover:bg-white/10 hover:opacity-100"
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
        className="pointer-events-none fixed bottom-24 right-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2 md:bottom-4"
      >
        {toasts.map((t) => (
          <Item key={t.id} toast={t} aoFechar={() => remover(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
