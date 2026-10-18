/* Textos usados pelos scripts no browser: [português, inglês, espanhol]. A língua vem do <html lang>. */
import { type Lang, money as fmt, href as path } from './index';

export const lang: Lang = (() => {
  const l = (typeof document !== 'undefined' ? document.documentElement.lang : '').slice(0, 2);
  return l === 'en' || l === 'es' ? l : 'pt';
})();

const dict = {
  'ship.missing': ['Faltam <strong>{n}</strong> para teres envio gratuito em Portugal.', 'Add <strong>{n}</strong> more for free shipping in Portugal.', 'Te faltan <strong>{n}</strong> para el envío gratis en Portugal.'],
  'ship.free': ['Tens <strong>envio gratuito</strong> em Portugal.', 'You get <strong>free shipping</strong> in Portugal.', 'Tienes <strong>envío gratis</strong> en Portugal.'],
  'line.size': ['Tamanho {s}', 'Size {s}', 'Talla {s}'],
  'line.made': ['{n} por encomenda, entrega em {d} dias úteis', '{n} made to order, delivered in {d} working days', '{n} por encargo, entrega en {d} días laborables'],
  'qty.less': ['Diminuir quantidade', 'Decrease quantity', 'Reducir cantidad'],
  'qty.more': ['Aumentar quantidade', 'Increase quantity', 'Aumentar cantidad'],
  'qty.max': ['Sem mais unidades em stock', 'No more units in stock', 'No quedan más unidades'],
  'remove': ['Remover', 'Remove', 'Quitar'],
  'news.new': ['Já estás na lista.', "You're on the list.", 'Ya estás en la lista.'],
  'news.newSub': ['Usa este código no checkout:', 'Use this code at checkout:', 'Usa este código en el checkout:'],
  'news.exists': ['Este email já estava na lista.', 'This email was already on the list.', 'Este email ya estaba en la lista.'],
  'news.existsSub': ['O teu código continua válido:', 'Your code is still valid:', 'Tu código sigue siendo válido:'],
  'news.used': ['Este email já está na lista.', 'This email is already on the list.', 'Este email ya está en la lista.'],
  'news.usedSub': ['O código de boas-vindas já foi usado numa encomenda com este email. É válido uma vez por cliente.', 'The welcome code has already been used on an order with this email. It is valid once per customer.', 'El código de bienvenida ya se usó en un pedido con este email. Es válido una vez por cliente.'],
  'news.badEmail': ['Escreve um email válido.', 'Enter a valid email.', 'Escribe un email válido.'],
  'news.consent': ['Para continuar, aceita receber os nossos emails.', 'To continue, agree to receive our emails.', 'Para continuar, acepta recibir nuestros emails.'],
  'news.error': ['Não conseguimos guardar o teu email. Tenta outra vez daqui a pouco.', "We couldn't save your email. Please try again in a moment.", 'No hemos podido guardar tu email. Inténtalo de nuevo en un rato.'],
  'copied': ['Copiado', 'Copied', 'Copiado'],
  'copySelect': ['Seleciona e copia', 'Select and copy', 'Selecciona y copia'],
  'copy': ['Copiar', 'Copy', 'Copiar'],
  'added': ['Adicionado ✓', 'Added ✓', 'Añadido ✓'],
  'add': ['Adicionar ao carrinho', 'Add to cart', 'Añadir a la cesta'],
  'size.left1': ['Só resta 1 unidade em {s}', 'Only 1 left in {s}', 'Solo queda 1 unidad en {s}'],
  'size.leftN': ['Só restam {n} unidades em {s}', 'Only {n} left in {s}', 'Solo quedan {n} unidades en {s}'],
  'custom': ['Corpo {main}, rebordo {edge}', 'Main {main}, edging {edge}', 'Cuerpo {main}, borde {edge}'],
  'notify.error': ['Não conseguimos guardar o pedido. Tenta outra vez daqui a pouco.', "We couldn't save your request. Please try again in a moment.", 'No hemos podido guardar tu petición. Inténtalo de nuevo en un rato.'],
  'notify.exists': ['Já tínhamos o teu pedido{size}. Avisamos-te em {email}.', 'We already had your request{size}. We will email you at {email}.', 'Ya teníamos tu petición{size}. Te avisaremos en {email}.'],
  'notify.existsSize': [' para o {s}', ' for {s}', ' para la {s}'],
  'notify.ok': ['Combinado. Avisamos-te em {email} quando {what}.', 'Done. We will email you at {email} when {what}.', 'Hecho. Te avisaremos en {email} cuando {what}.'],
  'notify.okSize': ['o {s} voltar', '{s} is back', 'la {s} vuelva'],
  'notify.okAny': ['voltar', 'it is back', 'vuelva'],
  'gc.needNames': ['Preenche o nome de quem recebe e o teu.', 'Fill in their name and yours.', 'Rellena el nombre de quien la recibe y el tuyo.'],
  'gc.badEmail': ['O email de quem recebe não parece válido.', "Their email doesn't look right.", 'El email de quien la recibe no parece válido.'],
  'gc.to': ['Para {name}', 'To {name}', 'Para {name}'],
  'gc.from': ['De {name}', 'From {name}', 'De {name}'],
  'co.percent': ['{n}% de desconto', '{n}% off', '{n}% de descuento'],
  'co.fixed': ['{n} de desconto', '{n} off', '{n} de descuento'],
  'co.codeBad': ['Este código não é válido.', 'This code is not valid.', 'Este código no es válido.'],
  'co.codeOk': ['Código aplicado: {d}. Não acumulável com outras promoções.', 'Code applied: {d}. Cannot be combined with other offers.', 'Código aplicado: {d}. No acumulable con otras promociones.'],
  'co.giftLater': ['Recebemos o código. Confirmamos o saldo e descontamos no pagamento.', 'Got the code. We will check the balance and take it off at payment.', 'Recibimos el código. Comprobamos el saldo y lo descontamos en el pago.'],
  'co.giftChecking': ['A verificar o cartão...', 'Checking the card...', 'Comprobando la tarjeta...'],
  'co.giftOk': ['Cartão aplicado. Saldo disponível: {n}{until}.', 'Card applied. Available balance: {n}{until}.', 'Tarjeta aplicada. Saldo disponible: {n}{until}.'],
  'co.giftUntil': [', válido até {d}', ', valid until {d}', ', válida hasta el {d}'],
  'co.giftEmpty': ['Este cartão já não tem saldo.', 'This card has no balance left.', 'Esta tarjeta ya no tiene saldo.'],
  'co.giftExpired': ['Este cartão já passou a validade.', 'This card has expired.', 'Esta tarjeta ha caducado.'],
  'co.giftNotFound': ['Não encontrámos este cartão. Confirma o código.', "We couldn't find this card. Check the code.", 'No encontramos esta tarjeta. Revisa el código.'],
  'co.giftOffline': ['Não conseguimos verificar agora. Confirmamos o saldo e descontamos no pagamento.', "We can't check it right now. We will confirm the balance and take it off at payment.", 'Ahora no podemos comprobarlo. Confirmamos el saldo y lo descontamos en el pago.'],
  'co.delivery': ['Entrega', 'Delivery', 'Entrega'],
  'co.yourData': ['Os teus dados', 'Your details', 'Tus datos'],
  'co.discount': ['Desconto {code}', 'Discount {code}', 'Descuento {code}'],
  'co.free': ['Grátis', 'Free', 'Gratis'],
  'co.opening': ['A abrir o pagamento...', 'Opening payment...', 'Abriendo el pago...'],
  'co.error': ['Não conseguimos enviar a encomenda. Tenta outra vez.', "We couldn't send your order. Please try again.", 'No hemos podido enviar el pedido. Inténtalo otra vez.'],
  'co.welcomeOnly': ['O código {code} é para quem subscreve a newsletter. Usa o email com que subscreveste ou subscreve no fundo da página.', 'The {code} code is for newsletter subscribers. Use the email you subscribed with, or subscribe at the bottom of the page.', 'El código {code} es para quien se suscribe a la newsletter. Usa el email con el que te suscribiste o suscríbete al final de la página.'],
  'co.welcomeUsed': ['O código {code} já foi usado numa encomenda com este email.', 'The {code} code has already been used on an order with this email.', 'El código {code} ya se usó en un pedido con este email.'],
  'ok.paid': ['Encomenda feita!', 'Order placed!', '¡Pedido hecho!'],
} satisfies Record<string, readonly [string, string, string]>;

const i = lang === 'en' ? 1 : lang === 'es' ? 2 : 0;

export const tc = (key: keyof typeof dict, vars: Record<string, string | number> = {}) =>
  dict[key][i].replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

/** Preço na língua da página */
export const money = (v: number) => fmt(v, lang);
/** Caminho em português traduzido para a língua da página */
export const localPath = (p: string) => path(lang, p);
/** Data curta na língua da página */
export const shortDate = (d: Date) => d.toLocaleDateString(lang === 'en' ? 'en-GB' : lang === 'es' ? 'es-ES' : 'pt-PT');
