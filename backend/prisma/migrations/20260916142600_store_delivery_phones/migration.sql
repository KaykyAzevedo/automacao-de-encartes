-- Etapa 28: Store.deliveryPhone (um numero) vira Store.deliveryPhones
-- (lista) - loja pode divulgar mais de um contato (ex.: WhatsApp de
-- delivery + fixo). Preserva o numero ja cadastrado como primeiro
-- item da lista, em vez de so derrubar o dado.

-- 1. Cria a coluna nova
ALTER TABLE "Store" ADD COLUMN "deliveryPhones" TEXT[] NOT NULL DEFAULT '{}';

-- 2. Migra o valor existente (se houver) para o primeiro item da lista
UPDATE "Store"
SET "deliveryPhones" = ARRAY["deliveryPhone"]
WHERE "deliveryPhone" IS NOT NULL AND "deliveryPhone" <> '';

-- 3. Remove a coluna antiga
ALTER TABLE "Store" DROP COLUMN "deliveryPhone";
