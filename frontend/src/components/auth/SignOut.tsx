"use client";

import { signOut } from "next-auth/react";

export function SignOut({ callbackUrl = "/login" }: { callbackUrl?: string }) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl })}
      className="hidden min-h-10 rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-[rgb(var(--brand)/0.4)] hover:text-[rgb(var(--brand))] sm:inline-flex sm:items-center"
    >
      Sair
    </button>
  );
}
