/* Texto de cada categoria no fundo da página, para quem quer saber mais e para o Google.
   {free} é o valor do envio grátis em Portugal. Cada língua: título e parágrafos. */
type Block = { h: string; p: string[] };
type Entry = Record<'pt' | 'en' | 'es', Block>;

export const categorySeo: Record<string, Entry> = {
  'hoodies-crewnecks': {
    pt: {
      h: 'Hoodies e crewnecks bordados, feitos para durar',
      p: [
        'Os hoodies Mekie são unissexo, com capuz, bolso canguru e cordão de ajuste. O tecido tem 80% algodão e 20% poliéster, com 320 g, por isso é grosso e quente sem deixar de ser confortável. No peito levam o bordado de cogumelos ou de esqueleto, e no punho um pormenor bordado a vermelho.',
        'As crewnecks são de gola redonda, em 100% algodão de 288 g/m², com gola, punhos e bainha em canelado. Há do XS ao XL e o corte é descontraído, para usar todos os dias.',
        'Para o bordado continuar como novo, lava do avesso até 40 °C e não uses a máquina de secar. Enviamos por CTT para Portugal e para a União Europeia, com envio grátis em Portugal acima de {free}, e tens 14 dias para trocar ou devolver.',
      ],
    },
    en: {
      h: 'Embroidered hoodies and crewnecks, made to last',
      p: [
        'Mekie hoodies are unisex, with a hood, kangaroo pocket and drawstring. The fabric is 80% cotton and 20% polyester at 320 g, so it is thick and warm while staying comfortable. They carry the mushroom or skeleton embroidery on the chest and a red embroidered detail on the cuff.',
        'Our crewnecks have a classic round neck, in 100% cotton at 288 g/m², with ribbed collar, cuffs and hem. Sizes go from XS to XL with a relaxed fit for everyday wear.',
        'To keep the embroidery looking new, wash inside out at up to 40 °C and skip the tumble dryer. We ship with CTT to Portugal and the European Union, free in Portugal over {free}, and you have 14 days to exchange or return.',
      ],
    },
    es: {
      h: 'Hoodies y crewnecks bordadas, hechas para durar',
      p: [
        'Las hoodies Mekie son unisex, con capucha, bolsillo canguro y cordón de ajuste. El tejido tiene un 80% de algodón y un 20% de poliéster, con 320 g, así que es grueso y abriga sin dejar de ser cómodo. En el pecho llevan el bordado de setas o de esqueleto, y en el puño un detalle bordado en rojo.',
        'Las crewnecks tienen cuello redondo clásico, en 100% algodón de 288 g/m², con cuello, puños y bajo de canalé. Hay de la XS a la XL y el corte es relajado, para llevar a diario.',
        'Para que el bordado siga como nuevo, lava del revés hasta 40 °C y no uses secadora. Enviamos con CTT a Portugal y a la Unión Europea, gratis en Portugal a partir de {free}, y tienes 14 días para cambiar o devolver.',
      ],
    },
  },
  't-shirts': {
    pt: {
      h: 'T-shirts oversized bordadas em 100% algodão',
      p: [
        'As t-shirts Mekie têm corte oversized e unissexo, em 100% algodão de 190 g. São frescas no verão e ficam bem por baixo de um hoodie no inverno. No peito levam os três cogumelos Mekie bordados e na manga um pormenor bordado com o logótipo.',
        'A gola redonda é reforçada, para não perder a forma com as lavagens. Se tens dúvidas entre dois tamanhos, lembra-te de que o corte já é largo: o teu tamanho habitual dá um caimento descontraído.',
        'Lava do avesso até 40 °C e passa a ferro pelo avesso. Enviamos por CTT para Portugal e para a União Europeia, com envio grátis em Portugal acima de {free}.',
      ],
    },
    en: {
      h: 'Embroidered oversized T-shirts in 100% cotton',
      p: [
        'Mekie T-shirts have an oversized, unisex fit in 100% cotton at 190 g. They stay cool in summer and layer well under a hoodie in winter. The three Mekie mushrooms are embroidered on the chest, with an embroidered logo detail on the sleeve.',
        'The round neck is reinforced so it keeps its shape wash after wash. If you are between two sizes, remember the cut is already roomy: your usual size gives a relaxed drape.',
        'Wash inside out at up to 40 °C and iron inside out. We ship with CTT to Portugal and the European Union, free in Portugal over {free}.',
      ],
    },
    es: {
      h: 'Camisetas oversized bordadas en 100% algodón',
      p: [
        'Las camisetas Mekie tienen corte oversized y unisex, en 100% algodón de 190 g. Son frescas en verano y quedan bien debajo de una hoodie en invierno. En el pecho llevan las tres setas Mekie bordadas y en la manga un detalle bordado con el logo.',
        'El cuello redondo está reforzado para no perder la forma con los lavados. Si dudas entre dos tallas, recuerda que el corte ya es amplio: tu talla de siempre da una caída relajada.',
        'Lava del revés hasta 40 °C y plancha del revés. Enviamos con CTT a Portugal y a la Unión Europea, gratis en Portugal a partir de {free}.',
      ],
    },
  },
  caps: {
    pt: {
      h: 'Caps de bombazina com o logótipo Mekie',
      p: [
        'As caps Mekie são de bombazina 100% algodão, com 6 painéis, aba curva e o logótipo bordado à frente. A tira de trás é ajustável, por isso servem em quase todas as cabeças.',
        'Por dentro têm fita e acabamentos em sarja de algodão. Há várias cores e combinam com os hoodies e as t-shirts da loja. Juntas com um hoodie ou uma t-shirt, entram nos packs quando há promoção.',
      ],
    },
    en: {
      h: 'Corduroy caps with the Mekie logo',
      p: [
        'Mekie caps are made of 100% cotton corduroy, with 6 panels, a curved brim and the logo embroidered on the front. The back strap is adjustable, so they fit almost any head.',
        'Inside they have cotton twill tape and finishes. They come in several colours and match the hoodies and T-shirts in the shop. Paired with a hoodie or a T-shirt, they count for the bundles whenever there is a sale on.',
      ],
    },
    es: {
      h: 'Gorras de pana con el logo Mekie',
      p: [
        'Las gorras Mekie son de pana 100% algodón, con 6 paneles, visera curva y el logo bordado delante. La tira de atrás es ajustable, así que valen para casi cualquier cabeza.',
        'Por dentro llevan cinta y acabados de sarga de algodón. Hay varios colores y combinan con las hoodies y las camisetas de la tienda. Junto con una hoodie o una camiseta, entran en los packs cuando hay promoción.',
      ],
    },
  },
  'bucket-hat': {
    pt: {
      h: 'Bucket hat de algodão orgânico',
      p: [
        'O bucket hat Mekie é de sarja 100% algodão orgânico, com certificação GOTS e OEKO-TEX Standard 100. Tem aba clássica, perfil alto e um tecido respirável, bom para a praia e para os dias de sol na cidade.',
        'Leva o logótipo Mekie bordado à frente. Enviamos por CTT para Portugal e para a União Europeia.',
      ],
    },
    en: {
      h: 'Organic cotton bucket hat',
      p: [
        'The Mekie bucket hat is made of 100% organic cotton twill, GOTS and OEKO-TEX Standard 100 certified. It has a classic brim, a high crown and a breathable fabric, great for the beach and sunny days in the city.',
        'The Mekie logo is embroidered on the front. We ship with CTT to Portugal and the European Union.',
      ],
    },
    es: {
      h: 'Bucket hat de algodón orgánico',
      p: [
        'El bucket hat Mekie es de sarga 100% algodón orgánico, con certificación GOTS y OEKO-TEX Standard 100. Tiene ala clásica, copa alta y un tejido transpirable, ideal para la playa y los días de sol en la ciudad.',
        'Lleva el logo Mekie bordado delante. Enviamos con CTT a Portugal y a la Unión Europea.',
      ],
    },
  },
  meias: {
    pt: {
      h: 'Meias Mekie de cano médio',
      p: [
        'As meias Mekie são de cano médio, unissexo, com a perna em canelado. A estampa é feita por sublimação, por isso as cores ficam nítidas e não desbotam com as lavagens.',
        'São de 60% nylon, 22% algodão e 18% elastano, para ajustarem bem ao pé. Lava do avesso para a estampa durar mais. Também são uma boa prenda para juntar a uma encomenda.',
      ],
    },
    en: {
      h: 'Mekie crew socks',
      p: [
        'Mekie socks are unisex crew socks with a ribbed leg. The print is made by sublimation, so the colours stay sharp and do not fade in the wash.',
        'They are 60% nylon, 22% cotton and 18% elastane for a snug fit. Wash them inside out to keep the print longer. They also make a nice little gift to add to an order.',
      ],
    },
    es: {
      h: 'Calcetines Mekie de caña media',
      p: [
        'Los calcetines Mekie son de caña media, unisex, con la pierna de canalé. El estampado se hace por sublimación, así que los colores quedan nítidos y no destiñen con los lavados.',
        'Son de 60% nailon, 22% algodón y 18% elastano, para que se ajusten bien al pie. Lávalos del revés para que el estampado dure más. También son un buen regalo para añadir a un pedido.',
      ],
    },
  },
  scrunchies: {
    pt: {
      h: 'Scrunchies de crochet feitos à mão',
      p: [
        'Cada scrunchie Mekie é feito à mão por nós, em crochet, com folhos grandes que seguram o cabelo sem o puxar. Há modelos prontos a enviar e o scrunchie personalizado, em que escolhes as duas cores.',
        'O personalizado é feito com fio de algodão orgânico com certificação GOTS e fica pronto em cerca de 10 dias úteis. Como são feitos um a um, não há dois exatamente iguais.',
      ],
    },
    en: {
      h: 'Handmade crochet scrunchies',
      p: [
        'Every Mekie scrunchie is handmade by us in crochet, with big ruffles that hold your hair without pulling. There are ready-to-ship styles and the custom scrunchie, where you pick both colours.',
        'The custom one is made with GOTS certified organic cotton yarn and is ready in about 10 working days. Since they are made one by one, no two are exactly the same.',
      ],
    },
    es: {
      h: 'Scrunchies de ganchillo hechos a mano',
      p: [
        'Cada scrunchie Mekie lo hacemos a mano, en ganchillo, con volantes grandes que sujetan el pelo sin tirar. Hay modelos listos para enviar y el scrunchie personalizado, en el que eliges los dos colores.',
        'El personalizado se hace con hilo de algodón orgánico con certificación GOTS y está listo en unos 10 días laborables. Como se hacen uno a uno, no hay dos exactamente iguales.',
      ],
    },
  },
  'tote-bag': {
    pt: {
      h: 'Tote bags bordadas de algodão orgânico',
      p: [
        'As tote bags Mekie são de algodão orgânico com certificações GOTS e OCS, OEKO-TEX Standard 100 e o selo vegano da PETA. Medem 40,6 × 35,6 × 12,7 cm e aguentam até 13,6 kg.',
        'As alças duplas têm 62,2 cm, o que dá para levar ao ombro. Levam os desenhos Mekie bordados, planetas ou cogumelos, e servem para a praia, as compras ou o computador.',
      ],
    },
    en: {
      h: 'Embroidered organic cotton tote bags',
      p: [
        'Mekie tote bags are made of organic cotton, GOTS and OCS certified, OEKO-TEX Standard 100, with the PETA vegan seal. They measure 40.6 × 35.6 × 12.7 cm and carry up to 13.6 kg.',
        'The double handles are 62.2 cm long, so they sit comfortably on your shoulder. They feature the embroidered Mekie planets or mushrooms and work for the beach, groceries or your laptop.',
      ],
    },
    es: {
      h: 'Tote bags bordadas de algodón orgánico',
      p: [
        'Las tote bags Mekie son de algodón orgánico con certificaciones GOTS y OCS, OEKO-TEX Standard 100 y el sello vegano de PETA. Miden 40,6 × 35,6 × 12,7 cm y aguantan hasta 13,6 kg.',
        'Las asas dobles miden 62,2 cm, así que se llevan bien al hombro. Llevan los dibujos Mekie bordados, planetas o setas, y sirven para la playa, la compra o el portátil.',
      ],
    },
  },
};
