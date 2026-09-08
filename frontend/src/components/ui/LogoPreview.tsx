"use client";

import { useEffect, useState } from "react";

// <img> em vez de next/image de proposito: a URL vem do usuario e
// pode ser de qualquer dominio, e o next/image exige que os dominios
// estejam declarados no next.config. Liberar "**" faria o otimizador
// buscar qualquer endereco que alguem colar.
export function LogoPreview({ url, alt = "" }: { url: string; alt?: string }) {
  const [falhou, setFalhou] = useState(false);

  // sem isto, uma URL que falhou deixaria a previa escondida para
  // sempre, mesmo depois de o usuario corrigir o endereco
  useEffect(() => setFalhou(false), [url]);

  if (!url || falhou) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      onError={() => setFalhou(true)}
      className="h-10 w-10 shrink-0 rounded border border-neutral-200 object-contain dark:border-neutral-800"
    />
  );
}
