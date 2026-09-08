import { EXEMPLO_PROMOCAO_DO_DIA } from "@/lib/temas/exemplo";
import { PROMOCAO_DO_DIA_2 } from "@/lib/temas/promocaoDoDia2";
import { renderizarTema } from "@/lib/temas/render";

// Visualizacao isolada do encarte, sem header nem sidebar.
// Serve para conferir o resultado no tamanho real e para capturar.
export default function PreviewPage() {
  const svg = renderizarTema(PROMOCAO_DO_DIA_2, EXEMPLO_PROMOCAO_DO_DIA);

  return (
    <div
      className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
