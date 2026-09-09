import { buscarCorrespondencias } from "../services/productMatchService";

// Lista de produtos de exemplo, no mesmo formato usado pelo servico
// real (o campo "busca" e recalculado internamente, entao pode ficar
// vazio aqui).
const produtos = [
  {
    id: "1",
    name: "Agrião",
    photoS3Url: "/banco-fotos/agriao.png",
    userPhotos: [],
    busca: "",
  },
  {
    id: "2",
    name: "Alface Crespa",
    photoS3Url: "/banco-fotos/alface.png",
    userPhotos: [],
    busca: "",
  },
  {
    id: "3",
    name: "Brócolis Comum",
    photoS3Url: "/banco-fotos/brocolis-comum.png",
    userPhotos: [],
    busca: "",
  },
  {
    id: "4",
    name: "Brócolis Americano",
    photoS3Url: "/banco-fotos/brocolis-americano.png",
    userPhotos: [],
    busca: "",
  },
];

describe("buscarCorrespondencias (fuzzy matching)", () => {
  it('"agriao" (sem acento) encontra "Agrião" como match exato', () => {
    const { exactMatch, suggestions } = buscarCorrespondencias(
      produtos,
      "agriao"
    );

    expect(exactMatch).not.toBeNull();
    expect(exactMatch?.product.name).toBe("Agrião");
    expect(exactMatch?.confidence).toBeGreaterThanOrEqual(0.85);
    expect(suggestions).toHaveLength(0);
  });

  it('"xxx" não bate com nada e retorna apenas sugestões (ou nenhuma)', () => {
    const { exactMatch, suggestions } = buscarCorrespondencias(produtos, "xxx");

    expect(exactMatch).toBeNull();
    // fuse pode nao achar nenhum candidato com esse limiar - o
    // importante e nunca "inventar" um match exato para algo aleatorio
    expect(suggestions.every((s) => s.confidence < 0.85)).toBe(true);
  });

  it("string vazia retorna vazio (sem match e sem sugestões)", () => {
    const { exactMatch, suggestions } = buscarCorrespondencias(produtos, "");

    expect(exactMatch).toBeNull();
    expect(suggestions).toHaveLength(0);
  });

  it("string só com espaços também retorna vazio", () => {
    const { exactMatch, suggestions } = buscarCorrespondencias(produtos, "   ");

    expect(exactMatch).toBeNull();
    expect(suggestions).toHaveLength(0);
  });

  it("lista de produtos vazia nunca dá match", () => {
    const { exactMatch, suggestions } = buscarCorrespondencias([], "agriao");

    expect(exactMatch).toBeNull();
    expect(suggestions).toHaveLength(0);
  });

  it('nomes ambíguos ("brocolis") caem em sugestões, não em match automático', () => {
    const { exactMatch, suggestions } = buscarCorrespondencias(
      produtos,
      "brocolis"
    );

    expect(exactMatch).toBeNull();
    expect(suggestions.length).toBeGreaterThanOrEqual(2);
    const nomes = suggestions.map((s) => s.product.name);
    expect(nomes).toEqual(
      expect.arrayContaining(["Brócolis Comum", "Brócolis Americano"])
    );
  });
});
