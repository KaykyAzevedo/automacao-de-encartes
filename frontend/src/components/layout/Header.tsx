import Image from "next/image";

import { SignOut } from "@/components/auth/SignOut";

export function Header({
  nome,
  email,
  imagem,
  mostrarLogout = true,
}: {
  nome: string | null | undefined;
  email: string | null | undefined;
  imagem: string | null | undefined;
  mostrarLogout?: boolean;
}) {
  const iniciais = (nome ?? email ?? "EG")
    .split(/\s+/)
    .map((parte) => parte[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-[4.5rem] items-center justify-between gap-4 border-b border-[rgb(var(--line)/0.8)] bg-[rgb(var(--surface)/0.9)] px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--brand))] text-white shadow-[0_8px_22px_-10px_rgb(var(--brand))] dark:text-neutral-950">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M6 3h9l4 4v14H6z" />
            <path d="M14 3v5h5M9 13h6M9 17h4" />
            <path d="m16.5 14.5 1 1 2-2" />
          </svg>
        </span>
        <span>
          <span className="block text-sm font-bold tracking-[-0.02em] text-[rgb(var(--foreground))] sm:text-base">
            Encarte Gerador
          </span>
          <span className="hidden text-[11px] font-medium text-neutral-400 sm:block">
            Estúdio de ofertas
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right lg:block">
          <p className="text-xs font-semibold leading-tight">{nome ?? email}</p>
          <p className="mt-0.5 text-[11px] leading-tight text-neutral-400">
            {email}
          </p>
        </div>
        {imagem ? (
          <Image
            src={imagem}
            alt=""
            width={32}
            height={32}
            className="h-9 w-9 rounded-xl border border-[rgb(var(--line))] object-cover"
          />
        ) : (
          <span
            className="grid h-9 w-9 place-items-center rounded-xl bg-[rgb(var(--accent-soft))] text-xs font-bold text-[rgb(var(--accent))]"
            aria-label={nome ?? email ?? "Usuario"}
          >
            {iniciais}
          </span>
        )}
        {mostrarLogout ? <SignOut /> : null}
      </div>
    </header>
  );
}
