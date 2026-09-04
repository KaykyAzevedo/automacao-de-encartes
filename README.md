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

Frontend em http://localhost:3000, backend em http://localhost:5000.

## Formatos de saida

- Feed: 1080x1350
- Stories: 1080x1920
- Grades de 1, 4, 8 ou 10 itens
