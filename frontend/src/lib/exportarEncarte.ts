import { toCanvas } from "html-to-image";

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
// Exportado pra /temas/editor conseguir simular a mesma letterbox no
// preview "Stories" sem duplicar a cor.
export const FUNDO = "#050505";

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

// html-to-image's getFontEmbedCSS() so detecta fontes "em uso"
// percorrendo filhos que sao HTMLElement - qualquer texto dentro do
// <svg> do tema (ex.: o preco, que usa uma fonte so ali) fica invisivel
// pra essa deteccao e nunca e embutido, saindo no PNG final com uma
// fonte generica do sistema mesmo com a pre-visualizacao correta na
// tela. Corrigimos isso fazendo nossa propria varredura (que cobre
// SVGElement, nao so HTMLElement) pra achar as familias realmente em
// uso dentro do elemento exportado, e embutindo so as @font-face
// correspondentes - embutir as ~60 regras do documento inteiro (todas
// as fontes/pesos carregados no app) gera um CSS multi-megabyte que
// trava o carregamento da imagem final via data URI.
function familiasEmUso(elemento: HTMLElement): Set<string> {
  const familias = new Set<string>();
  const todos = [elemento, ...Array.from(elemento.querySelectorAll("*"))];
  for (const no of todos) {
    const fontFamily = getComputedStyle(no).fontFamily;
    fontFamily
      .split(",")
      .forEach((f) => familias.add(f.trim().replace(/["']/g, "")));
  }
  return familias;
}

async function construirFontEmbedCSS(elemento: HTMLElement): Promise<string> {
  const usadas = familiasEmUso(elemento);
  const regras: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let cssRules: CSSRuleList | null = null;
    try {
      cssRules = sheet.cssRules;
    } catch {
      continue;
    }
    if (!cssRules) continue;
    for (const rule of Array.from(cssRules)) {
      if (
        rule instanceof CSSFontFaceRule &&
        usadas.has(
          rule.style.getPropertyValue("font-family").trim().replace(/["']/g, "")
        )
      ) {
        regras.push(rule.cssText);
      }
    }
  }

  const regexUrl = /url\(["']?([^"')]+)["']?\)/g;
  const comFontesEmbutidas = await Promise.all(
    regras.map(async (cssText) => {
      const urls = Array.from(cssText.matchAll(regexUrl)).map((m) => m[1]);
      let resultado = cssText;
      for (const url of urls) {
        if (url.startsWith("data:")) continue;
        try {
          const absoluta = new URL(url, window.location.href).href;
          const resposta = await fetch(absoluta);
          const blob = await resposta.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const leitor = new FileReader();
            leitor.onload = () => resolve(leitor.result as string);
            leitor.onerror = () => reject(leitor.error);
            leitor.readAsDataURL(blob);
          });
          resultado = resultado.replace(url, dataUrl);
        } catch {
          // se uma fonte especifica falhar ao baixar, segue sem ela em
          // vez de derrubar a exportacao inteira
        }
      }
      return resultado;
    })
  );

  return comFontesEmbutidas.join("\n");
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

  const fontEmbedCSS = await comTimeout(
    construirFontEmbedCSS(elemento),
    TIMEOUT_MS
  );

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
