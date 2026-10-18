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

O carrinho funciona no browser (guardado em `localStorage`). No checkout, a encomenda é gravada no CRM (`/api/encomenda/`): o servidor volta a calcular preços, stock, portes, códigos e cartões presente, o cliente recebe um email com o resumo e a Mekie recebe um aviso. Respondem depois com os dados de pagamento. Se o CRM não estiver disponível, o checkout abre o email do cliente com o resumo, como antes.

Na fase seguinte liga-se o pagamento online (Stripe com MB WAY, Multibanco, cartão, Apple Pay e Google Pay).

## Newsletter e 10% de boas-vindas

O pop up e o formulário do rodapé guardam o email no CRM (`/api/newsletter/`) e mostram o código `MEKIE10`. O CRM não deixa o mesmo email entrar duas vezes e, no checkout, confirma que o código de boas-vindas é usado por quem subscreveu e só uma vez.

O código e a percentagem iniciais estão em `welcomeCode` e `welcomeDiscount` (`src/data/site.ts`); depois gerem-se em CRM > Códigos e links.

## Cartão presente

Página em `/cartao-presente/` (valores, nomes e validade em `src/data/giftcard.ts`). O cartão é digital: não tem portes, não conta para o envio grátis e os códigos de desconto não se aplicam a ele.

Quando uma encomenda com cartões é marcada como paga no CRM, cada cartão é criado com um código único (ex.: `MEKIE-7KQ2-XH9D`) e enviado por email a quem o recebe. No checkout, o cliente escreve o código, o site mostra o saldo e desconta-o; o saldo baixa quando essa encomenda é marcada como paga. Em CRM > Cartões presente criam-se cartões à mão e ajustam-se saldos.

## Avisa-me quando voltar

Nos tamanhos esgotados (e nos produtos esgotados) o cliente deixa o email. Os pedidos aparecem em CRM > Newsletter e avisos e no Stock. Quando houver reposição, o botão "Enviar aviso agora" manda o email a todos os que pediram aquele tamanho.

## Perguntas frequentes

Em `src/data/faq.ts`. Os preços e prazos vêm dos mesmos dados do resto do site, por isso mudam sozinhos.

## CRM

Painel privado em `/admin/` (login por link enviado por email, só para os emails em `ADMIN_EMAILS`). Tem:

- **Painel**: vendas, encomendas, valor médio, visitas, conversão, vendas por dia, mais vendidos, esgotados e o que falta tratar.
- **Encomendas**: lista por estado, detalhe, mudança de estado (paga tira do stock, cancelada devolve), número de seguimento CTT com email ao cliente, folha de envio para imprimir, notas internas, vendas registadas à mão (Instagram, feiras, em mão).
- **Clientes**: histórico, total gasto, grupos (uma compra, voltaram a comprar, sem comprar há 6 meses, só newsletter), notas, exportação CSV.
- **Stock e produtos**: preço e stock por tamanho, pedidos de aviso; ao guardar, o site volta a ser construído com os valores novos.
- **Trocas e devoluções**: registo a partir da encomenda; as peças voltam ao stock quando chegam.
- **Newsletter e avisos**, **Cartões presente**, **Códigos e links** (códigos de desconto com regras, gerador de links com `utm_*` e vendas por origem).
- **Analytics e campanhas**: Google Analytics 4 (visitas, origem, funil até à compra, peças mais vistas), campanhas Meta e campanhas Google (via Analytics).

O código está em `src/pages/admin/`, `src/pages/api/` e `src/lib/server/`. As tabelas da base de dados são criadas sozinhas no primeiro acesso.

### Configurar na Vercel

Tudo em Vercel > projeto `mekie-planet` > Settings > Environment Variables. Depois de juntar variáveis, faz Deployments > Redeploy.

1. **Base de dados (obrigatório).** Vercel > Storage > Create Database > Neon (Postgres), região Frankfurt, ligada ao projeto. Cria sozinha a variável `DATABASE_URL`. Em Settings > Functions, põe a Function Region em Frankfurt (`fra1`), perto da base de dados.
2. **Acessos (obrigatório).** `ADMIN_EMAILS` = os emails da Rita e do Rafael, separados por vírgula.
3. **Emails (recomendado).** Cria conta em [resend.com](https://resend.com), junta o domínio `mekie-planet.com` (registos DNS que a Resend indica) e cria uma API key. Variáveis: `RESEND_API_KEY` e `MAIL_FROM` (ex.: `Mekie Planet <geral@mekie-planet.com>`). Opcional: `ORDERS_EMAIL`, para onde vão os avisos de nova encomenda (por omissão, `geral@mekie-planet.com`).
   Enquanto a Resend não estiver ligada, podes entrar com `ADMIN_PASSWORD` (12 caracteres ou mais): a página de entrada mostra o campo da palavra-passe.
4. **Atualização automática do site (recomendado).** Settings > Git > Deploy Hooks > criar um hook para o ramo `main`. Variável: `VERCEL_DEPLOY_HOOK` com o URL.
5. **Google Analytics (opcional).** Na [Google Cloud](https://console.cloud.google.com/), cria um projeto, ativa a "Google Analytics Data API", cria uma conta de serviço e uma chave JSON. No Google Analytics, Administração > Gestão de acessos à propriedade, junta o email da conta de serviço como Leitor. Variáveis: `GA4_PROPERTY_ID` (o número da propriedade, em Administração > Detalhes da propriedade) e `GOOGLE_SERVICE_ACCOUNT` (o conteúdo do ficheiro JSON).
6. **Campanhas Google (opcional).** No Google Analytics, Administração > Ligações de produtos > Ligações do Google Ads, liga a conta do Google Ads. Os custos e cliques aparecem no CRM através do Analytics.
7. **Meta (opcional).** No [Meta Business](https://business.facebook.com/), Definições > Utilizadores do sistema: cria um utilizador de sistema, dá-lhe acesso à conta de anúncios e gera um token com a permissão `ads_read`. Variáveis: `META_ACCESS_TOKEN` e `META_AD_ACCOUNT_ID` (o número da conta de anúncios).
8. Opcional: `CTT_TRACK_URL`, se o link de seguimento dos CTT mudar (usa `{code}` no sítio do número).

### Pagamentos (Stripe)

O checkout grava a encomenda no CRM e manda o cliente para a página de pagamento da Stripe (Checkout). Quando a Stripe confirma o pagamento, a encomenda passa a "paga" sozinha: o stock sai, os cartões presente são criados e enviados, e o cliente e a Mekie recebem um email. Multibanco fica "a aguardar pagamento" até a referência ser paga. Se a página de pagamento expirar, a encomenda é cancelada. Uma encomenda paga por inteiro com cartão presente não passa pela Stripe.

1. No painel da Stripe, escolher "Checkout pré-construído".
2. Definições > Pagamentos > Métodos de pagamento: ligar Cartões, MB WAY, Multibanco, Apple Pay e Google Pay.
3. Programadores > Chaves da API > Criar chave secreta > Permissões personalizadas: **Checkout Sessions** e **Refunds** em Escrever, o resto em Nenhum. Copiar a chave (`rk_live_...` ou `sk_live_...`) para `STRIPE_SECRET_KEY` na Vercel.
4. Programadores > Webhooks > Adicionar destino: URL `https://<o-site>/api/stripe/webhook/`, eventos `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.succeeded` e `charge.refunded`. Copiar o segredo de assinatura (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`.
5. Redeploy na Vercel.

Primeiro em modo de teste (chaves `sk_test_...`, cartão de teste `4242 4242 4242 4242`). Para vender a sério, ativar a conta (dados da empresa e IBAN), trocar para as chaves `sk_live_...`, criar o webhook também em modo real e fazer Redeploy. Reembolsos: na encomenda, no CRM, em "Reembolsar pela Stripe" (total ou parte, com email ao cliente). Os reembolsos feitos diretamente no painel da Stripe também aparecem na encomenda, pelo evento `charge.refunded`. Quando o valor todo é devolvido, a encomenda muda sozinha: por enviar passa a cancelada (as peças voltam ao stock), já enviada passa a devolvida, e os cartões presente comprados nela ficam sem saldo. Num reembolso parcial o estado não muda.

### Correr o CRM localmente

Com um Postgres local: `DATABASE_URL=postgres://... ADMIN_EMAILS=eu@x.pt npm run build && node dist/server/entry.mjs`. Sem `RESEND_API_KEY`, o link de entrada aparece no terminal.

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

### Mudar para o domínio oficial

No código não há nada a mudar: o site já usa `https://mekie-planet.com` nos links canónicos, no sitemap e nos emails (`site.url` em `src/data/site.ts`).

1. **Antes de mexer no DNS**, tirar do WooCommerce o que ainda fizer falta (encomendas antigas, clientes, newsletter). O site antigo deixa de abrir quando o domínio passar para a Vercel.
2. **Vercel > Settings > Domains**: juntar `mekie-planet.com` e `www.mekie-planet.com` (o `www` a reencaminhar para o principal) e copiar os registos DNS que a Vercel indica para o sítio onde o domínio está registado.
3. **No DNS, mudar só os registos do site** (`A` / `CNAME`). Não apagar os registos `MX` nem os `TXT` do email, senão o `geral@mekie-planet.com` deixa de receber mensagens.
4. **Stripe > Desenvolvedores > Webhooks**: editar o destino e trocar o URL para `https://mekie-planet.com/api/stripe/webhook/`. O segredo `whsec_` não muda. A Stripe não segue reencaminhamentos: se o URL ficar o antigo, os pagamentos entram mas as encomendas não passam a "paga". Na conta de produção, criar o webhook já com o domínio oficial.
5. **Stripe > Configurações > Dados da empresa**: pôr o site oficial.
6. **Google Search Console**: criar a propriedade do domínio e enviar o sitemap. Os URLs antigos do WooCommerce já reencaminham para os novos (`vercel.json`).
7. **Google Analytics**: em Administração > Fluxos de dados, atualizar o URL do site. **Meta**: verificar o domínio no Business Manager (Segurança da marca > Domínios).
8. Atualizar o link na bio do Instagram e noutras redes, se apontar para o endereço da Vercel.

## Por fazer

Feito (17 de outubro): domínio mekie-planet.com na Vercel (o www reencaminha), base de dados Neon em Frankfurt, `ADMIN_EMAILS`, Resend com o domínio verificado, Stripe em modo de teste com webhook (compra de teste paga por MB WAY e confirmada no CRM).

Pendente da Mekie:

- [ ] Stripe em produção: ativar a conta (dados da empresa e IBAN), ligar as formas de pagamento na conta de produção (cartões, MB WAY, Multibanco, Apple Pay, Google Pay), criar o webhook de produção e trocar `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` na Vercel pelos de produção.
- [ ] Criar a caixa de email geral@mekie-planet.com (o domínio não tem registos MX, por isso as respostas dos clientes não chegam).
- [ ] Opcional no CRM: Deploy Hook, Google Analytics e Meta (ver "Configurar na Vercel").
- [ ] Google Search Console (enviar o sitemap) e Google Merchant Center.
- [ ] Enviar as fotos das peças vestidas e a foto e o preço do crewneck.
- [ ] Se já tinham emails na Google Sheet da newsletter, importá-los em CRM > Newsletter e avisos > Importar.

Fechado: preço das totes (25€), textos das opiniões confirmados por cada pessoa, preço e cores do scrunchie personalizado. A Google Sheet e o Apps Script já não são precisos (substituídos pelo CRM).

Próximas fases do site:

1. CRM em app.mekie-planet.com: o código está feito e só liga com a variável `ADMIN_HOST`. Passos: em Vercel > Domains, adicionar `app.mekie-planet.com` (ligado a Production); na Hostinger, criar o CNAME `app` com o valor que a Vercel indicar; quando o domínio ficar verde, juntar `ADMIN_HOST=app.mekie-planet.com` e fazer Redeploy. O `mekie-planet.com/admin/` passa a reencaminhar para lá e o resto do subdomínio volta para a loja (`vercel.json`). É preciso entrar outra vez no CRM, porque a sessão fica presa ao endereço.
2. Traduções em espanhol e inglês (`/es/` e `/en/`), com os textos em português fechados.
3. Mais tarde: conta de cliente com login por email. Campanha de Natal quando fizer sentido.
