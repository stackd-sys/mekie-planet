/* Preguntas frecuentes en español. Mismos grupos y preguntas que src/data/faq.ts; los valores salen de los mismos datos. */
import type { FaqGroup } from '../faq';
import { site } from '../site';
import { shipping } from '../shipping';
import { giftCard } from '../giftcard';
import { products } from '../products';

const pt = shipping.pt;
const eu = shipping.eu;
const custom = products.find((p) => p.customizable);

/** Estilo 5,90 € */
const price = (value: number) => `${value.toFixed(2).replace('.', ',')} €`;
/** 65 € para importes enteros, 5,90 € en otro caso */
const amount = (value: number) => (Number.isInteger(value) ? `${value} €` : price(value));
/** Plazo a partir de los números de la zona: [7] → "7 días laborables", [10, 15] → "de 10 a 15 días laborables" */
const workingDays = (days: string, from = false) => {
  const n = (days.match(/\d+/g) ?? []).map(Number);
  if (n.length > 1) return `${from ? 'de ' : ''}${n[0]} a ${n[n.length - 1]} días laborables`;
  return `${n[0]} día${n[0] === 1 ? '' : 's'} laborable${n[0] === 1 ? '' : 's'}`;
};
const validity = (() => {
  const m = giftCard.validityMonths;
  if (m % 12) return `${m} mes${m === 1 ? '' : 'es'}`;
  return m === 12 ? '1 año' : `${m / 12} años`;
})();
const giftValues = `${giftCard.values.join(', ').replace(/, (\d+)$/, ' o $1')} €`;

export const faqGroupsEs: FaqGroup[] = [
  {
    title: 'Envíos',
    items: [
      {
        q: '¿Cuánto tarda en llegar mi pedido?',
        a: `En Portugal continental, Azores y Madeira, hasta ${workingDays(pt.days)} desde que se confirma el pago. Al resto de la Unión Europea, ${workingDays(eu.days, true)}. Cuando sale tu pedido, te llega un email con el número de seguimiento de CTT.`,
      },
      {
        q: '¿Cuánto cuestan los gastos de envío?',
        a: `En Portugal, el envío cuesta ${price(pt.bands[0].price)} para pedidos de hasta ${pt.bands[0].upTo} g (una camiseta o accesorios) y ${price(pt.bands[1].price)} por encima de ese peso, y es gratis a partir de ${amount(pt.freeFrom ?? 0)}. A la Unión Europea empieza en ${price(eu.bands[0].price)} y depende del peso. El importe exacto aparece en el checkout cuando eliges el país. Echa un vistazo a la <a href="/es/politica-de-envios/">tabla completa</a>.`,
      },
      {
        q: '¿Enviáis a Azores y Madeira?',
        a: 'Sí, y pagas lo mismo que en el continente, con envío gratis en las mismas condiciones.',
      },
      {
        q: '¿Enviáis fuera de Portugal?',
        a: `Enviamos a todos los países de la Unión Europea. Si es para otro país, <a href="/es/contacto/">escríbenos</a> antes de hacer el pedido y vemos el envío contigo.`,
      },
    ],
  },
  {
    title: 'Tallas y prendas',
    items: [
      {
        q: '¿Cómo sé cuál es mi talla?',
        a: 'Las sudaderas y las camisetas son unisex y tienen un corte holgado. Para un look oversized, elige tu talla de siempre; si lo quieres más ajustado, coge una menos. Si dudas entre dos, quédate con la más grande. Lo explicamos todo en este <a href="/blog/como-escolher-o-tamanho-de-um-hoodie-oversized/">artículo sobre tallas</a> (en portugués), y si aun así tienes dudas, <a href="/es/contacto/">escríbenos</a>.',
      },
      {
        q: 'La talla que quiero está agotada. ¿Volverá?',
        a: 'En la página de la prenda, toca la talla agotada y déjanos tu email. Te avisamos una vez, cuando vuelva a haber stock.',
      },
      {
        q: '¿Cómo lavo las prendas bordadas?',
        a: 'Del revés, a 40 °C como máximo y sin lejía. No uses secadora y plancha solo por el revés. Hemos reunido todos los consejos <a href="/blog/como-lavar-roupa-bordada/">en este artículo</a> (en portugués).',
      },
      {
        q: '¿Cómo funciona el scrunchie personalizado?',
        a: `Eliges el color del cuerpo y el color del ribete entre los hilos disponibles y ves al momento cómo queda. Lo hacemos a mano, por encargo, y lo enviamos en ${custom?.madeToOrderDays ?? 10} días laborables. Como está hecho a tu gusto, no admite devolución, pero lo cubre la garantía si tiene algún defecto. <a href="/es/producto/scrunchie-personalizado/">Crear el mío</a>.`,
      },
    ],
  },
  {
    title: 'Pedidos y pago',
    items: [
      {
        q: '¿Qué formas de pago aceptáis?',
        a: 'MB WAY, Multibanco y tarjeta. Los precios incluyen IVA.',
      },
      {
        q: `¿Cómo uso el código del ${site.welcomeDiscount} % de la newsletter?`,
        a: `Suscríbete a la newsletter al final de cualquier página y te llegará el código ${site.welcomeCode}. Escríbelo en el checkout con el mismo email con el que te suscribiste. Te da un ${site.welcomeDiscount} % de descuento en tu primer pedido, una vez por persona, y no se puede combinar con otras promociones.`,
      },
      {
        q: '¿Puedo cambiar o cancelar un pedido?',
        a: `Si todavía no se ha enviado, sí. Escríbenos a <a href="mailto:${site.email}">${site.email}</a> con el número de pedido lo antes posible.`,
      },
    ],
  },
  {
    title: 'Cambios y devoluciones',
    items: [
      {
        q: '¿Puedo cambiar de talla?',
        a: 'Claro, durante los 14 días siguientes a recibir el pedido. Escríbenos antes de enviarla para que te reservemos la talla nueva. Tú pagas el envío de la prenda hasta nosotros y el envío de la nueva corre de nuestra cuenta.',
      },
      {
        q: '¿Cómo hago una devolución?',
        a: `Tienes 14 días para devolver sin dar explicaciones. Manda un email a <a href="mailto:${site.email}">${site.email}</a> con el número de pedido y las prendas que quieres devolver. Tienen que estar sin usar y con las etiquetas. Te reembolsamos las prendas y los gastos del envío original. Más detalles en la <a href="/es/politica-de-devoluciones-y-reembolsos/">política de devoluciones</a>.`,
      },
      {
        q: 'Mi prenda ha llegado con un defecto. ¿Y ahora qué?',
        a: 'Lo sentimos. Mándanos unas fotos por email y lo solucionamos sin ningún coste para ti. Todas las prendas tienen la garantía legal de 3 años.',
      },
    ],
  },
  {
    title: 'Tarjeta regalo',
    items: [
      {
        q: '¿Cómo funciona la tarjeta regalo?',
        a: `Eliges el importe (${giftValues}, u otro a tu medida desde ${giftCard.custom.min} €), escribes un mensaje y, después del pago, te enviamos la tarjeta por email con un código único. Quien la recibe usa el código en el checkout. <a href="/es/tarjeta-regalo/">Regalar una tarjeta</a>.`,
      },
      {
        q: '¿La tarjeta regalo caduca?',
        a: `Sí, a los ${validity} de la compra. Se puede usar en varios pedidos hasta que se acabe el saldo.`,
      },
    ],
  },
];
