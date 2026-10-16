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

Para guardar os emails, põe o URL de um webhook em `newsletterWebhook` (`src/data/site.ts`) ou na Vercel, em Settings > Environment Variables, com o nome `PUBLIC_NEWSLETTER_WEBHOOK` (depois é preciso fazer Redeploy). O mais simples é o Google Apps Script em `integrations/newsletter.gs`, que escreve numa Google Sheet (as instruções estão no topo do ficheiro). Esse script:

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

## Portes de envio

Os valores estão em `src/data/shipping.ts` e o peso de cada peça em `src/data/products.ts` (`gramsByCategory`, valores padrão para este tipo de roupa). A cada encomenda somam-se 100 g de embalagem. O checkout calcula os portes conforme o país e o peso.

| Destino | Peso da encomenda | Cliente paga | Envio grátis |
| --- | --- | --- | --- |
| Portugal (Continente, Açores e Madeira) | até 500 g | 5,90€ | acima de 65€ |
| Portugal | 500 g a 2 kg | 9,90€ | acima de 65€ |
| União Europeia | até 250 g | 9,90€ | não há |
| União Europeia | 250 a 500 g | 12,90€ | não há |
| União Europeia | 500 g a 1 kg | 16,90€ | não há |
| União Europeia | 1 a 2 kg | 24,90€ | não há |

Acima de 2 kg a encomenda segue em mais de um volume e os portes somam-se.

Custo real com os preços de balcão dos CTT 2026 (tarifário de 3 de fevereiro de 2026), mais cerca de 0,50€ de embalagem quando não é pré-paga:

| Envio | Opção CTT | Custo | Cliente paga |
| --- | --- | --- | --- |
| Portugal, acessórios pequenos | Correio Verde, saqueta M (17,5 × 26,5 cm) | 4,50€ | 5,90€ |
| Portugal, até 500 g (t-shirt, boné) | Correio Registado, pacote postal | 5,40€ + embalagem | 5,90€ |
| Portugal, hoodie | Correio Verde, caixa L (31 × 22 × 5 cm) | 6,65€ | 9,90€ ou grátis |
| Portugal, 500 g a 2 kg | Correio Registado, pacote postal | 8,93€ + embalagem | 9,90€ |
| Europa, até 250 g | Correio Registado internacional | 8,60€ + embalagem | 9,90€ |
| Europa, 250 a 500 g | Correio Registado internacional | 11,10€ + embalagem | 12,90€ |
| Europa, 500 g a 1 kg | Correio Registado internacional | 15,55€ + embalagem | 16,90€ |
| Europa, 1 a 2 kg | Correio Registado internacional | 23,35€ + embalagem | 24,90€ |

Os envios são feitos ao balcão de uma loja CTT, sem contrato, e os portes cobrados cobrem sempre o custo. O Correio Verde e o Correio Registado nacional custam o mesmo para os Açores e a Madeira, por isso as ilhas pagam o mesmo que o Continente.

O envio grátis em Portugal acima de 65€ custa à Mekie entre 5,90€ e 9,40€ por encomenda (9% a 14% de uma encomenda de 65€). Na União Europeia não há envio grátis, porque os portes reais passam facilmente de 15% da venda.

## Estatísticas e publicidade

O Google Analytics 4 (`G-1ZM3W7QS2T`) e o Meta Pixel (`4063958257255357`) são os mesmos do site antigo e estão em `site.analytics`, em `src/data/site.ts`. Só carregam depois de a pessoa aceitar no aviso de cookies (`src/components/CookieBanner.astro` e `src/scripts/consent.ts`). Se os dois campos ficarem vazios, o aviso desaparece.

Eventos enviados: `view_item` / `ViewContent`, `add_to_cart` / `AddToCart`, `begin_checkout` / `InitiateCheckout` e `sign_up` / `Lead` (newsletter). O `purchase` / `Purchase` entra quando o pagamento Stripe estiver ligado, na página de encomenda confirmada.

O site antigo carregava também o Google Tag Manager (`GTM-T8HV3THK`) com estas mesmas tags. O site novo não usa o GTM, para não contar tudo a dobrar.

## Deploy na Vercel

1. Em vercel.com, **Add New > Project** e importar `stackd-sys/mekie-planet`. O preset **Astro** é detetado sozinho (build `npm run build`, output `dist`).
2. Em **Settings > Domains**, adicionar `mekie-planet.com` e `www.mekie-planet.com` e seguir as instruções de DNS.
3. Os redirecionamentos dos URLs antigos do WooCommerce e os cabeçalhos de cache e segurança estão em `vercel.json`.
4. Depois de mudar o domínio, submeter `https://mekie-planet.com/sitemap-index.xml` no Google Search Console.
