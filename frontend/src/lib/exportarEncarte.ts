import { getFontEmbedCSS, toCanvas } from "html-to-image";

export type FormatoArquivo = "png" | "jpeg";

export interface ResolucaoExport {
  largura: number;
  altura: number;
  rotulo: string;
}

export const RESOLUCOES: ResolucaoExport[] = [
  { largura: 1080, altura: 1350, rotulo: "Feed (1080x1350 · post Instagram)" },
  { largura: 1080, altura: 1920, rotulo: "Stories (1080x1920)" },
];

// Mesmo tom do fundo do tema (radial escuro), usado nas bordas quando
// a resolucao pedida nao bate com a proporcao nativa do template.
const FUNDO = "#050505";

// Tempo maximo tolerado para o html-to-image rasterizar o elemento.
// Sem isso, uma falha silenciosa (imagem/fonte que nunca resolve) deixa
// o botao girando "Gerando..." pra sempre sem nenhum erro visivel.
const TIMEOUT_MS = 15000;

function comTimeout<T>(promessa: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Tempo esgotado (${ms}ms) ao gerar a imagem`)),
      ms
    );
    promessa.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

// Largura nativa do template (viewBox do SVG, ex.: 1080). Usada so para
// calcular o pixelRatio - forcar width/height/canvasWidth/canvasHeight
// direto no html-to-image mostrou-se instavel (hangs e escalas erradas
// em chamadas repetidas), entao deixamos a lib capturar o elemento no
// tamanho CSS normal e so pedimos mais resolucao via pixelRatio.
function larguraNativa(elemento: HTMLElement): number {
  const svg = elemento.querySelector("svg");
  return Number(svg?.getAttribute("width")) || elemento.offsetWidth;
}

// Rasteriza o elemento (o encarte tal como esta na tela) num canvas,
// direto no navegador - sem Puppeteer, sem round-trip ao servidor.
// html-to-image cuida de inlinar as fotos e as fontes do Google Fonts
// que a pagina ja carregou.
export async function exportarEncarte(
  elemento: HTMLElement,
  resolucao: ResolucaoExport,
  formato: FormatoArquivo
): Promise<Blob> {
  const nativa = larguraNativa(elemento);
  const pixelRatio =
    elemento.offsetWidth > 0 ? nativa / elemento.offsetWidth : 1;

  // Gerar o CSS das fontes A PARTE (em vez de deixar o toCanvas
  // detectar sozinho) evita uma falha silenciosa observada no tema com
  // imagem de fundo grande (8 itens "classico"): o download saia com
  // uma fonte generica do sistema em vez da fonte certa, mesmo com a
  // pre-visualizacao na tela correta. Calculando antes, como um passo
  // proprio, o html-to-image nao precisa competir a deteccao de fontes
  // com o trabalho de embutir uma imagem de fundo grande na mesma
  // chamada.
  const fontEmbedCSS = await comTimeout(getFontEmbedCSS(elemento), TIMEOUT_MS);

  const canvasOrigem = await comTimeout(
    toCanvas(elemento, {
      pixelRatio,
      backgroundColor: FUNDO,
      fontEmbedCSS,
    }),
    TIMEOUT_MS
  );

  const canvasFinal = compor(canvasOrigem, resolucao);

  return new Promise((resolve, reject) => {
    canvasFinal.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Falha ao gerar o arquivo")),
      formato === "png" ? "image/png" : "image/jpeg",
      0.92
    );
  });
}

// Encaixa a rasterizacao (que pode sair com um arredondamento de 1-2px
// em relacao ao tamanho nativo) na resolucao pedida: escala pela LARGURA
// (o template e sempre full-bleed horizontalmente) e centraliza
// verticalmente. Para "Feed" isso reproduz o template quase 1:1; para
// "Stories" sobra espaco vertical, preenchido com o mesmo tom de fundo
// do tema em vez de esticar ou cortar o conteudo real (redesenhar o
// layout para 9:16 e trabalho futuro, nao desta etapa).
function compor(
  origem: HTMLCanvasElement,
  resolucao: ResolucaoExport
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = resolucao.largura;
  canvas.height = resolucao.altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Este navegador não suporta canvas");

  ctx.fillStyle = FUNDO;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const escala = resolucao.largura / origem.width;
  const alturaDesenhada = origem.height * escala;
  const y = (canvas.height - alturaDesenhada) / 2;
  ctx.drawImage(origem, 0, y, resolucao.largura, alturaDesenhada);
  return canvas;
}

export function baixarBlob(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
