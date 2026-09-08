import { TEMAS_PROMOCAO_DO_DIA } from "@/lib/temas/promocaoDoDia";
import { renderizarTema } from "@/lib/temas/render";
import type {
  DadosEncarte,
  ItemEncarte,
  LojaEncarte,
  Tema,
} from "@/lib/temas/tipos";
import type { FormatoEncarte } from "@/types";

export interface EncartePreviewerProps {
  /** produtos a exibir; so os primeiros N (conforme o formato) sao usados */
  produtos: ItemEncarte[];
  /** qual tema usar; por enquanto so existe "Promoção do Dia" */
  temaId?: string;
  /** quantos produtos a grade comporta: 1, 2, 4, 6, 8 ou 10 */
  formato: FormatoEncarte;
  titulo?: string;
  subtitulo?: string;
  selo?: string[];
  lojas: LojaEncarte[];
  validade: string;
  className?: string;
}

const TEMAS_POR_ID = new Map(TEMAS_PROMOCAO_DO_DIA.map((t) => [t.id, t]));

function encontrarTema(
  formato: FormatoEncarte,
  temaId: string | undefined
): Tema | undefined {
  if (temaId) return TEMAS_POR_ID.get(temaId);
  return TEMAS_PROMOCAO_DO_DIA.find((t) => t.formato === formato);
}

// Renderizacao estatica do encarte: recebe os dados prontos e devolve
// o SVG do template preenchido. Sem estado, sem edicao - so troca o
// conteudo. O ajuste manual de tamanho de foto/nome/preco (previsto no
// MVP original) entra numa etapa futura, por cima deste componente.
export function EncartePreviewer({
  produtos,
  temaId,
  formato,
  titulo = "PROMOÇÃO",
  subtitulo = "DO DIA",
  selo = [],
  lojas,
  validade,
  className = "",
}: EncartePreviewerProps) {
  const tema = encontrarTema(formato, temaId);

  if (!tema) {
    return (
      <div
        className={`flex aspect-[4/5] items-center justify-center rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400 ${className}`}
      >
        Nenhum tema disponível para o formato de {formato} item(ns).
      </div>
    );
  }

  const dados: DadosEncarte = {
    titulo,
    subtitulo,
    selo,
    itens: produtos.slice(0, formato),
    lojas,
    validade,
  };

  const svg = renderizarTema(tema, dados);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-neutral-200 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full dark:border-neutral-800 ${className}`}
      // o svg vem do template do proprio repositorio; os dados passam
      // por escape em renderizarTema antes de entrar no markup
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
