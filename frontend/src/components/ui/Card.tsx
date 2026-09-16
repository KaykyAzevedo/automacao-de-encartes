export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-5 shadow-[0_12px_32px_-24px_rgb(24_65_45/0.35)] sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function SecaoVazia({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[rgb(var(--line))] bg-[rgb(var(--surface-subtle)/0.45)] px-5 py-10 text-center text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
      {children}
    </div>
  );
}

export function Erro({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
    >
      <span
        className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-500/15 text-xs font-bold"
        aria-hidden="true"
      >
        !
      </span>
      <span>{children}</span>
    </div>
  );
}
