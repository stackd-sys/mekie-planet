/* Línguas do site. O português fica na raiz (/loja/), o inglês em /en/ e o espanhol em /es/,
   com o primeiro segmento do caminho traduzido (/en/shop/, /es/tienda/). O blog só existe em português. */

export const langs = ['pt', 'en', 'es'] as const;
export type Lang = (typeof langs)[number];

export const htmlLang: Record<Lang, string> = { pt: 'pt-PT', en: 'en', es: 'es-ES' };
export const ogLocale: Record<Lang, string> = { pt: 'pt_PT', en: 'en_GB', es: 'es_ES' };
export const langName: Record<Lang, string> = { pt: 'Português', en: 'English', es: 'Español' };
export const isLang = (v: unknown): v is Lang => langs.includes(v as Lang);

/** Primeiro segmento de cada página, por língua (em português é o caminho original) */
const segments: Record<string, Record<Exclude<Lang, 'pt'>, string>> = {
  loja: { en: 'shop', es: 'tienda' },
  produto: { en: 'product', es: 'producto' },
  colecoes: { en: 'collections', es: 'colecciones' },
  'cartao-presente': { en: 'gift-card', es: 'tarjeta-regalo' },
  contactos: { en: 'contact', es: 'contacto' },
  sobre: { en: 'about', es: 'sobre-nosotros' },
  'perguntas-frequentes': { en: 'faq', es: 'preguntas-frecuentes' },
  checkout: { en: 'checkout', es: 'checkout' },
  'encomenda-recebida': { en: 'order-received', es: 'pedido-recibido' },
  'termos-e-condicoes-de-servico': { en: 'terms-and-conditions', es: 'terminos-y-condiciones' },
  'politica-de-envios-e-entregas': { en: 'shipping-policy', es: 'politica-de-envios' },
  'politica-de-devolucoes-e-reembolsos': { en: 'returns-and-refunds-policy', es: 'politica-de-devoluciones-y-reembolsos' },
  'politica-de-privacidade': { en: 'privacy-policy', es: 'politica-de-privacidad' },
  'politica-de-cookies': { en: 'cookie-policy', es: 'politica-de-cookies' },
  'resolucao-de-litigios': { en: 'dispute-resolution', es: 'resolucion-de-litigios' },
};
/** Páginas que só existem em português */
const ptOnly = ['blog', 'newsletter', 'admin', 'api', 'images'];

/** Língua de um caminho (/en/shop/ → en) */
export function langOf(path: string): Lang {
  const first = path.split('/')[1];
  return first === 'en' || first === 'es' ? first : 'pt';
}

/** Caminho em português → o mesmo caminho noutra língua. Aceita query e âncora. */
export function href(lang: Lang, ptPath: string): string {
  if (lang === 'pt' || !ptPath.startsWith('/') || ptPath.startsWith('//')) return ptPath;
  const m = ptPath.match(/^([^?#]*)(.*)$/)!;
  const parts = m[1].split('/').filter(Boolean);
  if (parts[0] && ptOnly.includes(parts[0])) return ptPath;
  if (parts[0]) parts[0] = segments[parts[0]]?.[lang] ?? parts[0];
  return `/${[lang, ...parts].join('/')}/${m[2]}`;
}

/** Caminho em qualquer língua → caminho em português (para trocar de língua) */
export function toPt(path: string): string {
  const lang = langOf(path);
  if (lang === 'pt') return path;
  const m = path.match(/^([^?#]*)(.*)$/)!;
  const parts = m[1].split('/').filter(Boolean).slice(1);
  if (parts[0]) parts[0] = Object.keys(segments).find((k) => segments[k][lang] === parts[0]) ?? parts[0];
  return parts.length ? `/${parts.join('/')}/${m[2]}` : `/${m[2]}`;
}

/** Caminho em português traduzido para cada língua (hreflang e seletor de língua) */
export const alternates = (ptPath: string) => langs.map((l) => ({ lang: l, href: href(l, ptPath) }));

/** Preço: 5,90€ em português, €5.90 em inglês, 5,90 € em espanhol */
export function money(v: number, lang: Lang = 'pt'): string {
  const n = v.toFixed(2);
  if (lang === 'en') return `€${n}`;
  return lang === 'es' ? `${n.replace('.', ',')} €` : `${n.replace('.', ',')}€`;
}

/** Valor redondo sem cêntimos: 65€, €65, 65 € */
export const amount = (v: number, lang: Lang = 'pt') => money(v, lang).replace(/[.,]00(?!\d)/, '');
