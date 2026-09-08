export function SkeletonLista({ linhas = 3 }: { linhas?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: linhas }).map((_, i) => (
        <div
          key={i}
          className="h-[62px] animate-pulse rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
        />
      ))}
    </div>
  );
}
