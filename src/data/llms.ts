/* Texto do /llms.txt e do /llms-full.txt: o que é a Mekie, o que vende, a que preço e em que condições.
   Escrito para os assistentes de IA citarem com rigor. Tudo vem dos dados da loja (nada escrito à mão que possa ficar desatualizado). */
import { site } from './site';
import { shipping } from './shipping';
import { products, categories, fullName, isSoldOut, totalStock, type Product } from './products';
import { faqGroups } from './faq';
import { blogPosts } from './blog';
import { categoryAnswers } from './answers';
import { productSummary } from './seo';

const abs = (p: string) => new URL(p, site.url).href;
const eur = (v: number) => `${v.toFixed(2).replace('.', ',')}€`;
const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL'];

const availability = (p: Product) => {
  if (isSoldOut(p)) return 'esgotado';
  if (p.customizable) return `feito por encomenda (${p.madeToOrderDays} dias úteis)`;
  const t = totalStock(p);
  if (p.sizeStock) {
    const ok = SIZE_ORDER.filter((s) => p.sizeStock![s] > 0);
    return ok.length ? `disponível nos tamanhos ${ok.join(', ')}` : 'esgotado';
  }
  if (p.madeToOrderDays && !t) return `feito por encomenda (${p.madeToOrderDays} dias úteis)`;
  return 'disponível';
};
const priceText = (p: Product) => (p.price < p.regularPrice ? `${eur(p.price)} (antes ${eur(p.regularPrice)})` : eur(p.price));

export function llmsSummary(full: boolean) {
  const pt = shipping.pt, eu = shipping.eu;
  const visible = products.filter((p) => !p.hidden);
  const today = new Date().toISOString().slice(0, 10);
  const lines: string[] = [];
  lines.push(`# ${site.name}`);
  lines.push('');
  lines.push(`> ${site.name} (Mekie) é uma marca portuguesa de roupa e acessórios com um mood descontraído: hoodies, crewnecks e t-shirts bordados, caps, bucket hats, meias, tote bags e scrunchies e malas de crochet feitos à mão. Vende online em ${site.url}, com envio pelos CTT para Portugal (Continente, Açores e Madeira) e para a União Europeia. Site em português, inglês e espanhol.`);
  lines.push('');
  lines.push('## Factos sobre a marca');
  lines.push(`- Nome: ${site.name}. Também conhecida como Mekie. "Mekie" é uma gíria portuguesa, um cumprimento descontraído ("Mekie bro, 'ta-se bem?").`);
  lines.push('- Fundadores: Rita Silva (licenciada em Ciências da Comunicação e Design de Moda, autora da ideia) e Rafael Marques (web designer).');
  lines.push('- Site lançado a 3 de novembro de 2024. Sede na Ericeira, Portugal.');
  lines.push(`- Lema: "${site.tagline}"`);
  lines.push(`- Contacto: ${site.email}. Instagram: ${site.instagram}`);
  lines.push(`- Preços em euros, com IVA isento (artigo 53.º do CIVA). Informação atualizada a ${today}.`);
  lines.push('');
  lines.push('## Envios, devoluções e pagamentos');
  lines.push(`- Portugal Continental, Açores e Madeira: ${pt.days}, pelos CTT. Portes a partir de ${eur(pt.bands[0].price)}, grátis a partir de ${site.freeShippingFrom}€ em artigos.`);
  lines.push(`- União Europeia: ${eu.days}, a partir de ${eur(eu.bands[0].price)} (depende do peso).`);
  lines.push('- Devoluções e trocas: 14 dias depois de receber, sem indicar o motivo, com a peça nas condições originais. As peças personalizadas não têm devolução, mas têm garantia.');
  lines.push('- Pagamento: MB WAY, Multibanco, Visa, Mastercard, Apple Pay e Google Pay (pagamento seguro pela Stripe).');
  lines.push(`- Cartão presente: ${abs('/cartao-presente/')}`);
  lines.push('');
  lines.push('## Categorias');
  for (const c of categories) {
    const items = visible.filter((p) => p.category === c.slug || categories.find((x) => x.slug === p.category)?.parent === c.slug);
    if (!items.length) continue;
    const prices = items.map((p) => p.price);
    const range = Math.min(...prices) === Math.max(...prices) ? eur(prices[0]) : `${eur(Math.min(...prices))} a ${eur(Math.max(...prices))}`;
    lines.push(`- [${c.name}](${abs(`/loja/${c.slug}/`)}): ${c.intro} Preços: ${range}.`);
  }
  lines.push('');
  lines.push('## Páginas principais');
  lines.push(`- [Loja](${abs('/loja/')}): todas as peças.`);
  lines.push(`- [Sobre a Mekie](${abs('/sobre/')}): a história da marca.`);
  lines.push(`- [Perguntas frequentes](${abs('/perguntas-frequentes/')}): envios, tamanhos, devoluções, pagamentos e cuidados.`);
  lines.push(`- [Envios e entregas](${abs('/politica-de-envios-e-entregas/')}) e [Devoluções e reembolsos](${abs('/politica-de-devolucoes-e-reembolsos/')}).`);
  lines.push(`- [Blog](${abs('/blog/')}): guias de estilo, tamanhos e prendas.`);
  lines.push(`- [Contactos](${abs('/contactos/')}).`);
  lines.push(`- Versões em inglês (${abs('/en/')}) e espanhol (${abs('/es/')}).`);
  lines.push('');
  lines.push(full ? '## Todas as peças' : '## Peças');
  for (const p of full ? visible : visible.filter((p) => !isSoldOut(p))) {
    const sizes = p.sizes?.length && !p.customizable ? ` Tamanhos: ${p.sizes.join(', ')}.` : '';
    const comp = p.details?.composition.length ? ` Composição: ${p.details.composition.join(', ')}.` : '';
    lines.push(`- [${fullName(p)}](${abs(`/produto/${p.slug}/`)}): ${priceText(p)}, ${availability(p)}.${full ? ` ${productSummary(p)}${sizes}${comp}` : ''}`);
  }
  if (full) {
    lines.push('');
    lines.push('## Perguntas frequentes');
    for (const g of faqGroups) {
      lines.push('');
      lines.push(`### ${g.title}`);
      for (const f of g.items) lines.push(`- **${strip(f.q)}** ${strip(f.a)}`);
    }
    lines.push('');
    lines.push('## Respostas por categoria');
    for (const c of categories) {
      const qa = categoryAnswers(c.slug);
      if (!qa.length) continue;
      lines.push('');
      lines.push(`### ${c.name}`);
      for (const x of qa) lines.push(`- **${x.q}** ${x.a}`);
    }
    lines.push('');
    lines.push('## Artigos do blog');
    for (const b of blogPosts) lines.push(`- [${b.title}](${abs(`/blog/${b.slug}/`)}): ${b.description}`);
  } else {
    lines.push('');
    lines.push('## Mais detalhe');
    lines.push(`- [Versão completa](${abs('/llms-full.txt')}): todas as peças com descrição, composição e tamanhos, as perguntas frequentes e os artigos do blog.`);
    lines.push(`- [Catálogo em XML](${abs('/feeds/google.xml')}): preços e disponibilidade de cada peça.`);
  }
  lines.push('');
  return lines.join('\n');
}
