import { exemploCom } from "@/lib/temas/exemplo";
import { TEMAS_PROMOCAO_DO_DIA } from "@/lib/temas/promocaoDoDia";
import { renderizarTema } from "@/lib/temas/render";

// Visualizacao isolada, sem header nem sidebar, para conferir o
// encarte no tamanho real. ?formato=1|2|4|6|8
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ formato?: string }>;
}) {
  const { formato } = await searchParams;
  const tema =
    TEMAS_PROMOCAO_DO_DIA.find((t) => String(t.formato) === formato) ??
    TEMAS_PROMOCAO_DO_DIA[1];

  return (
    <div
      className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
      dangerouslySetInnerHTML={{
        __html: renderizarTema(tema, exemploCom(tema.formato)),
      }}
    />
  );
}
