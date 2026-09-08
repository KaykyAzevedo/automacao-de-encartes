import {
  construirTemasPromocaoDoDia,
  ESCALA_PADRAO,
  TEMAS_PROMOCAO_DO_DIA,
  type EscalasTema,
} from "@/lib/temas/promocaoDoDia";
import { renderizarTema } from "@/lib/temas/render";
import type {
  DadosEncarte,
  ItemEncarte,
  LojaEncarte,
  Tema,
} from "@/lib/temas/tipos";
import type { FormatoEncarte } from "@/types";

export type { EscalasTema } from "@/lib/temas/promocaoDoDia";

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
  /** 0.5 a 1.5 (50% a 150%): tamanho de foto/nome/preco (Etapa 18) */
  escalas?: EscalasTema;
  className?: string;
}

const TEMAS_POR_ID_PADRAO = new Map(
  TEMAS_PROMOCAO_DO_DIA.map((t) => [t.id, t])
);

function encontrarTema(
  formato: FormatoEncarte,
  temaId: string | undefined,
  escalas: EscalasTema
): Tema | undefined {
  // sem escala customizada: usa o array pronto, sem reconstruir nada
  const foiCustomizado =
    escalas.foto !== 1 || escalas.nome !== 1 || escalas.preco !== 1;

  const lista = foiCustomizado
    ? construirTemasPromocaoDoDia(escalas)
    : TEMAS_PROMOCAO_DO_DIA;

  if (temaId) {
    if (!foiCustomizado) return TEMAS_POR_ID_PADRAO.get(temaId);
    return lista.find((t) => t.id === temaId);
  }
  return lista.find((t) => t.formato === formato);
}

// Renderizacao do encarte: recebe os dados prontos (e opcionalmente as
// escalas de foto/nome/preco) e devolve o SVG do template preenchido.
// Componente puro (sem hooks) de proposito: e usado tanto em Server
// Components (/temas) quanto em paginas client (/generate-encarte).
export function EncartePreviewer({
  produtos,
  temaId,
  formato,
  titulo = "PROMOÇÃO",
  subtitulo = "DO DIA",
  selo = [],
  lojas,
  validade,
  escalas = ESCALA_PADRAO,
  className = "",
}: EncartePreviewerProps) {
  const tema = encontrarTema(formato, temaId, escalas);

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
