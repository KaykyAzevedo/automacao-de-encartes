# Guia do usuário — Encarte Gerador

Passo a passo para cadastrar uma empresa e gerar seu primeiro encarte.

## 1. Entrar

Com `AUTH_MODE=local` (o padrão do projeto), não existe tela de login — o
app abre direto no **Dashboard**, operando como um usuário local fixo.

Com `AUTH_MODE=google`, acesse `/login` e entre com sua conta Google.

## 2. Cadastrar a empresa

Vá em **Preparação** (menu lateral). No card **Empresas**, clique em
**Nova**, preencha:

- **Nome da empresa** — ex.: "Empório Hortifruti"
- **Estilo dos encartes** — "Sofisticado" (preto e dourado) ou "Agressivo"
  (amarelo e preto). Muda a paleta usada nos temas prontos.
- **URL do logo** (opcional) — aparece no rodapé do encarte, junto com a loja.

Clique em **Criar empresa**. Ela passa a aparecer na lista, com um resumo
(quantas lojas, produtos e temas já tem).

## 3. Cadastrar as lojas

Ainda em Preparação, selecione a empresa criada. No card **Lojas**, clique em
**Nova** e preencha nome, endereço e telefone de entrega (opcional) — isso
monta o rodapé do encarte ("peça na loja X, telefone Y").

Uma empresa pode ter mais de uma loja (ex.: Freguesia e Barra da Tijuca);
o rodapé do encarte mostra a loja escolhida na hora de gerar.

## 4. Conferir os produtos

Clique em **Gerenciar** no card **Produtos**. O catálogo já vem com um banco
de fotos público (`frontend/public/banco-fotos/`) — a maior parte das frutas,
legumes e verduras comuns já tem foto pronta.

Se um produto seu não tiver foto boa, ou você quiser usar uma foto própria:

1. Busque o produto pelo nome.
2. Clique em **+ Adicionar foto** e escolha um arquivo (PNG, JPG ou WEBP).
3. A foto aparece na lista de "Suas fotos". Clique em **Usar esta foto**
   para torná-la a foto principal do produto (some no lugar da do banco em
   toda geração futura) — ou deixe como está e escolha caso a caso na hora
   de gerar (passo 6).

## 5. Escolher/criar um tema

Clique em **Gerenciar** no card **Temas**. Um tema é a "roupagem visual" do
encarte: cores, moldura, onde a foto e o preço aparecem — um conjunto de 6
artes, uma por formato de grid (1, 2, 4, 6, 8 e 10 itens).

- O tema pronto **"Promoção do Dia"** já vem com os 6 formatos (veja em
  **Temas**, no menu lateral, uma prévia de cada).
- Para um tema próprio, clique em **Novo tema**, dê um nome, escolha um dia
  da semana sugerido e envie (ou cole) o SVG de cada formato.

Você só precisa fazer isso uma vez por tema — ele fica salvo e disponível
na tela de geração.

## 6. Gerar o encarte

Vá em **Gerar encarte**.

1. **Cole a lista de produtos**, um por linha, no formato
   `Nome Preço Unidade` — ex.:
   ```
   Agrião 1,48 un
   Rúcula 2,50 un
   Abóbora Sergipana 3,98 kg
   Manga Palmer 5,98 kg
   ```
   Erros de digitação e acentos não atrapalham — o sistema casa o nome com
   o catálogo mesmo com pequenas diferenças ("agriao" acha "Agrião").
2. Escolha o **tema** e o **formato** (quantidade de itens por grid).
3. Clique em **Processar**. Cada linha vira um card, mostrando a foto
   encontrada, o preço e a unidade.
   - Se o sistema não tiver certeza de qual produto é, ele mostra **até 3
     sugestões** para você escolher, em vez de adivinhar.
   - Se o produto tiver mais de uma foto (banco + upload seu), aparece um
     seletor com os selos **"banco"** e **"seu upload"** — escolha qual usar
     só neste encarte, sem alterar o produto.
4. Acompanhe a **prévia** ao vivo, no tamanho e formato reais.
5. Ajuste tamanhos de foto/nome/preço se precisar (editor visual, direto na
   prévia).
6. Clique em **Download como PNG** (fundo transparente) ou **Download como
   JPG** (fundo sólido) para exportar.

## 7. Salvar e retomar um rascunho

Se quiser continuar depois, clique em **Salvar rascunho** (mesma tela de
geração), dê um nome e confirme. Ele aparece em **Rascunhos**, no menu
lateral — clique em **Abrir** para retomar exatamente de onde parou (lista,
tema, formato e produtos já processados de novo), ou **Excluir** para
descartar.

## Formatos disponíveis

| Formato | Uso sugerido |
| --- | --- |
| 1080×1350 | Feed (post quadrado/retrato) |
| 1080×1920 | Stories |
| Grades de 1, 2, 4, 6, 8 ou 10 itens | quantidade de produtos por arte |

## Perguntas comuns

**Um produto não foi encontrado / veio errado.**
Confira se o nome na lista está parecido o bastante com o nome cadastrado no
catálogo (Preparação → Produtos). Nomes muito diferentes (apelidos,
abreviações incomuns) não são reconhecidos — cadastre o produto com um nome
mais fácil de casar, ou edite a linha da lista.

**Posso usar o app sem internet / sem conta AWS?**
Sim — no modo padrão (`AUTH_MODE=local`, `STORAGE_MODE=local`) tudo roda na
sua própria máquina, sem login e sem depender de serviço externo. AWS S3 só
entra se você optar por configurá-lo (ver `backend/aws/README.md`).

**Perdi uma geração, tem como recuperar?**
Só se você tiver salvo como rascunho antes de sair da tela (passo 7). O
sistema não salva automaticamente durante o processamento.
