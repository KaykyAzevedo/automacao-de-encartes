# Guia do desenvolvedor — Encarte Gerador

Como o código está organizado, os padrões que ele segue e o passo a passo
pra adicionar uma feature nova sem quebrar a consistência.

## Stack

- **Backend**: Node.js + Express + TypeScript, Prisma 7 (client gerado, não
  o legado), PostgreSQL, Zod para validação, Jest + supertest para teste.
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS,
  TanStack Query para estado de servidor, NextAuth (Google) opcional,
  Vitest + Testing Library para teste.
- **Monorepo** via npm workspaces (`frontend/`, `backend/`) — `npm run <script>`
  na raiz roda o script em cada workspace (`npm run dev`, `typecheck`, `lint`,
  `test`, `build`).

## Estrutura de pastas

```
encarte-gerador/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # schema único, gera 2 clients (ver docs/SCHEMA.md)
│   │   ├── migrations/
│   │   └── seed-data/           # banco-fotos.json, consumido pelo seed
│   ├── src/
│   │   ├── config/env.ts        # toda env var lida e tipada aqui, só aqui
│   │   ├── controllers/         # 1 por recurso: parse + chama service + responde
│   │   ├── services/            # regra de negócio + acesso ao Prisma
│   │   ├── schemas/             # validação Zod (input) por recurso
│   │   ├── routes/               # Router do Express por recurso + index.ts monta tudo
│   │   ├── middlewares/          # requireAuth, errorHandler, upload, rateLimiter
│   │   ├── lib/                  # prisma client, logger, erros, helpers de texto
│   │   ├── generated/prisma/     # Prisma Client gerado (não editar, não versionar mudanças manuais)
│   │   └── __tests__/            # Jest
│   └── aws/README.md             # setup do S3, só relevante com STORAGE_MODE=s3
├── frontend/
│   └── src/
│       ├── app/                  # App Router: cada pasta = rota
│       │   ├── (app)/            # rotas autenticadas (dashboard, preparation, generate-encarte, drafts, temas)
│       │   ├── login/            # tela de login (AUTH_MODE=google)
│       │   └── api/              # rota interna do NextAuth
│       ├── components/
│       │   ├── ui/               # componentes genéricos (Button, Modal, Toast, Skeleton...)
│       │   ├── preparation/      # forms/listas de empresa, loja, tema, produto
│       │   ├── encarte/          # o gerador em si (previewer, seletor de foto, salvar rascunho)
│       │   └── layout/           # Header, Sidebar
│       ├── hooks/                # 1 arquivo por recurso: useCompanies.ts, useProducts.ts...
│       ├── lib/                  # api client, parser da lista, matching, export, temas/
│       │   └── temas/            # os templates SVG (ver "Como adicionar um tema" abaixo)
│       └── __tests__/            # Vitest
├── docs/                         # este guia, API.md, SCHEMA.md, USER_GUIDE.md
└── package.json                  # workspaces + scripts agregados
```

## Padrões de código (backend)

Todo recurso (`Company`, `Store`, `Theme`, `Product`, `EncarteDraft`) segue
exatamente a mesma cadeia de 4 arquivos — copie o mais parecido em vez de
inventar uma estrutura nova:

```
schemas/<recurso>.schema.ts   → zod: shape de criar/atualizar/params
services/<recurso>.service.ts → prisma + regra de negócio
controllers/<recurso>.controller.ts → parse do schema + chama o service + responde
routes/<recurso>.routes.ts    → Router do Express, monta os métodos HTTP
```

Exemplo mínimo, seguindo `company.*`:

```ts
// schemas/exemplo.schema.ts
export const criarExemploSchema = z.object({
  companyId: z.string().trim().min(1, "companyId não pode ser vazio"),
  name: z.string().trim().min(1).max(120),
});
export type CriarExemploInput = z.infer<typeof criarExemploSchema>;

// services/exemplo.service.ts
export const exemploService = {
  criar(userId: string, dados: CriarExemploInput) {
    return prisma.exemplo.create({ data: dados });
  },
  async garantirPropriedade(userId: string, id: string) {
    const existe = await prisma.exemplo.findFirst({
      where: { id, companyId: /* ... */ },
      select: { id: true },
    });
    if (!existe) throw naoEncontrado("Exemplo não encontrado");
  },
};

// controllers/exemplo.controller.ts
export const exemploController = {
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = usuarioDe(req); // lança 401 se req.usuario faltar
      const dados = criarExemploSchema.parse(req.body);
      res.status(201).json(await exemploService.criar(usuario.id, dados));
    } catch (e) {
      next(e);
    }
  },
};

// routes/exemplo.routes.ts
export const exemploRoutes = Router();
exemploRoutes.use(requireAuth);
exemploRoutes.post("/", exemploController.criar);

// routes/index.ts
routes.use("/api/exemplos", exemploRoutes);
```

Regras que valem pra todo recurso novo:

- **Ownership sempre**: toda leitura/escrita de um recurso de outro dono
  responde `404` (nunca `403` — não revela que o recurso existe). Veja
  `garantirPropriedade` em qualquer `*.service.ts` existente.
- **`try/catch` + `next(e)`** em todo método de controller — nunca deixe uma
  promise rejeitar sem `.catch`/`next`; é assim que o `errorHandler`
  centralizado consegue formatar o erro.
- **Erros de negócio** usam `AppError` (`lib/errors.ts`), não `throw` de
  string nem `Error` genérico — o `errorHandler` só sabe formatar isso.
- **Validação sempre via Zod**, nunca `if (!body.name) ...` manual — assim o
  formato de erro (`{ error, details }`) fica igual em toda rota.
- **Rota de upload** (recebe `multipart/form-data`) usa
  `uploadMiddleware` (`middlewares/upload.ts`) + `limitadorUpload`
  (`middlewares/rateLimiter.ts`) antes do controller — veja
  `product.routes.ts` como referência.
- Nomes de variável, função e comentário **em português**; nomes de tipo/
  schema/rota HTTP seguem o inglês já estabelecido (`Company`, `productId`).
  Não misture os dois dentro do mesmo arquivo sem necessidade.

## Padrões de código (frontend)

Mesma lógica de "um arquivo por recurso", só que do lado do cliente:

```
lib/<recurso>.ts (se precisar de uma função solta, ex.: uploadFotoProduto.ts)
hooks/use<Recurso>.ts   → chaves de query + useQuery/useMutation
components/.../Form<Recurso>.tsx ou Edit<Recurso>Modal.tsx
```

Convenção de hooks (veja `hooks/useCompanies.ts`, `hooks/useProducts.ts`):

```ts
export const chavesExemplo = { todas: ["exemplos"] as const };

export function useExemplos(companyId?: string) {
  return useQuery({
    queryKey: [...chavesExemplo.todas, companyId],
    queryFn: () => api.get<Exemplo[]>(`/api/exemplos?companyId=${companyId}`),
  });
}

export function useCriarExemplo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: DadosExemplo) => api.post<Exemplo>("/api/exemplos", dados),
    onSuccess: () => qc.invalidateQueries({ queryKey: chavesExemplo.todas }),
  });
}
```

- **Nunca chame outro hook dentro de um callback** (`onSuccess`, `onClick`)
  — viola as Rules of Hooks. `useQueryClient()` é chamado uma vez no topo do
  hook e usado dentro do callback, não o contrário.
- **Cliente HTTP**: sempre via `lib/api.ts` (`api.get/post/put/del`), nunca
  `fetch` direto num componente — é lá que `credentials: "include"` e o
  parse de erro (`ApiError`) ficam centralizados.
- **Validação de formulário**: schema Zod em `lib/schemas.ts`, convertido pra
  `{ campo: mensagem }` via `errosPorCampo()` — mesma forma de erro do
  backend, pra reaproveitar o componente `<Campo erro={...}>`.
- **Feedback de ação**: `useToast()` (`components/ui/Toast.tsx`) pra sucesso/
  erro, `ConfirmDialog` pra qualquer exclusão — nunca `window.confirm` nem
  `alert`.
- **Botão com ação assíncrona**: prop `carregando` do `Button`
  (`components/ui/Button.tsx`) mostra o spinner e desabilita sozinho — não
  reimplemente isso com `disabled={pending} + texto condicional` do zero.
- **Modal**: use `components/ui/Modal.tsx` (ou `ConfirmDialog` pra
  confirmação simples) em vez de montar um `<div fixed inset-0>` novo — eles
  já cuidam de Escape, foco preso (`useTravaFoco`) e `role`/`aria-*`.

## Como adicionar um tema (SVG)

Um tema vive em duas partes:

1. **Dado** (`Theme` no banco): 6 SVGs, um por formato, com placeholders
   substituídos na hora de renderizar — `{{ITEM_N_FOTO}}`, `{{ITEM_N_NOME}}`,
   `{{ITEM_N_PRECO}}`, etc (`N` de 1 até a quantidade de itens do formato).
   Cadastrado via `POST/PUT /api/themes` (tela **Preparação → Temas**).
2. **Template embutido** ("Promoção do Dia"), em `frontend/src/lib/temas/`:
   - `tipos.ts` — os tipos compartilhados (`ItemEncarte`, `DadosTema`, etc).
   - `base.ts` — símbolos SVG reutilizáveis (`<defs>`: molduras, folhas,
     gradientes) e o cabeçalho padrão.
   - `promocaoDoDia.ts` — a função `montar()` por formato (`grade1`,
     `grade2`, ..., `grade10`), compondo os símbolos de `base.ts`.
   - `render.ts` — a função pura que recebe os dados processados e devolve
     a string SVG final (usada tanto no preview quanto na exportação).
   - `exemplo.ts` — dados fake, só para a galeria em `/temas`.

   Para um novo template embutido: duplique `promocaoDoDia.ts`, ajuste as
   constantes visuais (cores, posições) e registre nos formatos que fazem
   sentido; não precisa mexer em `render.ts` se a interface `DadosTema` for
   respeitada.

Validação de tudo isso: gere o SVG no preview real (`/generate-encarte`,
formato desejado, produtos reais), rasterize (o `html-to-image` já
configurado) e compare visualmente — não existe teste automatizado de
pixel para os temas, a verificação é sempre visual.

## Testes

```bash
npm test               # roda backend (Jest) e depois frontend (Vitest)
npm run test -w backend   # só backend
npm run test -w frontend  # só frontend
```

- **Backend**: `backend/src/__tests__/`. Lógica pura (ex.: fuzzy matching)
  é testada direto, sem mock. Rotas HTTP são testadas com `supertest` sobre
  o `Router` real, mockando só `../lib/prisma` (banco em memória com
  `jest.fn()`) e `../middlewares/requireAuth` (usuário fixo trocável por
  teste) — nunca sobe um Postgres de verdade no CI/local para isso. Veja
  `company.api.test.ts` como modelo.
- **Frontend**: `frontend/src/__tests__/`, Vitest + Testing Library.
  `fetch` mockado com `vi.stubGlobal("fetch", vi.fn())`; componente
  envolvido em `<QueryClientProvider>` + `<ToastProvider>` quando usa esses
  contexts. Veja `FormCompany.test.tsx` como modelo.
- Teste novo de API/serviço: siga o arquivo do recurso mais parecido em vez
  de começar do zero.

## Checklist antes de commitar

```bash
npm run typecheck   # tsc --noEmit nos dois workspaces
npm run lint         # eslint nos dois workspaces
npm test             # Jest + Vitest
npx prettier --write <arquivos tocados>
```

Todos os quatro precisam estar limpos. Se mudou o `schema.prisma`, rode
também `npm run db:migrate -w backend` (cria a migration e regenera os dois
Prisma Clients) antes de testar.

## Branching e commits

- Nunca commite direto em `main`: `git checkout -b feat/<nome-curto>`,
  termine o trabalho, depois `git checkout main && git merge --ff-only
  feat/<nome-curto> && git push origin main`.
- Mensagem de commit: título curto no imperativo + corpo explicando o que
  mudou e, quando relevante, como foi testado (veja o histórico do projeto
  para o tom — direto, em português, sem "feat:"/"fix:" convencional).

## Variáveis de ambiente ao adicionar uma feature

Toda env var nova precisa:

1. Entrar em `backend/src/config/env.ts` (tipada, com valor padrão sensato)
   e/ou ser lida via `process.env.NEXT_PUBLIC_*` no frontend.
2. Ser documentada em `backend/.env.example` e/ou
   `frontend/.env.local.example`, com comentário explicando o efeito.
3. Ser citada no [`README.md`](../README.md) se mudar o setup padrão (ex.:
   um novo modo, como `AUTH_MODE`/`STORAGE_MODE`).
