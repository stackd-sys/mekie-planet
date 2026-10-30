/* Textos do servidor (erros da API e emails ao cliente): [português, inglês, espanhol].
   Os emails para a Mekie (avisos de encomenda) ficam sempre em português. */
import { type Lang, isLang } from './index';

const dict = {
  /* Encomenda e códigos */
  'err.big': ['Pedido demasiado grande.', 'Request too large.', 'Petición demasiado grande.'],
  'err.bad': ['Pedido inválido.', 'Invalid request.', 'Petición no válida.'],
  'err.save': ['Não conseguimos gravar a encomenda.', "We couldn't save your order.", 'No hemos podido guardar el pedido.'],
  'err.payment': ['O pagamento não está disponível neste momento. Tenta outra vez daqui a pouco ou escreve-nos.', 'Payment is not available right now. Please try again in a moment or get in touch.', 'El pago no está disponible en este momento. Inténtalo de nuevo en un rato o escríbenos.'],
  'err.email': ['O email não parece válido.', "The email doesn't look right.", 'El email no parece válido.'],
  'err.namePhone': ['Preenche o nome e o telemóvel.', 'Fill in your name and phone number.', 'Rellena el nombre y el móvil.'],
  'err.empty': ['O carrinho está vazio.', 'Your cart is empty.', 'La cesta está vacía.'],
  'err.address': ['Preenche a morada completa.', 'Fill in your full address.', 'Rellena la dirección completa.'],
  'err.gone': ['Um dos artigos já não existe.', 'One of the items is no longer available.', 'Uno de los artículos ya no existe.'],
  'err.size': ['Escolhe um tamanho válido para {name}.', 'Pick a valid size for {name}.', 'Elige una talla válida para {name}.'],
  'err.only': ['Só temos {n} de {name}.', 'We only have {n} of {name}.', 'Solo tenemos {n} de {name}.'],
  'err.soldout': ['{name} esgotou.', '{name} is sold out.', '{name} se ha agotado.'],
  'code.write': ['Escreve um código.', 'Enter a code.', 'Escribe un código.'],
  'code.invalid': ['Este código não é válido.', 'This code is not valid.', 'Este código no es válido.'],
  'code.notYet': ['Este código ainda não está ativo.', 'This code is not active yet.', 'Este código aún no está activo.'],
  'code.expired': ['Este código já expirou.', 'This code has expired.', 'Este código ha caducado.'],
  'code.min': ['Este código é para compras a partir de {n}.', 'This code is for orders of {n} or more.', 'Este código es para compras a partir de {n}.'],
  'code.out': ['Este código já esgotou.', 'This code has run out.', 'Este código ya se ha agotado.'],
  'code.welcome': ['O código {code} é para quem subscreve a newsletter. Usa o email com que subscreveste ou subscreve no fundo da página.', 'The {code} code is for newsletter subscribers. Use the email you subscribed with, or subscribe at the bottom of the page.', 'El código {code} es para quien se suscribe a la newsletter. Usa el email con el que te suscribiste o suscríbete al final de la página.'],
  'code.used': ['O código {code} já foi usado numa encomenda com este email.', 'The {code} code has already been used on an order with this email.', 'El código {code} ya se usó en un pedido con este email.'],
  'err.giftAmount': ['O valor do cartão presente tem de ser um número inteiro entre {min} e {max}.', 'The gift card amount must be a whole number between {min} and {max}.', 'El importe de la tarjeta regalo tiene que ser un número entero entre {min} y {max}.'],
  'gift.empty': ['Este cartão já não tem saldo.', 'This card has no balance left.', 'Esta tarjeta ya no tiene saldo.'],
  'gift.expired': ['Este cartão já passou a validade.', 'This card has expired.', 'Esta tarjeta ha caducado.'],
  'gift.notFound': ['Não encontrámos este cartão presente.', "We couldn't find this gift card.", 'No encontramos esta tarjeta regalo.'],

  /* Emails ao cliente */
  'm.thanks': ['Obrigado, {name}!', 'Thank you, {name}!', '¡Gracias, {name}!'],
  'm.questions': ['Qualquer dúvida, responde a este email.', 'Any questions? Just reply to this email.', 'Si tienes alguna duda, responde a este email.'],
  'm.discount': ['Desconto {code}', 'Discount {code}', 'Descuento {code}'],
  'm.shipping': ['Envio', 'Shipping', 'Envío'],
  'm.free': ['Grátis', 'Free', 'Gratis'],
  'm.gift': ['Cartão presente', 'Gift card', 'Tarjeta regalo'],
  'm.shipTo': ['Envio para: {address}', 'Shipping to: {address}', 'Envío a: {address}'],
  'm.receivedSubject': ['Recebemos a tua encomenda {n}', 'We got your order {n}', 'Hemos recibido tu pedido {n}'],
  'm.received': ['Recebemos a tua encomenda <strong>{n}</strong>.', 'We got your order <strong>{n}</strong>.', 'Hemos recibido tu pedido <strong>{n}</strong>.'],
  'm.payDetails': ['Vamos enviar-te em breve os dados de pagamento (MB WAY, Multibanco ou cartão).', 'We will send you the payment details soon.', 'Pronto te enviaremos los datos de pago.'],
  'm.onIt': ['Vamos tratar dela já.', 'We are on it.', 'Nos ponemos con él ya.'],
  'm.paidSubject': ['Pagamento confirmado: encomenda {n}', 'Payment confirmed: order {n}', 'Pago confirmado: pedido {n}'],
  'm.paid': ['Recebemos o pagamento da tua encomenda <strong>{n}</strong>.', 'We have received the payment for your order <strong>{n}</strong>.', 'Hemos recibido el pago de tu pedido <strong>{n}</strong>.'],
  'm.prepare': ['Vamos prepará-la e avisamos-te quando seguir pelos CTT.', 'We will get it ready and let you know when it ships.', 'Lo preparamos y te avisamos cuando salga.'],
  'm.giftByEmail': ['O cartão presente segue por email para quem o recebe.', 'The gift card will be emailed to the recipient.', 'La tarjeta regalo se enviará por email a quien la recibe.'],
  'm.shippedSubject': ['A tua encomenda {n} já vai a caminho', 'Your order {n} is on its way', 'Tu pedido {n} ya está en camino'],
  'm.shippedTitle': ['Já vai a caminho!', "It's on its way!", '¡Ya está en camino!'],
  'm.shipped': ['A tua encomenda <strong>{n}</strong> saiu hoje pelos CTT.', 'Your order <strong>{n}</strong> left today with CTT (Portuguese post).', 'Tu pedido <strong>{n}</strong> ha salido hoy con CTT (correos de Portugal).'],
  'm.tracking': ['Número de seguimento: <strong>{code}</strong>', 'Tracking number: <strong>{code}</strong>', 'Número de seguimiento: <strong>{code}</strong>'],
  'm.track': ['Seguir a encomenda nos CTT', 'Track your order', 'Seguir el pedido'],
  'm.bye': ['Obrigado por escolheres a Mekie. Bro, o básico nunca falha.', 'Thanks for choosing Mekie. Bro, the basics never fail.', 'Gracias por elegir Mekie. Bro, lo básico nunca falla.'],
  'm.refundSubject': ['Reembolso da encomenda {n}', 'Refund for order {n}', 'Reembolso del pedido {n}'],
  'm.hello': ['Olá, {name}', 'Hi {name}', 'Hola, {name}'],
  'm.refund': ['Devolvemos <strong>{amount}</strong> referentes à encomenda <strong>{n}</strong>, pelo mesmo meio com que pagaste.', 'We have refunded <strong>{amount}</strong> for order <strong>{n}</strong>, to the same payment method you used.', 'Te hemos devuelto <strong>{amount}</strong> del pedido <strong>{n}</strong>, por el mismo medio con el que pagaste.'],
  'm.refundDays': ['Dependendo do banco, o valor aparece na tua conta entre 5 e 10 dias úteis. Com MB WAY costuma ser mais rápido.', 'Depending on your bank, it shows up in your account within 5 to 10 working days.', 'Según tu banco, el importe aparece en tu cuenta en un plazo de 5 a 10 días laborables.'],
  'm.giftSubjectFrom': ['{buyer} ofereceu-te um cartão presente Mekie', '{buyer} sent you a Mekie gift card', '{buyer} te ha regalado una tarjeta regalo Mekie'],
  'm.giftSubject': ['Tens um cartão presente Mekie', 'You have a Mekie gift card', 'Tienes una tarjeta regalo Mekie'],
  'm.giftTitle': ['{name}: {value} para gastar na Mekie', '{name}: {value} to spend at Mekie', '{name}: {value} para gastar en Mekie'],
  'm.giftHello': ['Olá {name},', 'Hi {name},', 'Hola, {name}:'],
  'm.giftFrom': ['<strong>{buyer}</strong> ofereceu-te um cartão presente Mekie.', '<strong>{buyer}</strong> sent you a Mekie gift card.', '<strong>{buyer}</strong> te ha regalado una tarjeta regalo Mekie.'],
  'm.giftUse': ['Escreve este código no checkout em {site}. Podes usá-lo em várias compras até acabar o saldo. É válido até {date}.', 'Enter this code at checkout on {site}. You can use it across several orders until the balance runs out. It is valid until {date}.', 'Escribe este código en el checkout de {site}. Puedes usarlo en varias compras hasta que se acabe el saldo. Es válido hasta el {date}.'],
  'm.welcomeTitle': ['Bem-vindo à Mekie!', 'Welcome to Mekie!', '¡Bienvenido a Mekie!'],
  'm.welcomeSubject': ['O teu código de {off} na Mekie', 'Your {off} Mekie code', 'Tu código del {off} en Mekie'],
  'm.welcomeSubjectNoCode': ['Já fazes parte da Mekie', "You're part of Mekie now", 'Ya formas parte de Mekie'],
  'm.welcome': ['Obrigado por subscreveres. Vais ser dos primeiros a saber das novidades, reposições e promoções.', 'Thanks for subscribing. You will be among the first to hear about new drops, restocks and offers.', 'Gracias por suscribirte. Serás de los primeros en enterarte de novedades, reposiciones y promociones.'],
  'm.welcomeCode': ['Aqui está o teu código de {off} de desconto na primeira compra:', 'Here is your {off} off code for your first order:', 'Aquí tienes tu código de {off} de descuento en tu primera compra:'],
  'm.welcomeHow': ['Escreve-o no campo "Código de desconto", no checkout. Só pode ser usado uma vez e com este email.', 'Enter it in the "Discount code" field at checkout. It can be used once, with this email.', 'Escríbelo en el campo "Código de descuento" del checkout. Solo se puede usar una vez y con este email.'],
  'm.shopBtn': ['VER A LOJA', 'SHOP NOW', 'VER LA TIENDA'],
  'm.why': ['Recebeste este email porque subscreveste a newsletter em {site}. Se não quiseres receber mais, <a href="{leave}" style="color:#5c5c5c">sai da newsletter aqui</a>.', 'You got this email because you subscribed to the newsletter on {site}. If you no longer want to receive it, <a href="{leave}" style="color:#5c5c5c">unsubscribe here</a>.', 'Has recibido este email porque te suscribiste a la newsletter en {site}. Si no quieres recibir más, <a href="{leave}" style="color:#5c5c5c">date de baja aquí</a>.'],
  'm.abandonSubject': ['Ficou alguma coisa por concluir?', 'Did you forget something?', '¿Se te ha quedado algo a medias?'],
  'm.abandon': ['Vimos que começaste uma encomenda na Mekie mas o pagamento ficou por concluir. Guardámos tudo para ti:', 'We noticed you started an order at Mekie but didn’t finish paying. We saved everything for you:', 'Vimos que empezaste un pedido en Mekie pero no terminaste el pago. Te lo hemos guardado todo:'],
  'm.abandonBtn': ['CONCLUIR A COMPRA', 'COMPLETE MY ORDER', 'TERMINAR LA COMPRA'],
  'm.abandonNote': ['O link fica ativo até amanhã. Se mudaste de ideias, não precisas de fazer nada: este é o único lembrete que te enviamos. Alguma dúvida com tamanhos ou portes? Responde a este email.', 'The link stays active until tomorrow. If you changed your mind, you don’t need to do anything: this is the only reminder we send. Any questions about sizes or shipping? Just reply to this email.', 'El enlace sigue activo hasta mañana. Si has cambiado de idea, no tienes que hacer nada: es el único recordatorio que te enviamos. ¿Dudas con tallas o envíos? Responde a este email.'],
  'm.backSubject': ['{product} voltou!', '{product} is back!', '¡{product} ha vuelto!'],
  'm.backTitle': ['{product} voltou', '{product} is back', '{product} ha vuelto'],
  'm.back': ['Pediste para te avisarmos: {product}{size} já está outra vez disponível.', 'You asked us to let you know: {product}{size} is available again.', 'Nos pediste que te avisáramos: {product}{size} vuelve a estar disponible.'],
  'm.backSize': [' no tamanho <strong>{s}</strong>', ' in size <strong>{s}</strong>', ' en la talla <strong>{s}</strong>'],
  'm.backBtn': ['Ver a peça', 'See the piece', 'Ver la prenda'],
  'm.backOnce': ['Este foi o único aviso que te enviamos sobre esta peça.', 'This is the only email we will send you about this piece.', 'Este es el único aviso que te enviaremos sobre esta prenda.'],
} satisfies Record<string, readonly [string, string, string]>;

const idx: Record<Lang, number> = { pt: 0, en: 1, es: 2 };

/** Língua guardada (encomenda, subscritor) ou enviada pelo site; tudo o resto conta como português */
export const asLang = (v: unknown): Lang => (isLang(v) ? v : 'pt');

export function serverT(lang: Lang) {
  return (key: keyof typeof dict, vars: Record<string, string | number> = {}) =>
    dict[key][idx[lang]].replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Data dos emails na língua: 18/10/2027 */
export const mailDate = (d: Date | string, lang: Lang) =>
  new Date(d).toLocaleDateString(lang === 'en' ? 'en-GB' : lang === 'es' ? 'es-ES' : 'pt-PT', { timeZone: 'Europe/Lisbon' });
