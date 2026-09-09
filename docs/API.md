# API — Encarte Gerador

Backend Express + TypeScript. Base URL local: `http://localhost:5000` (porta
definida por `PORT` no `backend/.env`).

## Autenticação

Toda rota sob `/api` (exceto `/health`) passa pelo middleware `requireAuth`,
que se comporta de dois jeitos conforme `AUTH_MODE`:

- **`local`** (padrão): não exige nada. Todo request é tratado como o mesmo
  usuário local fixo (`LOCAL_USER_EMAIL`).
- **`google`**: exige o cookie de sessão do NextAuth
  (`next-auth.session-token` ou `__Secure-next-auth.session-token`).
  Sem sessão válida, ou com sessão expirada → `401`.

Não existe API key nem `Authorization: Bearer`; a sessão viaja por cookie
(`credentials: "include"` no client HTTP do frontend, `frontend/src/lib/api.ts`).

Toda rota autenticada também filtra os dados pelo dono: um recurso de outro
usuário responde `404` (não `403`), para não revelar que ele existe.

## Rate limiting

- Geral, em toda `/api`: **600 requisições / 15 min** por IP.
- Rotas de upload de arquivo (`/api/upload`, `/api/products/upload-photo`):
  **60 requisições / 15 min** por IP (mais caras — processam e gravam arquivo).

Ao estourar, responde `429` com `{ "error": "Muitas requisições..." }`.
Os headers padrão (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`)
vêm em toda resposta de rota limitada.

## Formato de erro

Todo erro da API responde `{ "error": "mensagem" }`. Erro de validação (Zod)
inclui também `details`, um por campo:

```json
{
  "error": "Dados inválidos",
  "details": [{ "campo": "name", "mensagem": "name não pode ser vazio" }]
}
```

| Status | Quando |
| --- | --- |
| 400 | corpo/query inválido (Zod), JSON malformado, arquivo rejeitado pelo multer |
| 401 | sem sessão válida (`AUTH_MODE=google`) |
| 404 | recurso não encontrado, ou pertence a outro usuário |
| 429 | rate limit excedido |
| 500 | erro não tratado (logado com `logger.error`, nunca vaza detalhe pro cliente) |

## Health check

```
GET /health
```

Sem autenticação. `{ "status": "ok" }`. Usado só para checar que o processo
subiu; não confirma conexão com o banco.

---

## Companies — `/api/companies`

Empresa é o nó raiz: lojas, produtos e temas pertencem a uma.

### `POST /api/companies`

```json
// body
{ "name": "Empório Hortifruti", "style": "sofisticado", "logo": null }
```

`style`: `"sofisticado"` (padrão) ou `"agressivo"`. `logo` é opcional, URL ou
`null`.

`201`:

```json
{
  "id": "cm...",
  "userId": "cm...",
  "name": "Empório Hortifruti",
  "style": "sofisticado",
  "logo": null,
  "createdAt": "2026-09-04T12:00:00.000Z",
  "updatedAt": "2026-09-04T12:00:00.000Z"
}
```

### `GET /api/companies`

Lista as empresas do usuário autenticado, com contagem de relacionados:

```json
[
  {
    "id": "cm...",
    "name": "Empório Hortifruti",
    "style": "sofisticado",
    "logo": null,
    "_count": { "stores": 1, "products": 34, "themes": 3 }
  }
]
```

### `GET /api/companies/:id`

Detalhe de uma empresa, com lojas e temas embutidos:

```json
{
  "id": "cm...",
  "name": "Empório Hortifruti",
  "stores": [{ "id": "cm...", "name": "Freguesia", "...": "..." }],
  "themes": [{ "id": "cm...", "themeName": "Promoção do Dia", "day": "segunda" }],
  "_count": { "products": 34, "drafts": 2 }
}
```

### `PUT /api/companies/:id`

Body: qualquer subconjunto de `{ name, style, logo }` (ao menos um campo).
`200` com a empresa atualizada.

### `DELETE /api/companies/:id`

Remove a empresa e tudo que pende dela (lojas, produtos, temas, rascunhos —
`onDelete: Cascade` no schema). `200`: `{ "success": true }`.

### `GET /api/companies/:companyId/stores`

Atalho para as lojas de uma empresa (mesma forma de `GET /api/stores/:id`,
em lista).

### `GET /api/companies/:companyId/themes`

Atalho para os temas de uma empresa — versão resumida (sem os 6 SVGs, que
são pesados):

```json
[{ "id": "cm...", "themeName": "Promoção do Dia", "day": "segunda" }]
```

---

## Stores — `/api/stores`

Loja física, usada no rodapé do encarte (endereço + telefone de entrega).

### `POST /api/stores`

```json
{
  "companyId": "cm...",
  "name": "Freguesia",
  "address": "Rua Geminiano Góis, 100",
  "deliveryPhone": "(21) 97510-3253",
  "logo": null
}
```

`deliveryPhone` aceita dígitos, espaços, `()`, `+` e `-` (8–20 chars) ou fica
vazio/`null`. `201` com a loja criada.

### `GET /api/stores/:id`

### `PUT /api/stores/:id`

Body: subconjunto de `{ name, address, deliveryPhone, logo }`.

### `DELETE /api/stores/:id`

`200`: `{ "success": true }`.

---

## Themes — `/api/themes`

Um tema guarda **6 SVGs**, um por formato (1, 2, 4, 6, 8, 10 itens), com
placeholders (`{{ITEM_N_FOTO}}`, `{{ITEM_N_NOME}}`, etc.) substituídos na hora
de gerar o encarte.

### `POST /api/themes`

```json
{
  "companyId": "cm...",
  "themeName": "Promoção do Dia",
  "day": "segunda",
  "format1Svg": "<svg ...>...</svg>",
  "format2Svg": "<svg ...>...</svg>",
  "format4Svg": "<svg ...>...</svg>",
  "format6Svg": "<svg ...>...</svg>",
  "format8Svg": "<svg ...>...</svg>",
  "format10Svg": "<svg ...>...</svg>"
}
```

`day`: um de `segunda, terca, quarta, quinta, sexta, sabado, domingo`. Cada
`formatNSvg` só é validado como string que começa com `<svg` e termina com
`</svg>` (não faz parsing XML completo). `201` com o tema criado.

### `GET /api/themes/:id`

Tema completo, com os 6 SVGs.

### `PUT /api/themes/:id`

Body: subconjunto de `{ themeName, day, format1Svg, ..., format10Svg }`.

### `DELETE /api/themes/:id`

`200`: `{ "success": true }`.

---

## Products — `/api/products`

Catálogo de produtos da empresa: nome, foto do banco público (`photoS3Url`)
e fotos que o usuário subiu (`userPhotos`).

### `POST /api/products`

```json
{
  "companyId": "cm...",
  "name": "Manga Palmer",
  "photoS3Url": "http://localhost:5000/uploads/abc.png",
  "userPhotos": []
}
```

### `GET /api/products?companyId=...&search=...`

`companyId` opcional (sem ele, lista todos os produtos do usuário);
`search` filtra por nome (case/acento-insensível).

### `GET /api/products/search?companyId=...&query=...&limit=5`

Busca difusa simples (Fuse.js) por nome — usada para autocomplete manual.
`limit`: 1–50, padrão 5.

```json
[{ "id": "cm...", "name": "Manga Palmer", "photoS3Url": "...", "score": 0.05 }]
```

### `POST /api/products/match`

O motor de casamento usado ao processar a lista colada em "Gerar encarte".

```json
// body
{ "companyId": "cm...", "productName": "agriao" }
```

```json
// 200 - confiante: exactMatch preenchido, suggestions vazio
{
  "exactMatch": {
    "product": { "id": "cm...", "name": "Agrião", "photoS3Url": "...", "userPhotos": [] },
    "confidence": 1
  },
  "suggestions": []
}
```

```json
// 200 - ambíguo ou de baixa confiança: exactMatch nulo, até 3 sugestões
{
  "exactMatch": null,
  "suggestions": [
    { "product": { "id": "cm...", "name": "Brócolis Comum", "...": "..." }, "confidence": 0.62 },
    { "product": { "id": "cm...", "name": "Brócolis Americano", "...": "..." }, "confidence": 0.6 }
  ]
}
```

Regra de decisão: com `confidence >= 0.85` e uma folga de pelo menos `0.02`
sobre o segundo colocado, vira `exactMatch`; caso contrário cai em
`suggestions` para o usuário escolher.

### `POST /api/products/upload-photo`

`multipart/form-data`: campo `file` (PNG/JPG/WEBP, até 8 MB) + campo de texto
`productId`. Sujeito ao rate limit de upload (60/15min).

`201` com o produto atualizado (`userPhotos` já com a nova URL no fim do
array):

```json
{ "id": "cm...", "name": "Manga Palmer", "photoS3Url": "...", "userPhotos": ["http://localhost:5000/uploads/xyz.png"] }
```

### `PUT /api/products/:id`

Body: subconjunto de `{ name, photoS3Url, userPhotos }`. Usado também para
promover um upload a foto principal (`{ "photoS3Url": "<uma url de userPhotos>" }`).

> **Nota:** `photoS3Url` precisa ser uma URL absoluta (`.url()` no Zod). Os
> dados do seed usam caminhos relativos (`/banco-fotos/...`), servidos pelo
> Next — então essa rota não deve ser usada para restaurá-los para relativo
> (limitação conhecida, não é um bug desta API).

### `DELETE /api/products/:id`

`200`: `{ "success": true }`.

---

## Rascunhos de encarte — `/api/encartes`

Salva o estado de uma geração em andamento (lista colada, tema, formato,
edições) para retomar depois.

### `POST /api/encartes`

```json
{
  "companyId": "cm...",
  "name": "Promoção de segunda",
  "productList": "Agrião 1,48 un\nRúcula 2,50 un",
  "selectedThemeId": "cm...",
  "selectedFormat": 4,
  "parsedProducts": [{ "name": "Agrião", "price": "1,48", "unit": "un", "photoUrl": "..." }],
  "edits": {}
}
```

`selectedFormat`: um de `1, 2, 4, 6, 8, 10`. `201` com o rascunho criado.

### `GET /api/encartes?companyId=...`

Lista os rascunhos do usuário (campo `companyId` na query é opcional).

### `GET /api/encartes/:id`

Rascunho completo, com `parsedProducts` e `edits` já desserializados.

### `PUT /api/encartes/:id`

Body: subconjunto de `{ name, productList, selectedThemeId, selectedFormat,
parsedProducts, edits, pngUrl, jpgUrl }`. `pngUrl`/`jpgUrl` são preenchidos
depois de uma exportação, se o resultado for persistido.

### `DELETE /api/encartes/:id`

`200`: `{ "success": true }`.

---

## Upload genérico — `/api/upload`

```
POST /api/upload
```

`multipart/form-data`, campo `file` (PNG/JPG/WEBP, até 8 MB). Sujeito ao
rate limit de upload. `201`:

```json
{ "url": "http://localhost:5000/uploads/<arquivo>.png" }
```

Usado por telas que só precisam de "suba uma imagem e me devolva a URL"
(logo de empresa/loja, arte de tema). Controlado por `STORAGE_MODE`:

- **`local`** (padrão): grava em `backend/uploads/`, serve em `/uploads/<arquivo>`.
- **`s3`**: envia para o bucket AWS configurado em `AWS_*` — ver
  [`backend/aws/README.md`](../backend/aws/README.md).

Erros de arquivo (tamanho, tipo) vêm do multer, traduzidos pelo
`errorHandler`:

```json
{ "error": "Arquivo maior que o limite permitido (8 MB)" }
```
