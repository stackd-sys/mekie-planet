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
};

const posts: Post[] = [
  {
    slug: 'black-friday-2026-roupa-bordada',
    title: 'Black Friday 2026: um mês de descontos na Mekie',
    description: 'Este ano a Black Friday da Mekie dura o mês de novembro todo: -15% em hoodies, t-shirts e crewnecks, packs com até 22% de desconto e scrunchies leva 4, paga 3.',
    date: '2026-11-01',
    image: '/images/lookbook/group-crop.webp',
    imageAlt: 'Grupo de amigos com hoodies e t-shirts Mekie',
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

/** Do mais recente para o mais antigo */
export const blogPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));
export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
