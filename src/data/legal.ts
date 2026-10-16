import { site, formatPrice } from './site';
import { shipping } from './shipping';

/* Cada bloco é um parágrafo, uma lista ou uma tabela */
export type Block = string | { list: string[] } | { table: { head: string[]; rows: string[][] } };

export type LegalPage = {
  slug: string;
  title: string;
  /** Resumo usado na meta description */
  summary: string;
  sections: { heading?: string; body: Block[] }[];
};

export const legalUpdated = '16 de outubro de 2026';

const { company, email } = site;
const seller = [company.legalName, company.nif && `NIF ${company.nif}`, `com sede na ${company.address}`]
  .filter(Boolean)
  .join(', ');
const pt = shipping.pt;
const eu = shipping.eu;

export const legalPages: LegalPage[] = [
  {
    slug: 'termos-e-condicoes-de-servico',
    title: 'Termos e Condições',
    summary: 'Condições de venda da loja online Mekie Planet: encomendas, preços, pagamento, envios, devoluções e garantia.',
    sections: [
      {
        heading: 'Quem somos',
        body: [
          `A loja online mekie-planet.com é gerida por ${seller}. Podes falar connosco pelo email ${email}.`,
          'Estes termos aplicam-se a todas as compras feitas no site. Ao fazer uma encomenda, aceitas estes termos, a Política de Envios e Entregas, a Política de Devoluções e Reembolsos e a Política de Privacidade.',
        ],
      },
      {
        heading: 'Produtos e stock',
        body: [
          'Mostramos o stock real de cada peça e de cada tamanho. Quando um tamanho esgota, aparece riscado e não é possível encomendá-lo.',
          'Algumas peças são feitas à mão por encomenda, como os scrunchies. Nesses casos, o prazo de produção aparece na página do produto e soma-se ao prazo de envio.',
          'As fotografias são das nossas peças, mas a cor pode variar ligeiramente consoante o ecrã.',
        ],
      },
      {
        heading: 'Preços',
        body: [
          'Os preços estão em euros e incluem IVA à taxa legal em vigor. Os portes de envio não estão incluídos e são apresentados no checkout antes de concluíres a encomenda.',
          'Se, por erro manifesto, um preço estiver errado, avisamos-te antes de enviar a encomenda e podes escolher entre continuar com o preço correto ou cancelar, com reembolso total.',
        ],
      },
      {
        heading: 'Encomendas',
        body: [
          'A encomenda fica confirmada quando recebes o nosso email de confirmação. Se uma peça deixar de estar disponível depois de encomendares, avisamos-te e reembolsamos o valor dessa peça no prazo máximo de 14 dias.',
        ],
      },
      {
        heading: 'Pagamento',
        body: [
          'Aceitamos MB WAY, referência Multibanco, cartão de crédito e de débito, Apple Pay e Google Pay. Os pagamentos com cartão são processados por um prestador de pagamentos certificado e a Mekie nunca vê nem guarda os dados do teu cartão.',
          'Enviamos a encomenda depois de confirmado o pagamento.',
        ],
      },
      {
        heading: 'Códigos de desconto',
        body: [
          `O código ${site.welcomeCode} dá ${site.welcomeDiscount}% de desconto na primeira encomenda a quem subscreve a newsletter. Só pode ser usado uma vez por pessoa e com o email com que subscreveste.`,
          'Os códigos não se acumulam entre si nem com outras promoções, não se aplicam aos portes de envio e não podem ser trocados por dinheiro.',
        ],
      },
      {
        heading: 'Envios, devoluções e garantia',
        body: [
          'Os destinos, preços e prazos de envio estão na Política de Envios e Entregas.',
          'Tens 14 dias para devolver uma compra sem indicar o motivo, nos termos da Política de Devoluções e Reembolsos.',
          'Todas as peças têm a garantia legal de conformidade de 3 anos a contar da entrega, prevista no Decreto-Lei n.º 84/2021. Se uma peça tiver um defeito, fala connosco e resolvemos por reparação, substituição, redução do preço ou reembolso, conforme a lei.',
        ],
      },
      {
        heading: 'Propriedade intelectual',
        body: [
          'Os desenhos Mekie, o logótipo, as fotografias e os textos do site são nossos. Não podem ser copiados nem usados sem autorização escrita.',
        ],
      },
      {
        heading: 'Lei aplicável e litígios',
        body: [
          'Estes termos regem-se pela lei portuguesa. Se tiveres um problema que não consigamos resolver contigo, podes recorrer às entidades indicadas na página Resolução de Litígios ou ao Livro de Reclamações Eletrónico.',
          `Podemos atualizar estes termos. A versão aplicável é a que estava publicada no dia da tua encomenda. Última atualização: ${legalUpdated}.`,
        ],
      },
    ],
  },
  {
    slug: 'politica-de-envios-e-entregas',
    title: 'Política de Envios e Entregas',
    summary: `Envios CTT para Portugal (${formatPrice(pt.price)}, grátis acima de ${pt.freeFrom}€) e União Europeia (grátis acima de ${eu.freeFrom}€). Prazos e seguimento.`,
    sections: [
      {
        heading: 'Para onde enviamos',
        body: [
          'Enviamos pelos CTT para Portugal Continental, Açores, Madeira e todos os países da União Europeia. Para outros países, fala connosco antes de encomendar.',
        ],
      },
      {
        heading: 'Preços',
        body: [
          {
            table: {
              head: ['Destino', 'Portes', 'Envio grátis'],
              rows: [
                ['Portugal Continental, Açores e Madeira', formatPrice(pt.price), `acima de ${pt.freeFrom}€`],
                ['União Europeia, até 1 kg', formatPrice(eu.bands[0].price), `acima de ${eu.freeFrom}€`],
                ['União Europeia, mais de 1 kg', formatPrice(eu.bands[1].price), `acima de ${eu.freeFrom}€`],
              ],
            },
          },
          'O valor exato aparece no checkout quando escolhes o país. O envio grátis conta pelo valor dos artigos antes de descontos. Os Açores e a Madeira pagam o mesmo que o Continente.',
          'Para referência, uma t-shirt ou um acessório pesam menos de 300 g e um hoodie cerca de 700 g.',
        ],
      },
      {
        heading: 'Prazos',
        body: [
          {
            list: [
              `Portugal Continental, Açores e Madeira: até ${pt.days} após a confirmação do pagamento.`,
              `União Europeia: ${eu.days} após a confirmação do pagamento.`,
              'Peças feitas por encomenda: ao prazo de envio soma-se o prazo de produção indicado na página do produto.',
            ],
          },
          'Em épocas festivas ou de saldos os prazos podem ser um pouco maiores. Se houver um atraso, avisamos-te por email.',
        ],
      },
      {
        heading: 'Seguimento da encomenda',
        body: ['Quando a encomenda sai, enviamos-te um email com o número de seguimento dos CTT.'],
      },
      {
        heading: 'Morada e entrega',
        body: [
          'Confirma bem a morada no checkout. Se a encomenda voltar para nós por morada incompleta ou por não ter sido levantada, voltamos a enviá-la depois de pagares os novos portes, ou reembolsamos o valor dos artigos.',
          `Se a encomenda chegar danificada ou faltar alguma peça, envia-nos fotografias para ${email} e resolvemos sem custos para ti.`,
        ],
      },
      {
        heading: 'Impostos',
        body: ['Os preços incluem IVA. Nos envios para a União Europeia não há taxas alfandegárias.'],
      },
    ],
  },
  {
    slug: 'politica-de-devolucoes-e-reembolsos',
    title: 'Política de Devoluções e Reembolsos',
    summary: 'Tens 14 dias para devolver sem indicar o motivo. Como devolver, trocar de tamanho e quando recebes o reembolso.',
    sections: [
      {
        heading: 'Direito de livre resolução',
        body: [
          'Tens 14 dias seguidos, a contar do dia em que recebes a encomenda, para desistir da compra sem indicar o motivo, nos termos do Decreto-Lei n.º 24/2014.',
        ],
      },
      {
        heading: 'Como devolver',
        body: [
          {
            list: [
              `Envia-nos um email para ${email} com o número da encomenda e as peças que queres devolver. Também podes usar o formulário de livre resolução que está no fim desta página.`,
              'Respondemos com a morada para onde enviar.',
              'Envia as peças no prazo de 14 dias a contar do teu email.',
            ],
          },
          'Os portes da devolução são por tua conta. Recomendamos um envio com seguimento.',
        ],
      },
      {
        heading: 'Estado das peças',
        body: [
          'Podes experimentar as peças como numa loja. Se uma peça voltar usada, lavada ou com as etiquetas retiradas, podemos descontar ao reembolso a desvalorização causada.',
        ],
      },
      {
        heading: 'Reembolso',
        body: [
          'Reembolsamos o valor das peças e os portes do envio original (até ao valor do envio normal) no prazo de 14 dias a contar da tua comunicação, pelo mesmo meio de pagamento. Podemos esperar até receber as peças ou até nos enviares o comprovativo de envio, o que acontecer primeiro.',
          'Se devolveres só parte de uma encomenda, os portes do envio original não são reembolsados.',
        ],
      },
      {
        heading: 'Trocas de tamanho',
        body: [
          'Para trocar de tamanho, fala connosco antes de devolver. Se houver stock, reservamos a peça. Pagas o envio da peça para nós e o envio da nova peça é por nossa conta.',
        ],
      },
      {
        heading: 'Peças personalizadas',
        body: [
          'Os scrunchies personalizados são feitos com as cores que escolhes e, por isso, não têm direito de livre resolução (artigo 17.º do Decreto-Lei n.º 24/2014). Continuam cobertos pela garantia legal se tiverem algum defeito.',
        ],
      },
      {
        heading: 'Peças com defeito',
        body: [
          'Se uma peça tiver um defeito ou não corresponder à encomenda, fala connosco. Os portes, nesse caso, são por nossa conta e tens a garantia legal de 3 anos.',
        ],
      },
      {
        heading: 'Formulário de livre resolução',
        body: [
          'Copia este texto para o email e preenche:',
          `Para: ${seller}, ${email}.`,
          'Comunico que desisto do contrato de compra das seguintes peças: [peças]. Encomenda n.º [número], recebida em [data]. Nome: [nome]. Morada: [morada]. Data: [data].',
        ],
      },
    ],
  },
  {
    slug: 'politica-de-privacidade',
    title: 'Política de Privacidade',
    summary: 'Que dados pessoais recolhemos, para quê, com quem os partilhamos, durante quanto tempo e quais são os teus direitos.',
    sections: [
      {
        heading: 'Responsável pelos dados',
        body: [`${seller}. Para qualquer assunto sobre os teus dados, escreve para ${email}.`],
      },
      {
        heading: 'Que dados recolhemos e para quê',
        body: [
          {
            table: {
              head: ['Situação', 'Dados', 'Para quê e com que base'],
              rows: [
                ['Encomenda', 'Nome, email, telemóvel, morada, NIF (opcional) e artigos', 'Processar, faturar e enviar a encomenda. Execução do contrato e obrigações fiscais.'],
                ['Newsletter', 'Email e data de subscrição', 'Enviar novidades e o código de boas-vindas, e confirmar que o código só é usado uma vez. Consentimento.'],
                ['Contacto', 'Nome, email e mensagem', 'Responder ao teu pedido. Diligências pedidas por ti.'],
              ],
            },
          },
          'Não usamos os teus dados para decisões automáticas nem para criar perfis.',
        ],
      },
      {
        heading: 'Com quem partilhamos',
        body: [
          'Só com quem precisamos para a loja funcionar, e apenas os dados necessários:',
          {
            list: [
              'CTT, para entregar a encomenda.',
              'O prestador de pagamentos (Stripe), para processar o pagamento com segurança.',
              'Vercel, que aloja o site.',
              'Google, onde guardamos a lista da newsletter (Google Sheets).',
              'O nosso contabilista, para a faturação.',
            ],
          },
          'Alguns destes serviços podem tratar dados fora da União Europeia. Nesses casos, a transferência está protegida pelo Quadro de Privacidade de Dados UE-EUA ou por cláusulas contratuais-tipo aprovadas pela Comissão Europeia.',
          'Neste momento não usamos ferramentas de estatísticas nem de publicidade no site. Se passarmos a usar, pedimos o teu consentimento antes e atualizamos esta política e a Política de Cookies.',
        ],
      },
      {
        heading: 'Durante quanto tempo',
        body: [
          {
            list: [
              'Dados das encomendas e faturas: 10 anos, como exige a lei fiscal.',
              'Newsletter: até cancelares a subscrição. Cada email tem um link para o fazer.',
              'Mensagens de contacto: até 2 anos depois do último contacto.',
            ],
          },
        ],
      },
      {
        heading: 'Os teus direitos',
        body: [
          `Podes pedir o acesso, a correção, o apagamento, a limitação ou a portabilidade dos teus dados, opor-te ao seu tratamento e retirar o consentimento a qualquer momento. Basta escreveres para ${email}. Respondemos no prazo máximo de um mês.`,
          'Também podes apresentar reclamação à Comissão Nacional de Proteção de Dados (www.cnpd.pt).',
        ],
      },
      {
        heading: 'Segurança e menores',
        body: [
          'O site usa ligação segura (HTTPS) e só quem precisa tem acesso aos dados. A newsletter destina-se a maiores de 16 anos.',
          `Última atualização: ${legalUpdated}.`,
        ],
      },
    ],
  },
  {
    slug: 'politica-de-cookies',
    title: 'Política de Cookies',
    summary: 'O site da Mekie não usa cookies de publicidade nem de estatísticas. Vê o que guardamos no teu browser e porquê.',
    sections: [
      {
        heading: 'O que são cookies',
        body: [
          'Cookies são pequenos ficheiros que um site guarda no teu browser. Há também o armazenamento local (localStorage), que funciona de forma parecida. Esta política explica os dois.',
        ],
      },
      {
        heading: 'O que usamos',
        body: [
          'O site da Mekie não usa cookies de publicidade, de estatísticas nem de redes sociais, e não partilha nada do que guarda no teu browser com outras empresas. As fontes e as imagens são servidas pelo nosso próprio site.',
          'Guardamos apenas o necessário para a loja funcionar e para lembrar as tuas escolhas:',
          {
            table: {
              head: ['Nome', 'Para quê', 'Duração'],
              rows: [
                ['mekie-cart-v1', 'Guardar o teu carrinho', 'Até esvaziares o carrinho'],
                ['mekie-code-applied', 'Lembrar o código de desconto que aplicaste', 'Até o removeres'],
                ['mekie-newsletter, mekie-newsletter-outcome, mekie-newsletter-emails', 'Saber que já subscreveste a newsletter, para não voltar a mostrar o pop up', 'Até limpares os dados do browser'],
                ['mekie-popup-closed', 'Não voltar a mostrar o pop up durante 7 dias depois de o fechares', '7 dias'],
                ['mekie-grid', 'Lembrar se preferes ver a loja com 2 ou 4 colunas', 'Até limpares os dados do browser'],
              ],
            },
          },
          'Como são todos necessários ou ligados a escolhas tuas, não precisam de consentimento e por isso não mostramos um aviso de cookies.',
        ],
      },
      {
        heading: 'Pagamentos',
        body: [
          'Quando pagas com cartão, MB WAY ou Multibanco, o pagamento é feito numa página segura do prestador de pagamentos (Stripe), que pode usar cookies próprios para prevenir fraude. Esses cookies são da responsabilidade da Stripe e estão descritos na política de cookies dela.',
        ],
      },
      {
        heading: 'Como apagar',
        body: [
          'Podes apagar os cookies e os dados do site nas definições do teu browser, em Privacidade ou Dados de navegação. Se o fizeres, o carrinho fica vazio.',
          `Se um dia passarmos a usar cookies de estatísticas ou de publicidade, pedimos o teu consentimento antes e atualizamos esta página. Última atualização: ${legalUpdated}.`,
        ],
      },
    ],
  },
  {
    slug: 'resolucao-de-litigios',
    title: 'Resolução de Litígios',
    summary: 'Entidades de resolução alternativa de litígios de consumo e Livro de Reclamações Eletrónico.',
    sections: [
      {
        body: [
          `Se tiveres um problema com uma compra, fala primeiro connosco pelo email ${email}. Tentamos sempre resolver diretamente.`,
          'Se não chegarmos a acordo, podes recorrer a uma entidade de resolução alternativa de litígios de consumo, nos termos da Lei n.º 144/2015:',
          {
            list: [
              'CNIACC, Centro Nacional de Informação e Arbitragem de Conflitos de Consumo (www.cniacc.pt).',
              'Centro de Arbitragem de Conflitos de Consumo de Lisboa (www.centroarbitragemlisboa.pt).',
            ],
          },
          'Mais informação no Portal do Consumidor (www.consumidor.gov.pt). Também podes apresentar reclamação no Livro de Reclamações Eletrónico (www.livroreclamacoes.pt).',
        ],
      },
    ],
  },
];
