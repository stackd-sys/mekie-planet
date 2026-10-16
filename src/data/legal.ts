export type LegalPage = {
  slug: string;
  title: string;
  sections: { heading?: string; body: string[] }[];
};

export const legalPages: LegalPage[] = [
  {
    slug: 'politica-de-devolucoes-e-reembolsos',
    title: 'Política de Devoluções e Reembolsos',
    sections: [
      {
        heading: 'Direito de livre resolução',
        body: ['Nos termos da lei, o cliente dispõe de um prazo de 14 dias seguidos após a receção da encomenda para proceder à devolução do produto, sem necessidade de indicar o motivo.'],
      },
      {
        heading: 'Condições de devolução',
        body: [
          'Para que a devolução seja aceite, o artigo deve:',
          '• Estar nas condições originais em que foi recebido.',
          '• Não apresentar sinais de uso, lavagem ou danos.',
          '• Manter as etiquetas originais intactas.',
        ],
      },
      {
        heading: 'Custos de devolução',
        body: ['Os custos de transporte associados à devolução (portes de envio) são da inteira responsabilidade do cliente.'],
      },
      {
        heading: 'Reembolsos',
        body: ['Após a receção e verificação do estado do produto, o reembolso será processado através do mesmo método de pagamento utilizado na compra original, num prazo máximo de 14 dias.'],
      },
    ],
  },
  {
    slug: 'politica-de-envios-e-entregas',
    title: 'Política de Envios e Entregas',
    sections: [
      {
        heading: 'Destinos e transportadora',
        body: ['Realizamos envios para Portugal Continental, Regiões Autónomas (Madeira e Açores) e países da Europa. Todas as encomendas são enviadas através dos CTT.'],
      },
      {
        heading: 'Prazos de entrega',
        body: ['O prazo estimado de entrega é de 7 dias úteis após a confirmação do pagamento da encomenda. Note que em épocas festivas ou de saldos, este prazo poderá sofrer ligeiras alterações.'],
      },
      {
        heading: 'Custos de envio',
        body: [
          'Envio gratuito: para encomendas de valor igual ou superior a 65€.',
          'Restantes envios: o custo do envio é calculado e apresentado de forma transparente no momento do checkout, antes de finalizar o pagamento.',
        ],
      },
    ],
  },
  {
    slug: 'politica-de-privacidade',
    title: 'Política de Privacidade',
    sections: [
      {
        body: ['A Mekie Planet valoriza a confiança dos seus clientes e garante a proteção dos seus dados pessoais, em conformidade com o Regulamento Geral de Proteção de Dados (RGPD).'],
      },
      {
        heading: 'Recolha e uso de dados',
        body: ['Os dados recolhidos (nome, morada, email e telefone) destinam-se exclusivamente ao processamento, faturação e envio da sua encomenda.'],
      },
      {
        heading: 'Partilha com terceiros',
        body: [
          'Para garantir a operação da loja, partilhamos dados estritamente necessários com:',
          '• CTT: para a entrega física das encomendas.',
          '• Stripe: para o processamento seguro de pagamentos.',
          '• Análise: utilizamos Google Analytics 4 (GA4) e Meta Pixel para compreender o comportamento dos utilizadores no site e otimizar a nossa oferta.',
        ],
      },
      {
        heading: 'Direitos do utilizador',
        body: ['A qualquer momento, pode solicitar o acesso, retificação ou eliminação dos seus dados pessoais enviando um email para geral@mekie-planet.com.'],
      },
    ],
  },
  {
    slug: 'resolucao-de-litigios',
    title: 'Resolução de Litígios',
    sections: [
      {
        body: [
          'Em caso de litígio, o consumidor pode recorrer a uma Entidade de Resolução Alternativa de Litígios de Consumo.',
          'Exemplo: Centro de Arbitragem de Conflitos de Consumo de Lisboa (www.centroarbitragemlisboa.pt).',
          'Para mais informações, consulte o Portal do Consumidor em www.consumidor.gov.pt.',
        ],
      },
    ],
  },
  {
    slug: 'termos-e-condicoes-de-servico',
    title: 'Termos e Condições de Serviço',
    sections: [
      {
        heading: 'Condições gerais',
        body: ['Os presentes Termos e Condições regulam a venda, incluindo o registo e a encomenda dos produtos da Mekie Planet através do website https://mekie-planet.com/.'],
      },
      {
        heading: 'Identificação do vendedor',
        body: ['A Mekie Planet, com sede na Rua Dr. Eduardo Burnay 26B, 2655-420 Ericeira, é a proprietária e gestora da loja online. Para qualquer questão, pode contactar-nos através do email geral@mekie-planet.com.'],
      },
      {
        heading: 'Processo de compra',
        body: [
          'Acesso: a Mekie Planet permite a compra de produtos como convidado, não sendo obrigatória a criação de conta de cliente.',
          'Produtos: especializamo-nos na venda de vestuário. As imagens apresentadas são ilustrativas, podendo ocorrer ligeiras variações de cor devido às definições de cada ecrã.',
          'Preços: todos os preços apresentados incluem IVA à taxa legal em vigor.',
        ],
      },
      {
        heading: 'Métodos de pagamento',
        body: [
          'Aceitamos os seguintes métodos de pagamento seguros:',
          '• MB Way e Referência Multibanco.',
          '• Cartão de Crédito (via Stripe).',
          '• Apple Pay e Google Pay.',
        ],
      },
    ],
  },
];
