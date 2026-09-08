# Encarte Gerador

Gerador de encartes promocionais: cola a lista de produtos com precos, o sistema
casa cada nome com a foto do banco de imagens, monta o encarte no tema e formato
escolhidos e exporta em PNG ou JPG.

## Estrutura

- `frontend/` - Next.js 14 (App Router) + TypeScript + Tailwind CSS
- `backend/` - Node.js + Express + TypeScript
- `database/` - configuracao de conexao e migrations

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

## Formatos de saida

- Feed: 1080x1350
- Stories: 1080x1920
- Grades de 1, 4, 8 ou 10 itens

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

As fotos ficam em `frontend/public/produtos/`, servidas como arquivo
estatico do Next (URL `/produtos/<slug>.png`). Nomes de arquivo sem
espaco, acento ou maiuscula, para nunca precisar de URL-encoding.

`backend/prisma/seed-data/produtos.json` mapeia nome de exibicao (com
acento, para o usuario ler) a slug do arquivo. Popula ou atualiza o
banco com:

```bash
npm run db:seed-produtos -w backend
```

E idempotente: roda de novo sem duplicar, so atualiza `photoS3Url`
se o slug mudar. Usa a empresa "Empório Hortifruti" do usuario local,
criando-a se ainda nao existir.

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
