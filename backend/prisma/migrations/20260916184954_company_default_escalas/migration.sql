-- Etapa 33: modelo padrao do encarte de 8 itens por empresa (fundo,
-- fontes, tamanhos, posicoes por elemento) - null = usa o padrao do
-- sistema, nao precisa de valor inicial pras empresas ja existentes.
ALTER TABLE "Company" ADD COLUMN "defaultEscalas" JSONB;
