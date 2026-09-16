import { EncartePreviewer } from "@/components/encarte/EncartePreviewer";
import { exemploCom } from "@/lib/temas/exemplo";
import { TEMAS_PROMOCAO_DO_DIA } from "@/lib/temas/promocaoDoDia";

// Visualizacao isolada, sem header nem sidebar, para conferir o
// encarte no tamanho real. ?formato=1|2|4|6|8|10 (Etapa 27: foco
// exclusivo em 8 itens - o param continua aceito pra debug interno,
// mas o padrao agora e sempre o de 8, ja que e o unico oferecido na
// galeria).
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ formato?: string }>;
}) {
  const { formato } = await searchParams;
  const temaPadrao = TEMAS_PROMOCAO_DO_DIA.find((t) => t.formato === 8)!;
  const tema =
    TEMAS_PROMOCAO_DO_DIA.find((t) => String(t.formato) === formato) ??
    temaPadrao;
  const { itens, ...dados } = exemploCom(tema.formato);

  return (
    <EncartePreviewer
      produtos={itens}
      formato={tema.formato as 1 | 2 | 4 | 6 | 8 | 10}
      {...dados}
    />
  );
}
