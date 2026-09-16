"use client";

import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const BASE =
  "w-full min-h-11 rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] px-3.5 py-2.5 text-sm text-[rgb(var(--foreground))] shadow-sm outline-none transition-all placeholder:text-neutral-400 hover:border-[rgb(var(--brand)/0.4)] focus:border-[rgb(var(--brand))] focus:ring-4 focus:ring-[rgb(var(--brand)/0.1)] disabled:cursor-not-allowed disabled:bg-[rgb(var(--surface-subtle))] disabled:opacity-60";

export function Campo({
  label,
  erro,
  children,
}: {
  label: string;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-neutral-600 dark:text-neutral-300">
        {label}
      </span>
      {children}
      {erro ? (
        <span className="mt-1 block text-xs text-red-600 dark:text-red-400">
          {erro}
        </span>
      ) : null}
    </label>
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${BASE} ${className}`} />;
}

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${BASE} ${className}`} />;
}
