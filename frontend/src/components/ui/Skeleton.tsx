export function SkeletonLista({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Carregando conteúdo">
      <span className="sr-only">Carregando conteúdo...</span>
      {Array.from({ length: linhas }).map((_, i) => (
        <div
          key={i}
          className="flex h-[72px] animate-pulse items-center gap-3 rounded-2xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] px-4"
          aria-hidden="true"
        >
          <span className="h-10 w-10 rounded-xl bg-[rgb(var(--surface-subtle))]" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-2/5 rounded-full bg-[rgb(var(--surface-subtle))]" />
            <span className="block h-2.5 w-3/5 rounded-full bg-[rgb(var(--surface-subtle))]" />
          </span>
        </div>
      ))}
    </div>
  );
}
