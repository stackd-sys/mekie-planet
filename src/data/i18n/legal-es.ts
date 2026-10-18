import type { LegalPage } from '../legal';
import { site } from '../site';
import { giftCard } from '../giftcard';
import { shipping, packagingGrams } from '../shipping';

export const legalUpdatedEs = '16 de octubre de 2026';

const { company, email } = site;
const seller = [
  company.legalName,
  company.kind && 'empresario individual (empresário em nome individual)',
  company.nif && `NIF ${company.nif}`,
  `con domicilio en ${company.address}`,
]
  .filter(Boolean)
  .join(', ');
const pt = shipping.pt;
const eu = shipping.eu;
const price = (value: number) => `${value.toFixed(2).replace('.', ',')} €`;
const kg = (g: number) => (g >= 1000 ? `${String(g / 1000).replace('.', ',')} kg` : `${g} g`);
/* Los plazos salen de los números de los textos en portugués ("7 dias úteis", "10 a 15 dias úteis") */
const workingDays = (s: string) => {
  const n = s.match(/\d+/g) ?? [];
  if (n.length > 1) return `${n[0]} a ${n[1]} días hábiles`;
  return `${n[0]} día${n[0] === '1' ? '' : 's'} hábil${n[0] === '1' ? '' : 'es'}`;
};
const giftValidity = (() => {
  const m = giftCard.validityMonths;
  if (m % 12) return `${m} ${m === 1 ? 'mes' : 'meses'}`;
  return m === 12 ? '1 año' : `${m / 12} años`;
})();
const giftValues = `${giftCard.values.join(', ').replace(/, (\d+)$/, ' y $1')} €`;
/* Filas de la tabla de envíos: un tramo de peso por fila */
const rateRows = (dest: string, z: typeof pt) =>
  z.bands.map((b, i) => [
    i === 0 ? dest : '',
    i === 0 ? `hasta ${kg(b.upTo)}` : `de ${kg(z.bands[i - 1].upTo)} a ${kg(b.upTo)}`,
    price(b.price),
    i === 0 ? (z.freeFrom === null ? 'sin envío gratis' : `gratis a partir de ${z.freeFrom} €`) : '',
  ]);
const analytics = site.analytics;

export const legalPagesEs: LegalPage[] = [
  {
    slug: 'terminos-y-condiciones',
    title: 'Términos y Condiciones',
    summary: 'Condiciones de venta de la tienda online Mekie Planet: pedidos, precios, pago, envíos, devoluciones y garantía.',
    sections: [
      {
        heading: 'Quiénes somos',
        body: [
          `La tienda online mekie-planet.com la gestiona ${seller}. Puedes escribirnos a ${email}.`,
          'Estos términos se aplican a todas las compras hechas en la web. Al hacer un pedido, aceptas estos términos, la Política de Envíos y Entregas, la Política de Devoluciones y Reembolsos y la Política de Privacidad.',
          'Estos términos son una traducción del original en portugués y, si hay alguna discrepancia entre ambos, prevalece la versión portuguesa.',
        ],
      },
      {
        heading: 'Productos y stock',
        body: [
          'Mostramos el stock real de cada pieza y de cada talla. Cuando una talla se agota, aparece tachada y no se puede pedir.',
          'Algunas piezas se hacen a mano por encargo, como los scrunchies. En esos casos, el plazo de producción aparece en la página del producto y se suma al plazo de envío.',
          'Las fotos son de nuestras piezas, pero el color puede variar ligeramente según la pantalla.',
        ],
      },
      {
        heading: 'Precios',
        body: [
          'Los precios están en euros e incluyen el IVA al tipo legal vigente. Los gastos de envío no están incluidos y se muestran en el checkout antes de que completes el pedido.',
          'Si, por un error evidente, un precio está mal, te avisamos antes de enviar el pedido y puedes elegir entre seguir con el precio correcto o cancelar, con reembolso total.',
        ],
      },
      {
        heading: 'Pedidos',
        body: [
          'El pedido queda confirmado cuando recibes nuestro email de confirmación. Si una pieza deja de estar disponible después de que la pidas, te avisamos y te reembolsamos el importe de esa pieza en un plazo máximo de 14 días.',
        ],
      },
      {
        heading: 'Pago',
        body: [
          'Aceptamos MB WAY, referencia Multibanco, tarjeta de crédito y de débito, Apple Pay y Google Pay. Los pagos con tarjeta los procesa un proveedor de pagos certificado y Mekie nunca ve ni guarda los datos de tu tarjeta.',
          'Enviamos el pedido una vez confirmado el pago.',
        ],
      },
      {
        heading: 'Códigos de descuento',
        body: [
          `El código ${site.welcomeCode} da un ${site.welcomeDiscount}% de descuento en el primer pedido a quien se suscribe a la newsletter. Solo se puede usar una vez por persona y con el email con el que te suscribiste.`,
          'Los códigos no se acumulan entre sí ni con otras promociones, no se aplican a los gastos de envío ni a la compra de tarjetas regalo y no se pueden canjear por dinero.',
        ],
      },
      {
        heading: 'Tarjetas regalo',
        body: [
          {
            list: [
              `La tarjeta regalo es digital, existe en importes de ${giftValues} y se envía por email, con un código único, en un plazo de ${workingDays(String(giftCard.sendDays))} tras el pago. No tiene gastos de envío.`,
              `Es válida durante ${giftValidity} a partir de la fecha de compra, que figura en el email.`,
              'Se puede usar en varios pedidos de la tienda online hasta agotar el saldo, y también junto con un código de descuento. Si el pedido cuesta más que el saldo, pagas la diferencia.',
              'No se puede canjear por dinero ni usar para comprar otras tarjetas regalo. El saldo que quede al final de la validez no se reembolsa.',
              'Guarda bien el código: funciona como dinero y no respondemos del uso de un código que hayas compartido o perdido. Si crees que alguien lo ha usado indebidamente, escríbenos enseguida.',
              'Si devuelves una pieza pagada con tarjeta regalo, el importe pagado con la tarjeta vuelve al saldo de la tarjeta.',
              'Tienes 14 días para desistir de la compra de una tarjeta regalo, siempre que todavía no se haya usado. En ese caso te reembolsamos el importe total.',
            ],
          },
        ],
      },
      {
        heading: 'Envíos, devoluciones y garantía',
        body: [
          'Los destinos, precios y plazos de envío están en la Política de Envíos y Entregas.',
          'Tienes 14 días para devolver una compra sin indicar el motivo, en los términos de la Política de Devoluciones y Reembolsos. Las piezas personalizadas, como el scrunchie con los colores que eliges, no admiten devolución, pero están cubiertas por la garantía.',
          'Todas las piezas tienen la garantía legal de conformidad de 3 años desde la entrega, prevista en el Decreto-Ley n.º 84/2021. Si una pieza tiene un defecto, escríbenos y lo resolvemos mediante reparación, sustitución, reducción del precio o reembolso, según la ley.',
        ],
      },
      {
        heading: 'Propiedad intelectual',
        body: [
          'Los diseños Mekie, el logotipo, las fotos y los textos de la web son nuestros. No se pueden copiar ni usar sin autorización por escrito.',
        ],
      },
      {
        heading: 'Ley aplicable y litigios',
        body: [
          'Estos términos se rigen por la ley portuguesa. Si tienes un problema que no consigamos resolver contigo, puedes acudir a las entidades indicadas en la página Resolución de Litigios o al Livro de Reclamações Eletrónico (libro de reclamaciones electrónico oficial de Portugal).',
          `Podemos actualizar estos términos. La versión aplicable es la que estaba publicada el día de tu pedido. Última actualización: ${legalUpdatedEs}.`,
        ],
      },
    ],
  },
  {
    slug: 'politica-de-envios',
    title: 'Política de Envíos y Entregas',
    summary: `Envíos con CTT a Portugal, Azores y Madeira desde ${price(pt.bands[0].price)}, gratis a partir de ${pt.freeFrom} €, y a la Unión Europea desde ${price(eu.bands[0].price)}. Plazos y seguimiento.`,
    sections: [
      {
        heading: 'A dónde enviamos',
        body: [
          'Enviamos con CTT (correos de Portugal) a Portugal continental, Azores, Madeira y todos los países de la Unión Europea. Para otros países, escríbenos antes de hacer el pedido.',
        ],
      },
      {
        heading: 'Precios',
        body: [
          {
            table: {
              head: ['Destino', 'Peso del pedido', 'Envío', 'Envío gratis'],
              rows: [...rateRows('Portugal continental, Azores y Madeira', pt), ...rateRows('Unión Europea', eu)],
            },
          },
          'El importe exacto aparece en el checkout cuando eliges el país. El envío gratis se calcula con el valor de los artículos antes de descuentos. Azores y Madeira pagan lo mismo que el continente.',
          `El peso incluye el embalaje (unos ${packagingGrams} g). Como referencia, una camiseta pesa unos 250 g, un accesorio entre 50 y 180 g y una sudadera unos 700 g. Por encima de ${kg(eu.bands[eu.bands.length - 1].upTo)}, el pedido se envía en más de un paquete y los gastos de envío se suman.`,
        ],
      },
      {
        heading: 'Plazos',
        body: [
          {
            list: [
              `Portugal continental, Azores y Madeira: hasta ${workingDays(pt.days)} tras la confirmación del pago.`,
              `Unión Europea: ${workingDays(eu.days)} tras la confirmación del pago.`,
              'Piezas hechas por encargo: al plazo de envío se suma el plazo de producción indicado en la página del producto.',
            ],
          },
          'En épocas festivas o de rebajas los plazos pueden ser algo más largos. Si hay un retraso, te avisamos por email.',
        ],
      },
      {
        heading: 'Seguimiento del pedido',
        body: ['Cuando el pedido sale, te enviamos un email con el número de seguimiento de CTT.'],
      },
      {
        heading: 'Dirección y entrega',
        body: [
          'Revisa bien la dirección en el checkout. Si el pedido vuelve a nosotros por una dirección incompleta o porque no se ha recogido, lo enviamos de nuevo cuando pagues los nuevos gastos de envío, o te reembolsamos el valor de los artículos.',
          `Si el pedido llega dañado o falta alguna pieza, envíanos fotos a ${email} y lo resolvemos sin coste para ti.`,
        ],
      },
      {
        heading: 'Impuestos',
        body: ['Los precios incluyen IVA. En los envíos a la Unión Europea no hay aranceles aduaneros.'],
      },
    ],
  },
  {
    slug: 'politica-de-devoluciones-y-reembolsos',
    title: 'Política de Devoluciones y Reembolsos',
    summary: 'Tienes 14 días para devolver sin indicar el motivo. Cómo devolver, cambiar de talla y cuándo recibes el reembolso.',
    sections: [
      {
        heading: 'Derecho de desistimiento',
        body: [
          'Tienes 14 días naturales, a contar desde el día en que recibes el pedido, para desistir de la compra sin indicar el motivo, en los términos del Decreto-Ley n.º 24/2014.',
        ],
      },
      {
        heading: 'Cómo devolver',
        body: [
          {
            list: [
              `Envíanos un email a ${email} con el número de pedido y las piezas que quieres devolver. También puedes usar el formulario de desistimiento que está al final de esta página.`,
              'Te respondemos con la dirección a la que enviarlas.',
              'Envía las piezas en un plazo de 14 días desde tu email.',
            ],
          },
          'Los gastos de envío de la devolución corren de tu cuenta. Te recomendamos un envío con seguimiento.',
        ],
      },
      {
        heading: 'Estado de las piezas',
        body: [
          'Puedes probarte las piezas como en una tienda. Si una pieza vuelve usada, lavada o sin las etiquetas, podemos descontar del reembolso la depreciación causada.',
        ],
      },
      {
        heading: 'Reembolso',
        body: [
          'Te reembolsamos el valor de las piezas y los gastos del envío original (hasta el importe del envío normal) en un plazo de 14 días desde tu comunicación, por el mismo medio de pago. Podemos esperar hasta recibir las piezas o hasta que nos envíes el justificante de envío, lo que ocurra primero.',
          'Si devuelves solo una parte del pedido, los gastos del envío original no se reembolsan.',
        ],
      },
      {
        heading: 'Cambios de talla',
        body: [
          'Para cambiar de talla, escríbenos antes de devolver nada. Si hay stock, te reservamos la pieza. Tú pagas el envío de la pieza hasta nosotros y el envío de la nueva corre de nuestra cuenta.',
        ],
      },
      {
        heading: 'Piezas personalizadas',
        body: [
          'Los scrunchies personalizados se hacen con los colores que eliges y, por eso, no tienen derecho de desistimiento (artículo 17 del Decreto-Ley n.º 24/2014). Siguen cubiertos por la garantía legal si tienen algún defecto.',
        ],
      },
      {
        heading: 'Piezas defectuosas',
        body: [
          'Si una pieza tiene un defecto o no corresponde a lo que pediste, escríbenos. En ese caso, los gastos de envío corren de nuestra cuenta y tienes la garantía legal de 3 años.',
        ],
      },
      {
        heading: 'Formulario de desistimiento',
        body: [
          'Copia este texto en el email y rellénalo:',
          `A la atención de: ${seller}, ${email}.`,
          'Por la presente comunico que desisto del contrato de compra de las siguientes piezas: [piezas]. Pedido n.º [número], recibido el [fecha]. Nombre: [nombre]. Dirección: [dirección]. Fecha: [fecha].',
        ],
      },
    ],
  },
  {
    slug: 'politica-de-privacidad',
    title: 'Política de Privacidad',
    summary: 'Qué datos personales recogemos, para qué, con quién los compartimos, durante cuánto tiempo y cuáles son tus derechos.',
    sections: [
      {
        heading: 'Responsable del tratamiento',
        body: [`${seller}. Para cualquier asunto sobre tus datos, escribe a ${email}.`],
      },
      {
        heading: 'Qué datos recogemos y para qué',
        body: [
          {
            table: {
              head: ['Situación', 'Datos', 'Para qué y con qué base'],
              rows: [
                ['Pedido', 'Nombre, email, móvil, dirección, NIF (opcional) y artículos', 'Procesar, facturar y enviar el pedido. Ejecución del contrato y obligaciones fiscales.'],
                ['Newsletter', 'Email y fecha de suscripción', 'Enviar novedades y el código de bienvenida, y comprobar que el código solo se usa una vez. Consentimiento.'],
                ['Contacto', 'Nombre, email y mensaje', 'Responder a tu solicitud. Medidas solicitadas por ti.'],
                ['Aviso de reposición', 'Email, producto y talla', 'Avisarte una vez cuando la pieza vuelva a estar en stock. Medidas solicitadas por ti.'],
                ['Tarjeta regalo', 'Nombre de quien regala, nombre y email de quien la recibe (opcional) y mensaje', 'Enviar la tarjeta y controlar el saldo. Ejecución del contrato.'],
                ['Estadísticas', 'Páginas vistas, piezas vistas y añadidas al carrito, tipo de dispositivo, ciudad aproximada', 'Entender cómo se usa la web y mejorarla. Consentimiento, dado en el aviso de cookies.'],
                ['Publicidad', 'Identificador del navegador, páginas y piezas vistas, compras iniciadas', 'Medir los anuncios de Mekie y mostrarlos a quien ya ha visitado la web. Consentimiento, dado en el aviso de cookies.'],
              ],
            },
          },
          'No tomamos decisiones automatizadas sobre ti. Las estadísticas y la publicidad solo funcionan si las aceptas en el aviso de cookies, y puedes cambiar de opinión en cualquier momento en Ajustes de cookies, al pie de todas las páginas.',
          'Con independencia de las cookies, contamos de forma anónima las visitas a la web: qué páginas se ven, desde qué web o campaña se llega, el tipo de dispositivo (móvil u ordenador), los pasos de la compra y si la persona aceptó, rechazó o no respondió al aviso de cookies. No usamos cookies ni guardamos la dirección IP ni ningún identificador: cada visita solo suma una unidad a totales diarios, que no permiten identificar a nadie.',
        ],
      },
      {
        heading: 'Con quién los compartimos',
        body: [
          'Solo con quien necesitamos para que la tienda funcione, y solo los datos necesarios:',
          {
            list: [
              'CTT, para entregar el pedido.',
              'El proveedor de pagos (Stripe), para procesar el pago de forma segura.',
              'Vercel, que aloja la web, y Neon, donde está la base de datos de pedidos, clientes y newsletter (servidores en la Unión Europea).',
              'Resend, que envía los emails de la tienda (confirmación del pedido, envío, tarjetas regalo y avisos).',
              'Google, si lo aceptas, para las estadísticas (Google Analytics).',
              'Meta (Facebook e Instagram), si aceptas las cookies de publicidad (Meta Pixel).',
              'Nuestro contable, para la facturación.',
            ],
          },
          'Algunos de estos servicios pueden tratar datos fuera de la Unión Europea. En esos casos, la transferencia está protegida por el Marco de Privacidad de Datos UE-EE. UU. o por cláusulas contractuales tipo aprobadas por la Comisión Europea.',
          'Google y Meta también tratan los datos de estadísticas y publicidad para sus propios fines, según sus propias políticas de privacidad. Los detalles de cada cookie están en la Política de Cookies.',
        ],
      },
      {
        heading: 'Durante cuánto tiempo',
        body: [
          {
            list: [
              'Datos de pedidos y facturas: 10 años, como exige la ley fiscal.',
              'Newsletter: hasta que canceles la suscripción. Cada email tiene un enlace para hacerlo.',
              'Mensajes de contacto: hasta 2 años después del último contacto.',
              'Avisos de reposición: los borramos después de enviar el aviso o al cabo de 1 año.',
              'Tarjetas regalo: hasta el final de la validez de la tarjeta y, después, lo necesario para la facturación.',
              'Estadísticas (Google Analytics): 14 meses.',
              'Tu elección en el aviso de cookies: 6 meses, después te volvemos a preguntar.',
            ],
          },
        ],
      },
      {
        heading: 'Tus derechos',
        body: [
          `Puedes solicitar el acceso, la rectificación, la supresión, la limitación o la portabilidad de tus datos, oponerte a su tratamiento y retirar el consentimiento en cualquier momento. Basta con que escribas a ${email}. Respondemos en un plazo máximo de un mes.`,
          'También puedes presentar una reclamación ante la Comissão Nacional de Proteção de Dados (autoridad portuguesa de protección de datos, www.cnpd.pt).',
        ],
      },
      {
        heading: 'Seguridad y menores',
        body: [
          'La web usa conexión segura (HTTPS) y solo quien lo necesita tiene acceso a los datos. La newsletter está dirigida a mayores de 16 años.',
          `Última actualización: ${legalUpdatedEs}.`,
        ],
      },
    ],
  },
  {
    slug: 'politica-de-cookies',
    title: 'Política de Cookies',
    summary: 'Qué cookies usa la web de Mekie, para qué, durante cuánto tiempo y cómo las aceptas, las rechazas o cambias de opinión.',
    sections: [
      {
        heading: 'Qué son las cookies',
        body: [
          'Las cookies son pequeños archivos que una web guarda en tu navegador. También existe el almacenamiento local (localStorage), que funciona de forma parecida. Esta política explica los dos.',
        ],
      },
      {
        heading: 'Cómo eliges',
        body: [
          'En la primera visita mostramos un aviso donde puedes aceptar, rechazar o elegir por tipo. Las cookies de estadísticas y de publicidad solo se activan si las aceptas. Si las rechazas, la web funciona igual.',
          'Puedes cambiar tu elección en cualquier momento en Ajustes de cookies, al pie de todas las páginas. Guardamos tu elección durante 6 meses y después te volvemos a preguntar.',
          'Para saber cuántas personas visitan la web, también hacemos un recuento anónimo que no usa cookies ni guarda nada en tu navegador: solo sumamos la visita a totales diarios, sin dirección IP ni identificadores (consulta la Política de Privacidad).',
        ],
      },
      {
        heading: 'Necesarias',
        body: [
          'Sirven para que la tienda funcione y para recordar tus elecciones. No necesitan consentimiento y no se comparten con nadie.',
          {
            table: {
              head: ['Nombre', 'Para qué', 'Duración'],
              rows: [
                ['mekie-cart-v1', 'Guardar tu carrito', 'Hasta que vacíes el carrito'],
                ['mekie-consent', 'Guardar tu elección sobre las cookies', '6 meses'],
                ['mekie-code-applied', 'Recordar el código de descuento que has aplicado', 'Hasta que lo quites'],
                ['mekie-newsletter, mekie-newsletter-outcome, mekie-newsletter-emails', 'Saber que ya te has suscrito a la newsletter, para no volver a mostrar el pop-up', 'Hasta que borres los datos del navegador'],
                ['mekie-popup-closed', 'No volver a mostrar el pop-up durante 7 días después de cerrarlo', '7 días'],
                ['mekie-grid', 'Recordar si prefieres ver la tienda con 2 o 4 columnas', 'Hasta que borres los datos del navegador'],
              ],
            },
          },
        ],
      },
      {
        heading: 'Estadísticas (solo con tu consentimiento)',
        body: [
          'Usamos Google Analytics, de Google, para saber cuántas personas visitan la web, qué páginas y piezas ven y de dónde vienen. La dirección IP no se guarda.',
          {
            table: {
              head: ['Nombre', 'De quién', 'Para qué', 'Duración'],
              rows: [
                ['_ga', 'Google', 'Distinguir a los visitantes', '2 años'],
                [`_ga_${analytics.ga4.replace(/^G-/, '') || 'ID'}`, 'Google', 'Guardar el estado de la visita', '2 años'],
                ['mekie-utm', 'Mekie (en tu navegador)', 'Saber de qué publicación, anuncio o colaboración has llegado, para añadirlo al pedido', '30 días'],
              ],
            },
          },
        ],
      },
      {
        heading: 'Publicidad (solo con tu consentimiento)',
        body: [
          'Usamos Meta Pixel, de Meta (Facebook e Instagram), para medir los resultados de nuestros anuncios y mostrarlos a quien ya ha visitado la tienda. Si lo aceptas, Google también puede usar los datos de las estadísticas para medir anuncios.',
          {
            table: {
              head: ['Nombre', 'De quién', 'Para qué', 'Duración'],
              rows: [
                ['_fbp', 'Meta', 'Identificar el navegador para medir y mostrar anuncios', '3 meses'],
                ['_fbc', 'Meta', 'Guardar el anuncio en el que hiciste clic para llegar a la web', '3 meses'],
              ],
            },
          },
          'Google y Meta pueden tratar estos datos fuera de la Unión Europea, al amparo del Marco de Privacidad de Datos UE-EE. UU. Más información en policies.google.com/privacy y en facebook.com/privacy/policy.',
        ],
      },
      {
        heading: 'Pagos',
        body: [
          'Cuando pagas con tarjeta, MB WAY o Multibanco, el pago se hace en una página segura del proveedor de pagos (Stripe), que puede usar sus propias cookies para prevenir el fraude. Esas cookies son responsabilidad de Stripe y se describen en su política de cookies.',
        ],
      },
      {
        heading: 'Cómo borrarlas',
        body: [
          'Además de en Ajustes de cookies, puedes borrar las cookies y los datos de la web en los ajustes de tu navegador, en Privacidad o Datos de navegación. Si lo haces, el carrito se vacía y te volvemos a preguntar tu elección.',
          `Última actualización: ${legalUpdatedEs}.`,
        ],
      },
    ],
  },
  {
    slug: 'resolucion-de-litigios',
    title: 'Resolución de Litigios',
    summary: 'Entidades de resolución alternativa de litigios de consumo y Livro de Reclamações Eletrónico.',
    sections: [
      {
        body: [
          `Si tienes un problema con una compra, escríbenos primero a ${email}. Siempre intentamos resolverlo directamente.`,
          'Si no llegamos a un acuerdo, puedes acudir a una entidad de resolución alternativa de litigios de consumo, en los términos de la Ley n.º 144/2015:',
          {
            list: [
              'CNIACC, Centro Nacional de Informação e Arbitragem de Conflitos de Consumo (Centro Nacional de Información y Arbitraje de Conflictos de Consumo, www.cniacc.pt).',
              'Centro de Arbitragem de Conflitos de Consumo de Lisboa (www.centroarbitragemlisboa.pt).',
            ],
          },
          'Más información en el Portal do Consumidor (www.consumidor.gov.pt). También puedes presentar una reclamación en el Livro de Reclamações Eletrónico (libro de reclamaciones electrónico oficial de Portugal, www.livroreclamacoes.pt).',
        ],
      },
    ],
  },
];
