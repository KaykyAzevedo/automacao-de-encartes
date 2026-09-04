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

## Autenticacao (Google)

O login usa NextAuth v4 com adapter Prisma e sessao no banco.
As credenciais do Google precisam ser criadas por voce:

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
