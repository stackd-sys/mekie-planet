import { cart, money, href, maxQty } from './cart';
import * as newsletter from './newsletter';

const FREE_FROM = Number(document.documentElement.dataset.freeShipping || 65);

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/* ---------- Avisos rotativos ---------- */
const items = document.querySelectorAll<HTMLElement>('.announce__item');
if (items.length > 1) {
  let i = 0;
  setInterval(() => {
    items[i].classList.remove('is-active');
    i = (i + 1) % items.length;
    items[i].classList.add('is-active');
  }, 4000);
}

/* ---------- Header sólido ao fazer scroll ---------- */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header?.classList.contains('header--overlay')) {
  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Painéis (menu e carrinho) ---------- */
let lastFocus: Element | null = null;
function openPanel(el: HTMLElement | null, focus = true) {
  if (!el) return;
  lastFocus = document.activeElement;
  el.hidden = false;
  document.body.classList.add('no-scroll');
  /* preventScroll evita que o browser (ou a página que embebe o site) salte ao focar */
  if (focus) el.querySelector<HTMLElement>('[data-autofocus], button, a')?.focus({ preventScroll: true });
}
function closePanel(el: HTMLElement | null) {
  if (!el || el.hidden) return;
  el.hidden = true;
  if (!document.querySelector('[data-cart]:not([hidden]), [data-mnav]:not([hidden]), [data-popup]:not([hidden])')) {
    document.body.classList.remove('no-scroll');
  }
  (lastFocus as HTMLElement | null)?.focus?.({ preventScroll: true });
}

const mnav = document.querySelector<HTMLElement>('[data-mnav]');
const drawer = document.querySelector<HTMLElement>('[data-cart]');
document.querySelectorAll('[data-menu-open]').forEach((b) => b.addEventListener('click', () => openPanel(mnav)));
document.querySelectorAll('[data-menu-close]').forEach((b) => b.addEventListener('click', () => closePanel(mnav)));
document.querySelectorAll('[data-cart-open]').forEach((b) => b.addEventListener('click', () => openPanel(drawer)));
document.querySelectorAll('[data-cart-close]').forEach((b) => b.addEventListener('click', () => closePanel(drawer)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePanel(drawer);
    closePanel(mnav);
  }
});
export const openCart = () => openPanel(drawer);

/* ---------- Render do carrinho ---------- */
const list = document.querySelector<HTMLElement>('[data-cart-items]');
cart.subscribe((lines) => {
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);

  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });
  document.querySelectorAll<HTMLElement>('[data-cart-count-label]').forEach((el) => (el.textContent = count ? `(${count})` : ''));
  document.querySelectorAll<HTMLElement>('[data-cart-subtotal]').forEach((el) => (el.textContent = money(subtotal)));

  const missing = Math.max(0, FREE_FROM - subtotal);
  const shipText = document.querySelector<HTMLElement>('[data-ship-text]');
  const shipBar = document.querySelector<HTMLElement>('[data-ship-bar]');
  if (shipText) shipText.innerHTML = missing > 0 ? `Faltam <strong>${money(missing)}</strong> para teres envio gratuito em Portugal.` : 'Tens <strong>envio gratuito</strong> em Portugal.';
  if (shipBar) shipBar.style.width = `${Math.min(100, (subtotal / FREE_FROM) * 100)}%`;

  const empty = document.querySelector<HTMLElement>('[data-cart-empty]');
  const foot = document.querySelector<HTMLElement>('[data-cart-foot]');
  const ship = document.querySelector<HTMLElement>('[data-ship]');
  if (empty) empty.hidden = count > 0;
  if (foot) foot.hidden = count === 0;
  if (ship) ship.hidden = count === 0;

  document.querySelectorAll<HTMLElement>('[data-upsell-item]').forEach((el) => {
    el.hidden = lines.some((l) => String(l.id) === el.dataset.upsellItem);
  });
  const upsell = document.querySelector<HTMLElement>('[data-upsell]');
  if (upsell) upsell.hidden = count === 0 || !upsell.querySelector('[data-upsell-item]:not([hidden])');

  if (list) {
    list.innerHTML = lines
      .map(
        (l) => `
      <li class="line" data-key="${esc(l.key)}">
        <a href="${href(`/produto/${esc(l.slug)}/`)}"><img class="line__img" src="${href(esc(l.image))}" alt="" width="84" height="105" /></a>
        <div>
          <p class="line__name"><a href="${href(`/produto/${esc(l.slug)}/`)}">${esc(l.name)}</a></p>
          <p class="line__meta">${esc(l.custom || l.color)}${l.size ? ` · Tamanho ${esc(l.size)}` : ''}${l.madeToOrderDays && l.qty > (l.stock ?? 0) ? `<br>${l.qty - (l.stock ?? 0)} por encomenda, entrega em ${l.madeToOrderDays} dias úteis` : ''}</p>
          <div class="qty">
            <button type="button" data-qty="-1" aria-label="Diminuir quantidade">−</button>
            <span aria-live="polite">${l.qty}</span>
            <button type="button" data-qty="1" aria-label="Aumentar quantidade"${l.qty >= maxQty(l) ? ' disabled title="Sem mais unidades em stock"' : ''}>+</button>
          </div>
        </div>
        <div class="line__right">
          <span class="line__price">${money(l.price * l.qty)}</span>
          <button type="button" class="line__remove" data-remove>Remover</button>
        </div>
      </li>`,
      )
      .join('');
  }
});

list?.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const li = target.closest<HTMLElement>('[data-key]');
  if (!li) return;
  const key = li.dataset.key!;
  const line = cart.lines.find((l) => l.key === key);
  if (!line) return;
  const step = target.closest<HTMLElement>('[data-qty]');
  if (step) cart.setQty(key, line.qty + Number(step.dataset.qty));
  if (target.closest('[data-remove]')) cart.remove(key);
});

/* ---------- Newsletter com 10% de boas-vindas ---------- */
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} },
};
const subscribed = () => store.get('mekie-newsletter') === 'subscribed';

type Outcome = 'new' | 'exists' | 'used';
const SUCCESS: Record<Outcome, { title: string; sub: string; code: boolean }> = {
  new: { title: 'Já estás na lista.', sub: 'Usa este código no checkout:', code: true },
  exists: { title: 'Este email já estava na lista.', sub: 'O teu código continua válido:', code: true },
  used: {
    title: 'Este email já está na lista.',
    sub: 'O código de boas-vindas já foi usado numa encomenda com este email. É válido uma vez por cliente.',
    code: false,
  },
};

function showSuccess(form: HTMLFormElement, outcome: Outcome = 'new') {
  const box = form.closest<HTMLElement>('[data-newsletter-box]') ?? form;
  const text = SUCCESS[outcome];
  box.querySelectorAll<HTMLElement>('[data-success-title]').forEach((el) => (el.textContent = text.title));
  box.querySelectorAll<HTMLElement>('[data-success-sub]').forEach((el) => (el.textContent = text.sub));
  box.querySelectorAll<HTMLElement>('[data-code-wrap]').forEach((el) => (el.hidden = !text.code));
  box.querySelectorAll<HTMLElement>('[data-success]').forEach((el) => (el.hidden = false));
  box.querySelectorAll<HTMLElement>('[data-before]').forEach((el) => (el.hidden = true));
  form.hidden = true;
}

document.querySelectorAll<HTMLFormElement>('[data-newsletter]').forEach((form) => {
  if (subscribed()) showSuccess(form, (store.get('mekie-newsletter-outcome') as Outcome) || 'new');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const msg = form.querySelector<HTMLElement>('[data-msg]');
    const btn = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (msg) { msg.textContent = 'Escreve um email válido.'; msg.hidden = false; }
      return;
    }
    if (form.querySelector('[name=consent]') && !data.get('consent')) {
      if (msg) { msg.textContent = 'Para continuar, aceita receber os nossos emails.'; msg.hidden = false; }
      return;
    }
    if (msg) msg.hidden = true;
    if (btn) btn.disabled = true;
    try {
      const before = newsletter.knownLocally(email);
      const res = await newsletter.subscribe(email, form.dataset.newsletter || 'site');
      const outcome: Outcome = res.used ? 'used' : res.status === 'exists' || (res.status === 'unknown' && before) ? 'exists' : 'new';
      newsletter.rememberLocally(email);
      store.set('mekie-newsletter', 'subscribed');
      store.set('mekie-newsletter-outcome', outcome);
      document.querySelectorAll<HTMLFormElement>('[data-newsletter]').forEach((f) => showSuccess(f, outcome));
      document.querySelector<HTMLElement>('[data-popup-tab]')?.setAttribute('hidden', '');
    } catch {
      if (msg) { msg.textContent = 'Não conseguimos guardar o teu email. Tenta outra vez daqui a pouco.'; msg.hidden = false; }
    } finally {
      if (btn) btn.disabled = false;
    }
  });
});

const CODE = newsletter.CODE;
document.querySelectorAll<HTMLButtonElement>('[data-copy-code]').forEach((btn) =>
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      btn.textContent = 'Copiado';
    } catch {
      const code = btn.parentElement?.querySelector('code');
      if (code) getSelection()?.selectAllChildren(code);
      btn.textContent = 'Seleciona e copia';
    }
    setTimeout(() => (btn.textContent = 'Copiar'), 2000);
  }),
);

/* ---------- Popup de 10% ---------- */
const popup = document.querySelector<HTMLElement>('[data-popup]');
const tab = document.querySelector<HTMLElement>('[data-popup-tab]');
if (popup) {
  const DAY = 864e5;
  const closedAt = Number(store.get('mekie-popup-closed') || 0);
  const snoozed = Date.now() - closedAt < 7 * DAY;
  let shown = false;

  const show = (auto: boolean) => {
    if (shown && auto) return;
    if (auto && document.body.classList.contains('no-scroll')) return;
    shown = true;
    if (tab) tab.hidden = true;
    /* aberto sozinho: sem foco automático, para a página não saltar */
    openPanel(popup, !auto);
  };
  const close = () => {
    closePanel(popup);
    store.set('mekie-popup-closed', String(Date.now()));
    if (tab && !subscribed()) tab.hidden = false;
  };

  if (!subscribed()) {
    if (!snoozed) {
      setTimeout(() => show(true), 10000);
    } else if (tab) {
      tab.hidden = false;
    }
  }
  document.querySelectorAll('[data-popup-open]').forEach((b) => b.addEventListener('click', () => show(false)));
  popup.querySelectorAll('[data-popup-close]').forEach((b) => b.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !popup.hidden) close(); });
  tab?.querySelector('[data-tab-dismiss]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    tab.hidden = true;
    store.set('mekie-popup-closed', String(Date.now() + 23 * DAY));
  });
}

/* Ao entrar numa página por um link começa no topo; ao voltar atrás o browser repõe a posição */
const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
if (!location.hash && nav?.type !== 'back_forward') {
  window.scrollTo(0, 0);
  /* Quando o site corre dentro de outra página (ex.: pré-visualização), leva também essa página ao topo */
  if (window.top !== window) document.body.scrollIntoView({ block: 'start' });
}

/* ---------- Animações de entrada ---------- */
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io?.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px' })
  : null;
document.querySelectorAll('.reveal').forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));

/* ---------- Adicionar rápido (cartões de produto) ---------- */
document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-quick]');
  if (!btn) return;
  const holder = btn.closest<HTMLElement>('[data-product]');
  if (!holder) return;
  const product = JSON.parse(holder.dataset.product!);
  const size = btn.dataset.quick || undefined;
  cart.add({ ...product, size }, 1);
  const box = btn.closest<HTMLElement>('.quick, .upsell__item');
  box?.classList.add('is-added');
  setTimeout(() => box?.classList.remove('is-added'), 1400);
  if (!btn.closest('[data-cart]')) openCart();
});
