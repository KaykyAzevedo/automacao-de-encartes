"use client";

import { signOut } from "next-auth/react";

export function SignOut({ callbackUrl = "/login" }: { callbackUrl?: string }) {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl })}
      className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      Sair
    </button>
  );
}
