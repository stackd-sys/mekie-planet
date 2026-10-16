# Mekie Planet — loja online

Site da [Mekie Planet](https://mekie-planet.com), refeito em [Astro](https://astro.build) com um layout inspirado na loja da Ementa: header centrado sobre a imagem de capa, carrossel de produtos, mosaico de categorias, banner de drop, blocos editoriais e footer em 4 colunas.

## Correr localmente

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera o site estático em dist/
```

## Onde mudar as coisas

| O quê | Ficheiro |
| --- | --- |
| Produtos, preços, tamanhos, imagens | `src/data/products.ts` |
| Categorias do menu | `src/data/products.ts` (`categories`) |
| Email, Instagram, envio grátis, prazo de entrega, avisos do topo | `src/data/site.ts` |
| Textos legais | `src/data/legal.ts` |
| Cores e tipografia | `src/styles/global.css` |
| Imagens | `public/images/products` e `public/images/site` |

Para adicionar um produto: coloca as imagens em `public/images/products/` (de preferência `.webp`, 1200px) e acrescenta uma entrada a `products` em `src/data/products.ts`. A página do produto é criada automaticamente.

## Carrinho e encomendas

O carrinho funciona no browser (guardado em `localStorage`). Por agora, o checkout recolhe os dados do cliente e abre o email com o resumo da encomenda para `geral@mekie-planet.com`. Na fase seguinte liga-se um pagamento online (Stripe com MB WAY, Multibanco, cartão, Apple Pay e Google Pay).

## Newsletter e 10% de boas-vindas

O popup (e o formulário do rodapé) pede o email e o consentimento e mostra o código `MEKIE10`.

Para guardar os emails, põe o URL de um webhook em `newsletterWebhook` (`src/data/site.ts`). O mais simples é o Google Apps Script em `integrations/newsletter.gs`, que escreve numa Google Sheet (as instruções estão no topo do ficheiro). Esse script:

- não deixa o mesmo email entrar duas vezes e avisa a pessoa que já estava na lista;
- no checkout, confirma que o email da encomenda subscreveu a newsletter e ainda não usou o código;
- marca na folha quando o código é usado e em que encomenda.

O site envia `POST` (`application/x-www-form-urlencoded`) com o campo `action`:

| `action` | Campos | Resposta (JSON) |
| --- | --- | --- |
| `subscribe` | `email`, `consent`, `source` (`popup` ou `footer`), `page`, `code`, `created_at` | `{ "status": "new" \| "exists", "used": false }` |
| `check` | `email` | `{ "subscribed": true, "used": false }` |
| `redeem` | `email`, `code`, `order`, `created_at` | `{ "used": true }` |

Também funciona com Make, Zapier ou n8n. Se o webhook não responder em JSON, o email é guardado na mesma mas o site não consegue saber se já estava inscrito. Enquanto o campo estiver vazio, o código aparece mas o email **não fica guardado**.

O código e a percentagem estão em `welcomeCode` e `welcomeDiscount`. O código tem de ser criado também no sistema de pagamento, com uso único por cliente e sem acumular com outras promoções.

## Deploy na Vercel

Importar o repositório na Vercel; o preset **Astro** é detetado automaticamente (build `npm run build`, output `dist`).
