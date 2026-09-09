# Encarte Gerador

Gerador de encartes promocionais: cola a lista de produtos com precos, o sistema
casa cada nome com a foto do banco de imagens, monta o encarte no tema e formato
escolhidos e exporta em PNG ou JPG.

## Documentação

- [`docs/API.md`](docs/API.md) - todos os endpoints da API, com exemplo de request/response
- [`docs/SCHEMA.md`](docs/SCHEMA.md) - diagrama ER e descrição das tabelas
- [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) - passo a passo de como usar o app
- [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) - estrutura de pastas, padrões de código, como adicionar uma feature

## Estrutura

- `frontend/` - Next.js 14 (App Router) + TypeScript + Tailwind CSS
- `backend/` - Node.js + Express + TypeScript, com as migrations do Prisma em `backend/prisma/`
- `docs/` - documentação (links acima)

Monorepo com npm workspaces: `npm run <script>` na raiz roda o script em
cada workspace (`dev`, `typecheck`, `lint`, `test`, `build`). Árvore completa
de pastas e o que cada uma guarda: [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md#estrutura-de-pastas).

## Setup

Frontend:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Banco de dados

Requer PostgreSQL rodando localmente (testado com o 18). Crie os dois bancos
uma unica vez - o segundo e o shadow database, usado pelo `prisma migrate dev`
para validar as migrations:

```sql
CREATE DATABASE encarte;
CREATE DATABASE encarte_shadow;
```

Coloque a senha do usuario `postgres` em `DATABASE_URL` e `SHADOW_DATABASE_URL`
no `backend/.env`, e a mesma `DATABASE_URL` no `frontend/.env.local` (o adapter
do NextAuth escreve direto nas tabelas). Depois:

```bash
npm run db:migrate -w backend
```

Frontend em http://localhost:3000, backend em http://localhost:5000.

## Variáveis de ambiente

Cada workspace tem seu próprio arquivo (`backend/.env`, `frontend/.env.local`)
com um `.example` correspondente para copiar. `AUTH_MODE` e `DATABASE_URL`
precisam ter o **mesmo valor** nos dois.

### `backend/.env`

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `AUTH_MODE` | não | `local` | `local` (sem login) ou `google` (exige sessão NextAuth) |
| `LOCAL_USER_EMAIL` | não | `local@encarte.local` | e-mail do usuário fixo quando `AUTH_MODE=local` |
| `PORT` | não | `5000` | porta do servidor Express |
| `NODE_ENV` | não | `development` | `development` liga log colorido (pino-pretty); qualquer outro valor sai em JSON puro |
| `CORS_ORIGIN` | não | `http://localhost:3000` | origem liberada para o frontend |
| `DATABASE_URL` | **sim** | — | string de conexão do Postgres |
| `SHADOW_DATABASE_URL` | **sim** (para `db:migrate`) | — | banco auxiliar que o Prisma usa para validar migrations |
| `STORAGE_MODE` | não | `local` | `local` (grava em `backend/uploads/`) ou `s3` |
| `PUBLIC_BASE_URL` | não | `http://localhost:<PORT>` | prefixo usado para montar a URL pública de um upload local |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` | só com `STORAGE_MODE=s3` | — | credenciais do bucket — guia completo em [`backend/aws/README.md`](backend/aws/README.md) |
| `LOG_LEVEL` | não | `debug` (dev) / `info` (demais) | nível mínimo do logger (`pino`) |

### `frontend/.env.local`

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `AUTH_MODE` | não | `local` | precisa bater com o do backend |
| `LOCAL_USER_EMAIL` | não | `local@encarte.local` | idem `AUTH_MODE=local` |
| `NEXT_PUBLIC_API_URL` | não | `http://localhost:5000` | URL base da API, usada pelo client HTTP (`lib/api.ts`) |
| `NEXTAUTH_URL` | só com `AUTH_MODE=google` | — | URL pública do frontend, exigida pelo NextAuth |
| `NEXTAUTH_SECRET` | só com `AUTH_MODE=google` | — | gere com `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | só com `AUTH_MODE=google` | — | ver seção "AUTH_MODE=google" abaixo |
| `DATABASE_URL` | **sim** | — | mesma string do backend (o adapter do NextAuth lê/escreve direto) |

## Formatos de saida

- Feed: 1080x1350
- Stories: 1080x1920
- Grades de 1, 2, 4, 6, 8 ou 10 itens

## Autenticacao

Controlada pela variavel `AUTH_MODE`, que precisa ter o mesmo valor no
`backend/.env` e no `frontend/.env.local`.

### AUTH_MODE=local (padrao)

Nao ha login. O app opera como um usuario local fixo, criado sob demanda
a partir de `LOCAL_USER_EMAIL`. A tela de login some e `/login` redireciona
para o dashboard. Serve para uso pessoal na propria maquina.

Os dados continuam tendo dono: empresas, lojas e produtos ficam ligados a
esse usuario, entao trocar para o modo google depois nao exige migracao.

### AUTH_MODE=google

Exige login com Google via NextAuth, com sessao no banco. Rotas internas
redirecionam para `/login` e a API responde 401 sem sessao valida.
As credenciais precisam ser criadas por voce:

1. Acesse https://console.cloud.google.com
2. Crie um projeto (ou selecione um existente)
3. APIs & Services > OAuth consent screen
   - User type: External
   - Preencha nome do app, email de suporte e email do desenvolvedor
   - Em Test users, adicione o seu proprio email
4. APIs & Services > Credentials > Create credentials > OAuth client ID
   - Application type: Web application
   - Authorized JavaScript origins: http://localhost:3000
   - Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
5. Copie Client ID e Client Secret para frontend/.env.local:
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
6. Reinicie o dev server

Rotas: `/login` (publica), `/dashboard` (exige sessao), `/` redireciona
conforme o estado do login.

## Banco de fotos de produtos

As fotos ficam em `frontend/public/banco-fotos/`, servidas como
arquivo estatico do Next (URL `/banco-fotos/<slug>.png`). Nomes de
arquivo sem espaco, acento ou maiuscula, para nunca precisar de
URL-encoding. PNG com fundo transparente.

`backend/prisma/seed-data/banco-fotos.json` mapeia nome de exibicao
(com acento, para o usuario ler) a slug do arquivo. Popula ou atualiza
o banco com:

```bash
npm run db:seed -w backend
```

(equivalente a `npx prisma db seed`, convencao oficial do Prisma;
o comando esta configurado em `backend/prisma7.config.ts`)

E idempotente: roda de novo sem duplicar, so atualiza `photoS3Url`
se o slug mudar. Usa a empresa "Empório Hortifruti" do usuario local,
criando-a se ainda nao existir - o app roda para um unico usuario, e
uma empresa "admin" separada so fragmentaria os dados.

Para adicionar mais fotos: coloque os PNGs em
`frontend/public/banco-fotos/`, acrescente `{ "nome": "...", "slug":
"...png" }` em `banco-fotos.json` e rode o seed de novo.

Com `STORAGE_MODE=s3` (ver secao de upload abaixo), o `photoS3Url`
gerado pelo seed deve apontar para o bucket em vez do caminho local -
o prefixo `banco-fotos/` dentro do bucket ja esta documentado em
`backend/aws/README.md`.

## Upload de arquivos

`POST /api/upload` recebe `multipart/form-data` no campo `file` (PNG,
JPG ou WEBP, ate 8 MB) e devolve `{ "url": "..." }`. Exige sessao,
igual ao resto da API.

Controlado por `STORAGE_MODE`, mesmo padrao do `AUTH_MODE`:

- **local** (padrao) - salva em `backend/uploads/`, servido pelo
  proprio backend em `/uploads/<arquivo>`. Sem custo, sem conta AWS.
- **s3** - envia para um bucket AWS S3. Guia completo de configuracao
  (bucket, politica de leitura publica, CORS, credencial IAM) em
  [`backend/aws/README.md`](backend/aws/README.md).

## Como contribuir

1. Rode o setup acima (frontend + backend + banco) e confirme que
   `npm run dev` sobe os dois servidores sem erro.
2. Crie uma branch a partir de `main`: `git checkout -b feat/nome-curto`
   (ou `fix/nome-curto`). Nunca commite direto em `main`.
3. Siga os padrões já estabelecidos no código (nomes em português,
   estrutura schema→service→controller→route no backend, hooks
   `use<Recurso>` no frontend) - ver
   [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) para o guia
   completo, com exemplos.
4. Antes de commitar, rode tudo a partir da raiz:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```
   Os três precisam estar limpos. Se mexeu em `backend/prisma/schema.prisma`,
   rode também `npm run db:migrate -w backend`.
5. Se a mudança altera a API, o schema do banco ou o fluxo do usuário,
   atualize o doc correspondente (`docs/API.md`, `docs/SCHEMA.md`,
   `docs/USER_GUIDE.md`) na mesma alteração.
6. Abra o PR (ou peça revisão) descrevendo o que mudou e como foi testado -
   preferencialmente com print/gif de UI quando a mudança for visual.
