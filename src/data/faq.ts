/* Perguntas frequentes. As respostas podem ter links em HTML. Os valores vêm dos mesmos dados do resto do site. */
import { site, formatPrice } from './site';
import { shipping } from './shipping';
import { giftCard, giftValidity } from './giftcard';
import { products } from './products';

const pt = shipping.pt;
const eu = shipping.eu;
const custom = products.find((p) => p.customizable);

export type Faq = { q: string; a: string };
export type FaqGroup = { title: string; items: Faq[] };

export const faqGroups: FaqGroup[] = [
  {
    title: 'Envios',
    items: [
      {
        q: 'Quanto tempo demora a chegar a minha encomenda?',
        a: `Em Portugal Continental, nos Açores e na Madeira, até ${pt.days} depois da confirmação do pagamento. Para a União Europeia, ${eu.days}. Quando a encomenda sai, recebes um email com o número de seguimento dos CTT.`,
      },
      {
        q: 'Quanto custam os portes?',
        a: `Em Portugal os portes custam ${formatPrice(pt.bands[0].price)} para encomendas até 500 g (uma t-shirt ou acessórios) e ${formatPrice(pt.bands[1].price)} acima disso, e são grátis a partir de ${pt.freeFrom}€. Para a União Europeia começam em ${formatPrice(eu.bands[0].price)} e dependem do peso. O valor exato aparece no checkout quando escolhes o país. Vê a <a href="/politica-de-envios-e-entregas/">tabela completa</a>.`,
      },
      {
        q: 'Enviam para os Açores e para a Madeira?',
        a: 'Sim, e pagas o mesmo que no Continente, com envio grátis nas mesmas condições.',
      },
      {
        q: 'Enviam para fora de Portugal?',
        a: `Enviamos para todos os países da União Europeia. Para outro país, <a href="/contactos/">fala connosco</a> antes de encomendar e vemos o envio contigo.`,
      },
    ],
  },
  {
    title: 'Tamanhos e peças',
    items: [
      {
        q: 'Como sei qual é o meu tamanho?',
        a: 'Os hoodies e as t-shirts são unissexo e têm um corte largo. Para o look oversized escolhe o teu tamanho habitual, para mais justo desce um. Se estiveres entre dois, escolhe o maior. Explicamos tudo neste <a href="/blog/como-escolher-o-tamanho-de-um-hoodie-oversized/">artigo sobre tamanhos</a>, e se mesmo assim tiveres dúvidas, <a href="/contactos/">fala connosco</a>.',
      },
      {
        q: 'O tamanho que quero está esgotado. Vai voltar?',
        a: 'Na página da peça, toca no tamanho esgotado e deixa o teu email. Avisamos-te uma vez, quando voltar a haver stock.',
      },
      {
        q: 'Como devo lavar as peças bordadas?',
        a: 'Do avesso, até 40 °C e sem lixívia. Não uses máquina de secar e passa a ferro só pelo avesso. Juntámos todas as dicas <a href="/blog/como-lavar-roupa-bordada/">neste artigo</a>.',
      },
      {
        q: 'Como funciona o scrunchie personalizado?',
        a: `Escolhes a cor do corpo e a cor do rebordo entre os fios disponíveis e vês logo como fica. Fazemos à mão, por encomenda, e enviamos em ${custom?.madeToOrderDays ?? 10} dias úteis. Como é feito à tua medida, não tem direito de devolução, mas está coberto pela garantia se tiver algum defeito. <a href="/produto/scrunchie-personalizado/">Criar o meu</a>.`,
      },
    ],
  },
  {
    title: 'Encomendas e pagamento',
    items: [
      {
        q: 'Que formas de pagamento aceitam?',
        a: 'MB WAY, Multibanco e cartão. Não cobramos IVA: estamos no regime de isenção do artigo 53.º do Código do IVA.',
      },
      {
        q: 'Como uso o código de 10% da newsletter?',
        a: `Subscreve a newsletter no fundo de qualquer página e recebes o código ${site.welcomeCode}. Escreve-o no checkout com o mesmo email com que subscreveste. Vale ${site.welcomeDiscount}% na primeira encomenda, uma vez por pessoa, e não se junta a outras promoções.`,
      },
      {
        q: 'Posso alterar ou cancelar uma encomenda?',
        a: `Se ainda não tiver sido enviada, sim. Escreve-nos para <a href="mailto:${site.email}">${site.email}</a> com o número da encomenda o mais depressa possível.`,
      },
    ],
  },
  {
    title: 'Trocas e devoluções',
    items: [
      {
        q: 'Posso trocar de tamanho?',
        a: 'Podes, durante 14 dias depois de receberes a encomenda. Fala connosco antes de enviar, para reservarmos o tamanho novo. Pagas o envio da peça para nós e o envio da nova é por nossa conta.',
      },
      {
        q: 'Como faço uma devolução?',
        a: `Tens 14 dias para devolver sem dizer porquê. Manda um email para <a href="mailto:${site.email}">${site.email}</a> com o número da encomenda e as peças a devolver. As peças têm de estar sem uso e com as etiquetas. Reembolsamos as peças e os portes do envio original. Mais detalhes na <a href="/politica-de-devolucoes-e-reembolsos/">política de devoluções</a>.`,
      },
      {
        q: 'A minha peça chegou com defeito. E agora?',
        a: 'Pedimos desculpa. Manda-nos fotografias por email e resolvemos sem custos para ti. Todas as peças têm a garantia legal de 3 anos.',
      },
    ],
  },
  {
    title: 'Cartão presente',
    items: [
      {
        q: 'Como funciona o cartão presente?',
        a: `Escolhes o valor (${giftCard.values.join(', ').replace(/, (\d+)$/, ' ou $1')}€, ou outro à tua medida a partir de ${giftCard.custom.min}€), escreves uma mensagem e, depois do pagamento, enviamos o cartão por email com um código único. Quem o recebe usa o código no checkout. <a href="/cartao-presente/">Oferecer um cartão</a>.`,
      },
      {
        q: 'O cartão presente tem validade?',
        a: `Sim, ${giftValidity} a contar da compra. Pode ser usado em várias encomendas até acabar o saldo.`,
      },
    ],
  },
];
