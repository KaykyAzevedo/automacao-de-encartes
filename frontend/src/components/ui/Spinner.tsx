const TAMANHOS = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
} as const;

// Spinner puro CSS (sem dependencia externa) - herda a cor do texto
// via currentColor, entao funciona dentro de qualquer Button/estado
// sem precisar declarar uma cor propria.
export function Spinner({
  tamanho = "sm",
  className = "",
}: {
  tamanho?: keyof typeof TAMANHOS;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent align-[-2px] opacity-80 ${TAMANHOS[tamanho]} ${className}`}
    />
  );
}
