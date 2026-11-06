/* Artigos do blog. Cada bloco é um parágrafo (pode ter links em HTML), um subtítulo ou uma lista. */

export type PostBlock = string | { h: string } | { list: string[] } | { img: string; alt: string };

export type Post = {
  slug: string;
  title: string;
  /** Resumo para a listagem e para o Google */
  description: string;
  /** AAAA-MM-DD */
  date: string;
  image: string;
  imageAlt: string;
  body: PostBlock[];
  /** Nota no topo do artigo a partir de uma data (AAAA-MM-DDTHH:MM:SSZ), por exemplo quando uma promoção acaba */
  notice?: { from: string; html: string };
};

const posts: Post[] = [
  {
    slug: 'sao-martinho-magusto-castanhas',
    title: 'São Martinho: castanhas, magusto e um hoodie quente',
    description: 'A 11 de novembro há magusto, castanhas assadas e, com sorte, o Verão de São Martinho. A história da tradição e o que levar vestido para a fogueira.',
    date: '2026-11-09',
    image: '/images/lookbook/mushrooms-hoodie-yellow.webp',
    imageAlt: 'Rapaz com o hoodie Cogumelos amarelo pastel, fotografado de perto',
    body: [
      'Há poucas tradições tão portuguesas como o São Martinho. A 11 de novembro, um pouco por todo o país, junta-se gente à volta de uma fogueira, assam-se castanhas e conversa-se até tarde. Este ano calha a uma quarta-feira, por isso o magusto deve ficar para o fim de semana, como quase sempre acontece.',
      { h: 'A história da capa partida ao meio' },
      'Conta a lenda que Martinho, um soldado romano, ia a cavalo num dia de chuva e frio quando encontrou um mendigo quase sem roupa. Sem pensar duas vezes, cortou a sua capa ao meio com a espada e deu-lhe metade. Nesse momento, o céu abriu e o sol apareceu. É daí que vem o nome Verão de São Martinho, aqueles dias de sol que muitas vezes aparecem por esta altura, a meio do outono.',
      'Gostamos desta história por um motivo simples: é sobre partilhar o que nos aquece. E se há peça que faz esse papel hoje em dia, é um hoodie.',
      { h: 'O que levar vestido para o magusto' },
      'Um magusto é ao ar livre, ao fim da tarde, com fogo, fumo e um frio que só se sente quando te afastas da fogueira. A nossa sugestão:',
      {
        list: [
          'Um <a href="/loja/hoodies-crewnecks/">hoodie</a> por cima de uma t-shirt. Se o sol aparecer, tiras o hoodie. Quando o sol se põe, puxas o capuz.',
          'Uma <a href="/loja/caps/">cap de bombazina</a>, que aguenta o vento e não te deixa o cabelo a cheirar a fumo.',
          'Umas <a href="/loja/meias/">meias de cano médio</a>, porque os pés são os primeiros a sentir o frio da relva.',
          'Uma <a href="/loja/tote-bag/">tote bag</a> para levar as castanhas, uma manta e o que sobrar para casa.',
        ],
      },
      { h: 'Castanhas perfeitas, sem queimar os dedos' },
      'Faz um golpe em cada castanha antes de ir ao lume, para não rebentarem. Assa-as na fogueira, num assador furado, ou no forno a 200 °C durante cerca de 20 minutos. Embrulha-as num pano ou em jornal durante uns minutos depois de saírem do lume: a pele sai muito mais fácil.',
      { h: 'E o cheiro a fumo?' },
      'É o preço de uma boa noite de magusto. No dia seguinte, areja a roupa e, quando a lavares, vira-a do avesso e usa água a 30 °C. O bordado fica protegido e o cheiro vai embora à primeira. Tens mais dicas no artigo sobre <a href="/blog/como-lavar-roupa-bordada/">como lavar roupa bordada</a>.',
      'Bom São Martinho! E lembra-te: em novembro os hoodies, as t-shirts e as crewnecks estão com desconto na <a href="/loja/">loja</a>.',
    ],
  },
  {
    slug: 'prendas-de-natal-guia-mekie',
    title: 'Prendas de Natal 2026: guia Mekie por preço',
    description: 'Ideias de prendas de Natal de 15€ a 70€, para todos os gostos, e as datas para encomendar a tempo de chegar antes do dia 25.',
    date: '2026-11-16',
    image: '/images/lookbook/cap-brown-sweat-duo.webp',
    imageAlt: 'Duas raparigas, uma com cap castanho e t-shirt Cogumelos preta, outra com crewneck Mekie crua',
    notice: {
      from: '2026-12-01T00:00:00Z',
      html: 'A Black November terminou a 30 de novembro e os preços deste guia são agora os normais. As datas para chegar antes do Natal continuam válidas.',
    },
    body: [
      'Todos os anos é igual: dezembro chega, as listas crescem e o tempo encolhe. Este ano tratamos disso mais cedo. Juntámos as nossas ideias de prendas por preço, para acertares no orçamento e na pessoa, e as datas para a encomenda chegar antes do Natal.',
      'Até 30 de novembro, os hoodies, as t-shirts e as crewnecks têm -15% e há packs de duas peças com desconto. Os preços abaixo são os normais.',
      { h: 'Até 20€: o pormenor que faz sorrir' },
      {
        list: [
          '<a href="/loja/scrunchies/">Scrunchie de crochet</a>, 15€. Feito à mão por nós. Se quiseres, escolhes as duas cores no personalizado.',
          '<a href="/loja/meias/">Meias Mekie</a>, 20€. Com o logótipo ou com o esqueleto, para quem gosta de um toque divertido nos pés.',
        ],
      },
      { h: 'Até 30€: para acertar sem saber o tamanho' },
      'Os acessórios são a prenda certa quando não sabes o tamanho de quem vai receber.',
      {
        list: [
          '<a href="/loja/tote-bag/">Tote bag bordada</a>, 25€. Algodão orgânico, com planetas ou cogumelos.',
          '<a href="/loja/caps/">Cap de bombazina</a>, 30€. Tamanho único e ajustável, em quatro cores.',
          '<a href="/loja/bucket-hat/">Bucket hat</a>, 30€. Para quem já está a pensar no verão.',
        ],
      },
      { h: 'Até 70€: a prenda principal' },
      {
        list: [
          '<a href="/loja/t-shirts/">T-shirt oversized bordada</a>, 50€.',
          '<a href="/loja/hoodies-crewnecks/">Crewneck</a>, 65€.',
          '<a href="/loja/hoodies-crewnecks/">Hoodie</a>, 70€. A prenda que vai ser usada todos os dias até à primavera.',
        ],
      },
      'Se tens dúvidas com o tamanho, o nosso <a href="/blog/como-escolher-o-tamanho-de-um-hoodie-oversized/">guia de tamanhos dos hoodies</a> ajuda. E se não acertares, há troca.',
      { h: 'Não sabes o que escolher?' },
      'O <a href="/cartao-presente/">cartão presente</a> é digital e chega por email, por isso serve mesmo à última hora. Há valores de 25€, 50€, 75€ e 100€, ou escolhes tu o valor. Fica válido durante 12 meses e a pessoa escolhe o que quiser na loja.',
      { h: 'Até quando encomendar' },
      'Os envios são feitos pelos CTT. Contando com o feriado de 8 de dezembro, estas são as datas que recomendamos para a encomenda chegar antes do Natal:',
      {
        list: [
          'Portugal: até 14 de dezembro.',
          'Resto da União Europeia: até 1 de dezembro.',
          'Scrunchie personalizado: até 4 de dezembro, porque é feito à mão e a entrega demora cerca de 10 dias úteis.',
          'Cartão presente: até dia 24, porque chega por email.',
        ],
      },
      'Bom Natal, e boas compras na <a href="/loja/">loja Mekie</a>!',
    ],
  },
  {
    slug: 'cyber-monday-2026',
    title: 'Cyber Monday 2026: o último dia da Black November',
    description: 'A Cyber Monday é a 30 de novembro e é também o último dia da Black November na Mekie. O que está em promoção e como aproveitar até à meia-noite.',
    date: '2026-11-23',
    image: '/images/lookbook/stack-leaves.webp',
    imageAlt: 'Hoodies e t-shirts Mekie com cogumelos bordados e um bucket hat, entre folhas',
    notice: {
      from: '2026-12-01T00:00:00Z',
      html: 'A Cyber Monday e a Black November 2026 já terminaram e os preços deste artigo deixaram de estar em vigor. Vê os <a href="/loja/">preços atuais na loja</a> e <a href="#newsletter">subscreve a newsletter</a> para saberes primeiro da próxima promoção.',
    },
    body: [
      'A Cyber Monday é a segunda-feira a seguir à Black Friday. Nasceu nos Estados Unidos, quando as lojas online começaram a fazer descontos próprios depois do fim de semana de compras nas lojas físicas. Hoje é o dia em que muita gente fecha as compras que ficaram a pensar durante a Black Friday.',
      'Este ano, a Cyber Monday calha a 30 de novembro. E na Mekie isso quer dizer uma coisa: é o último dia da <a href="/blog/black-friday-2026-roupa-bordada/">Black November</a>.',
      { h: 'O que ainda está em promoção' },
      {
        list: [
          '-15% em todos os <a href="/loja/hoodies-crewnecks/">hoodies e crewnecks</a> e em todas as <a href="/loja/t-shirts/">t-shirts</a>.',
          'Packs de duas peças: Hoodie + T-shirt por 95€, Crewneck + T-shirt por 90€, Hoodie + Cap por 80€ e T-shirt + Cap por 65€.',
          '<a href="/loja/scrunchies/">Scrunchies</a>: leva 4, paga 3.',
          '-10% nas <a href="/loja/malas/">malas de crochet</a>, também nas personalizadas.',
        ],
      },
      'Não precisas de código. Os descontos aparecem no preço e os packs aplicam-se sozinhos no carrinho. Todos os packs passam os 65€, por isso o envio em Portugal é grátis.',
      { h: 'Três dicas para o último dia' },
      {
        list: [
          'Não deixes para a última hora. A promoção acaba à meia-noite de 30 de novembro e alguns tamanhos já têm poucas unidades.',
          'Aproveita para as prendas de Natal. Tens as nossas ideias no <a href="/blog/prendas-de-natal-guia-mekie/">guia de prendas por preço</a>.',
          'Se estás entre dois tamanhos, escolhe o maior. E se não servir, tens 14 dias para trocar.',
        ],
      },
      { h: 'E depois?' },
      'A partir de 1 de dezembro os preços voltam ao normal e os packs desaparecem. Se queres saber primeiro da próxima promoção e dos drops novos, <a href="#newsletter">subscreve a newsletter</a> no fundo da página.',
    ],
  },
  {
    slug: 'como-vestir-por-camadas-no-inverno',
    title: 'Chegou o inverno: como vestir por camadas',
    description: 'O inverno começa a 21 de dezembro. Como combinar t-shirt, crewneck e hoodie para andar quente sem parecer um boneco de neve.',
    date: '2026-12-21',
    image: '/images/lookbook/cap-black-sweat.webp',
    imageAlt: 'Rapaz com cap e crewneck Mekie pretos junto a um lago',
    body: [
      'O inverno começa oficialmente a 21 de dezembro, com o solstício: o dia mais curto do ano e a noite mais longa. A partir daqui os dias começam a crescer, mas o frio ainda agora chegou. A melhor forma de lhe fazer frente não é um casaco enorme, é vestir por camadas.',
      { h: 'Porque é que as camadas funcionam' },
      'Entre cada peça fica uma camada de ar, e o ar parado aquece mais do que um tecido grosso sozinho. Além disso, com camadas adaptas-te ao longo do dia: tiras uma peça quando entras num café quente e voltas a vesti-la quando sais para a rua.',
      { h: 'Camada 1: uma t-shirt de algodão' },
      'A primeira camada está em contacto com a pele, por isso deve ser macia e respirável. Uma <a href="/loja/t-shirts/">t-shirt oversized</a> de 100% algodão faz bem este papel. O corte largo deixa espaço para o ar e não aperta por baixo das outras peças.',
      { h: 'Camada 2: crewneck ou hoodie' },
      'A camada do meio é a que aquece. Uma <a href="/loja/hoodies-crewnecks/">crewneck</a> fica mais arrumada e dá para usar por baixo de um casaco. Um hoodie, com 320 g de algodão e poliéster, já aquece o suficiente para os dias de inverno mais suaves de Portugal. Se o frio apertar, junta os dois: crewneck por baixo, hoodie aberto por cima.',
      { h: 'Camada 3: o casaco certo' },
      'Para os dias de chuva ou de vento, um casaco leve e impermeável por cima de um hoodie vale mais do que um casaco pesado por cima de uma t-shirt. Deixa o capuz do hoodie por fora: fica bem e dá jeito quando começa a chover.',
      { h: 'Os pormenores que fazem diferença' },
      {
        list: [
          'Cabeça: é a parte que fica mais exposta ao vento. Uma <a href="/loja/caps/">cap de bombazina</a> ajuda e fica bem com tudo.',
          'Pés: umas <a href="/loja/meias/">meias de cano médio</a> tapam o tornozelo, que é onde o frio entra primeiro.',
          'Cores: começa pelas mais claras por baixo e acaba nas escuras por cima. Um hoodie preto com uma t-shirt crua a espreitar na barra é uma combinação que nunca falha.',
        ],
      },
      'Bom inverno! E se receberes um hoodie no Natal, já sabes como o usar.',
    ],
  },
  {
    slug: 'passagem-de-ano-descontraida',
    title: 'Passagem de ano descontraída: conforto com estilo',
    description: 'Nem toda a gente passa o ano de vestido de gala. Ideias para uma passagem de ano em casa ou com amigos, confortável e com estilo, e uma resolução para 2027.',
    date: '2026-12-28',
    image: '/images/lookbook/cap-navy-couple.webp',
    imageAlt: 'Casal de costas junto a um lago, ele com cap azul navy e os dois com t-shirts pretas',
    body: [
      'Há quem passe o ano numa festa de lantejoulas e há quem prefira uma mesa cheia de amigos, um jogo de tabuleiro e as doze passas à meia-noite. Se és do segundo grupo, este artigo é para ti.',
      { h: 'Em casa ou com amigos' },
      'Numa passagem de ano descontraída, a ideia é estar bem a noite toda, do jantar até às tantas. Algumas combinações que funcionam:',
      {
        list: [
          'Uma <a href="/loja/hoodies-crewnecks/">crewneck</a> com calças de ganga escuras. É confortável, mas está arrumada para as fotografias.',
          'Uma <a href="/loja/t-shirts/">t-shirt oversized</a> preta com um casaco por cima. À meia-noite, quando o calor aperta, tiras o casaco.',
          'Um hoodie e umas <a href="/loja/meias/">meias</a> divertidas, se a festa é mesmo em casa e os sapatos ficam à porta.',
        ],
      },
      { h: 'Se a festa for na rua' },
      'Para ver o fogo de artifício na praia ou no centro da cidade, pensa em camadas: t-shirt, hoodie e casaco por cima. Junta uma <a href="/loja/caps/">cap</a> ou um gorro, e uma <a href="/loja/tote-bag/">tote bag</a> para levar o espumante, os copos e as passas. Tens mais ideias no nosso guia sobre <a href="/blog/como-vestir-por-camadas-no-inverno/">como vestir por camadas</a>.',
      { h: 'As tradições que não podem faltar' },
      {
        list: [
          'Doze passas, uma por cada badalada, com um desejo por passa.',
          'Subir para uma cadeira à meia-noite, para entrar no ano novo com o pé direito e a subir.',
          'Uma nota no bolso, para o dinheiro não faltar no ano que entra.',
        ],
      },
      { h: 'Uma resolução para 2027: comprar menos e melhor' },
      'Se há uma resolução que vale a pena, é esta. Escolher peças que duram, que usas muitas vezes e de que gostas mesmo. É por isso que os desenhos dos hoodies e das t-shirts são bordados, que usamos algodão grosso nos hoodies e algodão orgânico nas tote bags e nos bucket hats. E se cuidares bem da tua roupa, ela acompanha-te durante muitos anos: tens tudo no artigo sobre <a href="/blog/como-lavar-roupa-bordada/">como lavar roupa bordada</a>.',
      'Obrigado por este ano com a Mekie. Bom 2027!',
    ],
  },
  {
    slug: 'black-friday-2026-roupa-bordada',
    title: 'Black Friday 2026: um mês de descontos na Mekie',
    description: 'Este ano a Black Friday da Mekie dura o mês de novembro todo: -15% em hoodies, t-shirts e crewnecks, packs com até 22% de desconto, -10% nas malas de crochet e scrunchies leva 4, paga 3.',
    date: '2026-11-01',
    image: '/images/lookbook/group-crop.webp',
    imageAlt: 'Grupo de amigos com hoodies e t-shirts Mekie',
    notice: {
      from: '2026-12-01T00:00:00Z',
      html: 'A Black November 2026 já terminou e os preços deste artigo deixaram de estar em vigor. Vê os <a href="/loja/">preços atuais na loja</a> e <a href="#newsletter">subscreve a newsletter</a> para saberes primeiro da próxima promoção.',
    },
    body: [
      'A Black Friday calha este ano a 27 de novembro. Só que um dia é pouco para pensar com calma no que queres comprar, e menos ainda para tratar das prendas de Natal sem stress. Por isso, na Mekie, a Black Friday dura o mês inteiro. Chamamos-lhe Black November e vai de 1 a 30 de novembro.',
      { h: 'O que está em promoção' },
      'Todos os hoodies, t-shirts e crewnecks têm -15%. O desconto já aparece no preço de cada peça, não precisas de código.',
      {
        list: [
          '<a href="/loja/hoodies-crewnecks/">Hoodies</a>: de 70€ para 59€.',
          '<a href="/loja/hoodies-crewnecks/">Crewnecks</a>: de 65€ para 55€.',
          '<a href="/loja/t-shirts/">T-shirts</a>: de 50€ para 42€.',
        ],
      },
      { h: 'Os packs: duas peças, um preço' },
      'Se juntares duas peças, poupas ainda mais. O preço do pack aplica-se sozinho no carrinho, basta adicionares as duas peças que quiseres, com a cor e o tamanho que preferires.',
      {
        list: [
          'Hoodie + T-shirt por 95€, em vez de 120€.',
          'Crewneck + T-shirt por 90€, em vez de 115€.',
          'Hoodie + Cap por 80€, em vez de 100€.',
          'T-shirt + Cap por 65€, em vez de 80€.',
        ],
      },
      'Todos os packs passam os 65€, por isso o envio para Portugal fica por nossa conta.',
      { h: 'Scrunchies: leva 4, paga 3' },
      'Os <a href="/loja/scrunchies/">scrunchies de crochet</a> são feitos à mão por nós, um a um. Em novembro, em cada 4 scrunchies, um é oferecido. Podes misturar cores e incluir o personalizado, em que escolhes as duas cores do fio.',
      { h: 'Malas de crochet: -10%' },
      'As <a href="/loja/malas/">malas de crochet</a> também são feitas à mão por nós. Em novembro têm -10%: a S fica a 22€ e a M a 31€. Podes levar uma das que já estão feitas ou escolher a cor da mala e a cor do anel na personalizada.',
      { h: 'Aproveita para as prendas de Natal' },
      'Novembro é a altura certa para tratar das prendas. Os preços estão mais baixos, há mais tamanhos disponíveis e não tens a correria de dezembro. Algumas ideias:',
      {
        list: [
          'Um pack Hoodie + Cap, para quem vive de capuz e boné.',
          'Uma t-shirt e umas <a href="/loja/meias/">meias Mekie</a>, para uma prenda mais pequena.',
          'Quatro scrunchies, um para ti e três para oferecer. Um sai de graça.',
          'O <a href="/cartao-presente/">cartão presente</a>, para quem não sabes o tamanho. A pessoa escolhe e o valor fica guardado.',
        ],
      },
      { h: 'E se o tamanho não servir?' },
      'Tens 14 dias para trocar ou devolver, também nas peças em promoção. Se estás entre dois tamanhos, lê primeiro o nosso <a href="/blog/como-escolher-o-tamanho-de-um-hoodie-oversized/">guia de tamanhos dos hoodies</a>. A entrega em Portugal é feita pelos CTT e demora até 7 dias úteis, por isso, se a prenda é para o Natal, não deixes para o fim.',
      { h: 'Até quando?' },
      'A Black November termina a 30 de novembro, à meia-noite. A partir de 1 de dezembro os preços voltam ao normal e os packs desaparecem. Se já tens uma peça debaixo de olho, é agora. Vê tudo na <a href="/loja/">loja</a>.',
    ],
  },
  {
    slug: 'como-lavar-roupa-bordada',
    title: 'Como lavar roupa bordada para durar anos',
    description: 'Temperatura, avesso, secagem e ferro: o que fazer para o bordado do teu hoodie ou da tua t-shirt continuar como no primeiro dia.',
    date: '2026-01-19',
    image: '/images/lookbook/mushrooms-sleeve.webp',
    imageAlt: 'Pormenor do bordado de cogumelos na manga de uma t-shirt Mekie',
    body: [
      'Janeiro é o mês em que os hoodies trabalham mais. Saem de manhã, voltam à noite e vão parar à máquina mais vezes do que gostavam. A boa notícia é que um bordado bem feito aguenta muito. Só precisa de meia dúzia de cuidados.',
      { h: 'Vira a peça do avesso' },
      'É a regra mais simples e a que faz mais diferença. Do avesso, o bordado não roça no tambor nem nas outras peças, e os fios não ganham borboto. Serve para os hoodies, para as t-shirts e também para as meias, onde protege a estampa.',
      { h: 'Água fria ou morna, nunca a ferver' },
      'Lava a 30 °C, ou a 40 °C no máximo. Acima disso o algodão encolhe e as cores do bordado perdem força. Usa um programa normal ou delicado, com detergente líquido, e deixa a lixívia de fora. Mesmo nas peças brancas.',
      'Se tiveres tempo, junta as cores parecidas. Um hoodie amarelo pastel numa máquina com calças de ganga escuras é pedir sarilhos.',
      { h: 'Esquece a máquina de secar' },
      'O calor da máquina de secar é o maior inimigo do algodão e do bordado. Estende a peça à sombra, de preferência na horizontal ou bem esticada no estendal, para não ganhar forma nos ombros. Os hoodies demoram um bocado mais a secar, mas ficam com o mesmo corte durante muito mais tempo.',
      { h: 'Ferro só pelo avesso' },
      'Se quiseres passar a ferro, faz pelo avesso e a 110 °C no máximo. Nunca passes o ferro diretamente em cima do bordado. Se a zona bordada ficar enrugada, um pano húmido por cima resolve.',
      { h: 'Resumo para colar no frigorífico' },
      {
        list: [
          'Do avesso, sempre.',
          'Até 40 °C, sem lixívia.',
          'Sem máquina de secar.',
          'Ferro a 110 °C no máximo, pelo avesso.',
          'Nada de limpeza a seco.',
        ],
      },
      'Estas instruções estão também na página de cada peça, em Composição e cuidados. Se tiveres alguma dúvida, <a href="/contactos/">fala connosco</a>. E se o teu hoodie precisa de companhia, os <a href="/loja/hoodies-crewnecks/">hoodies estão aqui</a>.',
    ],
  },
  {
    slug: 'fim-de-semana-na-ericeira-o-que-levar',
    title: 'Fim de semana na Ericeira: o que levar na mala',
    description: 'A Mekie é da Ericeira. Fica a nossa lista para um fim de semana de praia, surf e pôr do sol, sem levar a casa às costas.',
    date: '2026-07-10',
    image: '/images/lookbook/bucket-tee.webp',
    imageAlt: 'Bucket hat e t-shirt Mekie num dia de verão',
    body: [
      'A Mekie nasceu na Ericeira, por isso já perdemos a conta aos fins de semana que passámos por cá. A vila tem tudo o que um verão pede: praias para todos os gostos, ondas que trazem surfistas do mundo inteiro (a Ericeira é Reserva Mundial de Surf desde 2011) e ruas brancas e azuis que dão vontade de andar sem destino.',
      'Para aproveitar sem levar a casa às costas, esta é a nossa mala.',
      { h: 'Uma t-shirt larga para o dia todo' },
      'De manhã na praia, à tarde no centro, à noite na esplanada. Uma <a href="/loja/t-shirts/">t-shirt oversized</a> de algodão dá para tudo e não aquece. Leva duas e estás safo.',
      { h: 'Um chapéu a sério' },
      'O sol da costa engana, porque há quase sempre vento. Um <a href="/produto/bucket-hat-mekie/">bucket hat</a> protege a cara e o pescoço, não voa ao primeiro golpe de vento e fica bem com tudo. Se és mais de <a href="/loja/caps/">cap</a>, também serve.',
      { h: 'Um hoodie para o fim do dia' },
      'Quem é de cá sabe: quando o sol desce, a nortada aparece e a temperatura cai de repente. Ver o pôr do sol em Ribeira d’Ilhas ou na Praia dos Pescadores pede um <a href="/loja/hoodies-crewnecks/">hoodie</a> na mochila. Mesmo em agosto.',
      { h: 'Um saco para a praia e para as compras' },
      'Toalha, protetor, livro, a fruta do mercado. Uma <a href="/loja/tote-bag/">tote bag</a> grande leva tudo e dobra-se para caber na mala.',
      { h: 'E os pormenores' },
      'Um par de <a href="/loja/meias/">meias</a> com piada para os ténis e um <a href="/loja/scrunchies/">scrunchie</a> para o cabelo não andar a voar à beira mar. São coisas pequenas, mas são elas que fazem o look.',
      'Se passares pela Ericeira e vires alguém de Mekie, diz olá. Mekie bro, ‘ta-se bem?',
    ],
  },
  {
    slug: 'como-escolher-o-tamanho-de-um-hoodie-oversized',
    title: 'Hoodie oversized: como escolher o tamanho certo',
    description: 'Largo mas não a nadar. Como escolher o tamanho de um hoodie ou de uma t-shirt oversized unissexo, e o que fazer se não acertares.',
    date: '2026-10-16',
    image: '/images/lookbook/esqueleto-black-hood.webp',
    imageAlt: 'Hoodie Esqueleto preto com capuz vestido',
    body: [
      'Outubro chegou e com ele a época dos hoodies. É também a altura em que recebemos mais perguntas sobre tamanhos, por isso juntámos aqui as respostas.',
      { h: 'Unissexo quer dizer o quê?' },
      'Os nossos hoodies e t-shirts têm corte unissexo. O mesmo tamanho serve a qualquer pessoa, só muda o efeito. Quem costuma vestir roupa de mulher normalmente fica com um caimento mais largo no mesmo tamanho.',
      { h: 'Que efeito queres?' },
      {
        list: [
          'Largo e descontraído, o look oversized: escolhe o teu tamanho habitual.',
          'Bem largo, quase de outra pessoa: sobe um tamanho.',
          'Mais junto ao corpo: desce um tamanho.',
        ],
      },
      'Os punhos e a barra são em canelado, por isso o hoodie fica preso no pulso e na anca mesmo quando é largo. Não fica a sobrar nas mangas como uma peça sem canelado.',
      { h: 'Entre dois tamanhos?' },
      'Escolhe o maior. Um hoodie ligeiramente largo fica sempre bem. Um apertado nos ombros não. E lembra-te que o algodão pode encolher um pouco se for lavado acima de 40 °C, por isso segue as <a href="/blog/como-lavar-roupa-bordada/">dicas de lavagem</a>.',
      { h: 'O truque da peça que já tens' },
      'Pega no hoodie de que mais gostas, estende-o numa mesa e mede de axila a axila e do ombro à barra. Manda-nos essas medidas e dizemos-te que tamanho da Mekie fica mais parecido. É a forma mais certa de acertar à primeira.',
      { h: 'E se não acertares?' },
      'Sem stress. Tens 14 dias para trocar de tamanho. Tu envias a peça de volta e nós enviamos o tamanho novo sem cobrar portes outra vez. Está tudo explicado na <a href="/politica-de-devolucoes-e-reembolsos/">política de devoluções</a>.',
      'Já sabes o teu tamanho? Os hoodies <a href="/produto/hoodie-cogumelos/">Cogumelos</a> e <a href="/produto/hoodie-black-esqueleto/">Esqueleto</a> estão à tua espera.',
    ],
  },
];

/** Um artigo só aparece a partir da meia-noite do dia da sua data (hora de Lisboa no inverno = UTC).
    O site volta a ser construído todos os dias às 00:05 quando há artigos novos (api/cron/promo). */
const previewAll = () => {
  /* BLOG_PREVIEW=1 em local, ou as pré-visualizações da Vercel: mostram já os artigos agendados */
  try { return typeof process !== 'undefined' && (process.env?.BLOG_PREVIEW === '1' || process.env?.VERCEL_ENV === 'preview'); } catch { return false; }
};
export const isLive = (p: Post, now = new Date()) => previewAll() || new Date(`${p.date}T00:00:00Z`) <= now;

/** Do mais recente para o mais antigo, só os já publicados */
export const blogPosts = [...posts].filter((p) => isLive(p)).sort((a, b) => b.date.localeCompare(a.date));
export const getPost = (slug: string) => blogPosts.find((p) => p.slug === slug);

/** Datas em que o site tem de mudar sozinho: artigos novos e notas que aparecem (AAAA-MM-DD) */
export const blogChangeDays = posts.flatMap((p) => [p.date, ...(p.notice ? [p.notice.from.slice(0, 10)] : [])]);

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
