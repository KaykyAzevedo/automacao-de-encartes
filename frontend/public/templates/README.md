# Templates de tema (PNG → SVG)

Pasta de espera para as artes dos próximos temas, em PNG. Estrutura já
pronta — assim que o PNG de um formato chegar, é só colocar no lugar
certo, sem precisar mexer em código.

## Onde colocar cada arquivo

```
templates/
├── tema-1/
│   ├── format-1.png   (1 item)
│   ├── format-4.png   (4 itens)
│   ├── format-8.png   (8 itens)
│   └── format-10.png  (10 itens)
└── tema-2/
    └── (mesma estrutura)
```

- **Dimensão recomendada**: 1080×1350 (o mesmo canvas 4:5 usado por todos os
  temas existentes — ver `frontend/src/lib/temas/base.ts`). Não precisa ser
  exato: o SVG gerado cobre o canvas inteiro com `preserveAspectRatio="xMidYMid
  slice"`, que recorta o excesso em vez de distorcer.
- **Formatos que faltam (2 e 6 itens)**: não fazem parte do pedido original,
  mas o `Theme` do banco exige as 6 artes (schema `criarThemeSchema`). Até
  chegar uma arte própria pra eles, o script/seed reaproveita a arte do
  formato mais próximo já enviado (ex.: format-2 usa format-1, format-6 usa
  format-4) — funciona, mas fica "esticado" pra mais itens do que a arte foi
  pensada. Troque assim que tiver a arte definitiva.

## Como transformar em tema de verdade

Duas formas, mesmo resultado (ver `docs/DEVELOPER_GUIDE.md` para detalhes):

1. **Script de linha de comando** — pré-visualiza o SVG gerado, sem tocar no
   banco:
   ```bash
   node scripts/convertPngToSvg.js tema-1 4
   # gera frontend/public/templates/tema-1/format-4.svg, pra conferir antes
   ```
2. **Seed do banco** — cria/atualiza o `Theme` de cada pasta que já tiver ao
   menos um PNG (pula silenciosamente a pasta que ainda estiver vazia):
   ```bash
   npm run db:seed -w backend
   ```
3. **Página de admin** (`/admin/import-themes`) — mesmo pipeline, mas pelo
   navegador: escolhe a empresa, sobe os PNGs na hora (não precisa ter
   colocado nesta pasta antes) e já salva o tema no banco.

Os placeholders usados no SVG gerado (`{{ITEM_1_FOTO}}`, `{{ITEM_1_NOME}}`,
`{{ITEM_1_PRECO}}`, `{{ITEM_1_UNIDADE}}`, um conjunto por item) seguem a
mesma convenção do resto do projeto (`frontend/src/lib/temas/render.ts`).
O posicionamento da grade é só um ponto de partida — depois de a arte de
verdade chegar, ajuste visualmente comparando com a referência (mesmo fluxo
usado para os outros temas: gerar, exportar, olhar lado a lado, repetir).
