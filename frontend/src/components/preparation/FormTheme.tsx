"use client";

// Placeholder: os temas dependem do upload dos SVGs (4 por tema,
// para os formatos de 1, 4, 8 e 10 itens), que entra numa etapa futura.
export function FormTheme() {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 p-5 dark:border-neutral-700">
      <p className="text-sm font-medium">Upload de temas</p>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        Cada tema precisa de 4 arquivos SVG, um para cada formato de encarte: 1,
        4, 8 e 10 itens. Os temas costumam ser nomeados por dia da semana (ex.:
        &ldquo;Quartou&rdquo;, &ldquo;Promoção do Dia&rdquo;).
      </p>
      <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
        Disponível em breve.
      </p>
    </div>
  );
}
