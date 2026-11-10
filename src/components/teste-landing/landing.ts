/* Landing de teste: arara com scroll horizontal (GSAP ScrollTrigger + Lenis), balanço das peças, zoom com Flip
   e painel com os dados do produto. O botão "Adicionar ao saco" usa o carrinho da loja, sem o alterar. */
import { cart } from '../../scripts/cart';
import type { Piece } from './data';

declare const gsap: any, ScrollTrigger: any, Flip: any, Lenis: any;

type View = Piece & { priceText: string; regularText: string };
const data: View[] = JSON.parse(document.getElementById('lp-pieces')!.textContent || '[]');
const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector(s) as T;
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll(s)] as T[];
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
const T = reduce ? 0.25 : 1; /* duração das animações */

gsap.registerPlugin(ScrollTrigger, Flip);

/* scroll suave (só no computador e sem movimento reduzido) */
let lenis: any = null;
if (!touch && !reduce && typeof Lenis !== 'undefined') {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t: number) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* 1. hero */
gsap.from('[data-hero]', { y: 30, opacity: 0, duration: 1.1 * T, ease: 'power3.out', stagger: 0.12 * T });

/* 2. arara: o scroll vertical leva a arara para o lado, com a secção fixa */
const rack = $('[data-rack]');
const track = $('[data-track]');
const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
if (!touch) {
  gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: { trigger: rack, pin: true, scrub: reduce ? true : 0.7, end: () => `+=${distance()}`, invalidateOnRefresh: true },
  });
}

/* 3. balanço: cada peça é um pêndulo. A velocidade da arara empurra-a para o lado contrário ao movimento;
   quando para, volta ao sítio com uma oscilação amortecida. Cada peça tem rigidez, atrito e atraso próprios. */
const pieceEls = $$<HTMLButtonElement>('[data-piece]');
const swings = pieceEls.map((el, i) => ({
  el: $('[data-swing]', el),
  a: 0, v: 0, lagV: 0, held: false,
  k: 34 + (i % 3) * 7,
  c: 2.6 + (i % 2) * 0.9,
  gain: 0.0045 + (i % 4) * 0.0009,
  lag: 0.06 + ((i * 7) % 5) * 0.025,
}));
let lastPos = 0;
const position = () => (touch ? -track.scrollLeft : Number(gsap.getProperty(track, 'x')) || 0);
lastPos = position();
if (!reduce) {
  gsap.ticker.add((_t: number, deltaMs: number) => {
    const dt = Math.min(0.05, Math.max(0.001, deltaMs / 1000));
    const pos = position();
    const vx = (pos - lastPos) / dt; /* px/s, negativo quando a arara vai para a esquerda */
    lastPos = pos;
    for (const s of swings) {
      if (s.held) continue;
      s.lagV += (vx - s.lagV) * Math.min(1, dt / s.lag);
      const target = Math.max(-9, Math.min(9, s.lagV * s.gain));
      const acc = (target - s.a) * s.k - s.v * s.c;
      s.v += acc * dt;
      s.a = Math.max(-18, Math.min(18, s.a + s.v * dt));
      if (Math.abs(s.a) < 0.01 && Math.abs(s.v) < 0.01) s.a = s.v = 0;
      s.el.style.transform = `rotate(${s.a.toFixed(3)}deg)`;
    }
  });
  /* ao passar o rato, a peça sobe (CSS) e leva um pequeno empurrão */
  pieceEls.forEach((el, i) => el.addEventListener('pointerenter', (e) => {
    if ((e as PointerEvent).pointerType === 'mouse') swings[i].v += (i % 2 ? -1 : 1) * 55;
  }));
}

/* saco: contador ligado ao carrinho da loja */
const bag = $('[data-bag]');
const bagCount = $('[data-bag-count]');
const showCount = () => (bagCount.textContent = String(cart.count));
showCount();
cart.subscribe(() => {
  showCount();
  bag.classList.remove('is-bump'); void bag.offsetWidth; bag.classList.add('is-bump');
});

/* 4. zoom com Flip e painel com as informações */
const zoom = $('[data-zoom]');
const stage = $('[data-stage]');
const backdrop = $('[data-backdrop]');
const panel = $('[data-panel]');
const body = $('[data-panel-body]');
const closeBtn = $<HTMLButtonElement>('[data-close]');
let current: number | null = null;
let busy = false;

function panelHtml(p: View) {
  const sizes = p.sizes.length
    ? `<p class="lp-p__label">Tamanho: <span data-size-label>escolhe um</span></p>
       <fieldset class="lp-p__sizes"><legend class="sr-only" style="position:absolute;left:-9999px">Tamanho</legend>${p.sizes.map((s) =>
         `<label><input type="radio" name="lp-size" value="${esc(s.size)}"${s.ok ? '' : ' disabled'}><span>${esc(s.size)}</span></label>`).join('')}</fieldset>`
    : `<p class="lp-p__label">Tamanho: <span>único</span></p>`;
  return `
    <p class="lp-p__kicker">Verão Mekie</p>
    <h2 class="lp-p__name" id="lp-zoom-title">${esc(p.name)}</h2>
    <p class="lp-p__price">${p.regularText ? `<del>${esc(p.regularText)}</del><ins>${esc(p.priceText)}</ins>` : `<span>${esc(p.priceText)}</span>`}</p>
    <p class="lp-p__text">${esc(p.text)}</p>
    ${sizes}
    <p class="lp-p__label">Cor: <span>${esc(p.color)}</span></p>
    ${p.others.length ? `<p class="lp-p__meta">Também em ${esc(p.others.join(', '))}.</p>` : ''}
    ${p.composition.length ? `<p class="lp-p__meta">${esc(p.composition.join(' · '))}</p>` : ''}
    <button type="button" class="lp-p__add" data-add>Adicionar ao saco</button>
    <p class="lp-p__msg" role="status" data-msg></p>
    <a class="lp-p__link" href="${esc(p.cart.href)}">Ver a página da peça</a>`;
}

function lockScroll(on: boolean) {
  if (lenis) on ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = on ? 'hidden' : '';
  if (touch) track.style.overflowX = on ? 'hidden' : '';
}

function open(i: number) {
  if (busy || current !== null) return;
  busy = true;
  current = i;
  const p = data[i];
  const s = swings[i];
  s.held = true; s.a = 0; s.v = 0; s.el.style.transform = 'rotate(0deg)';
  const img = $<HTMLImageElement>('img', pieceEls[i]);
  const state = Flip.getState(img);
  body.innerHTML = panelHtml(p);
  bindPanel(p);
  zoom.hidden = false;
  lockScroll(true);
  document.documentElement.classList.add('lp-open');
  stage.appendChild(img);
  Flip.from(state, { duration: 0.85 * T, ease: 'power3.inOut', absolute: true, onComplete: () => (busy = false) });
  gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.5 * T });
  gsap.fromTo(panel, touch ? { yPercent: 100, xPercent: 0 } : { xPercent: 100, yPercent: 0 },
    { xPercent: 0, yPercent: 0, duration: 0.7 * T, ease: 'power3.out', delay: 0.12 * T });
  closeBtn.focus({ preventScroll: true });
}

function close() {
  if (busy || current === null) return;
  busy = true;
  const i = current;
  const img = $<HTMLImageElement>('img', stage);
  const state = Flip.getState(img);
  document.documentElement.classList.remove('lp-open');
  $('[data-media]', pieceEls[i]).appendChild(img);
  Flip.from(state, { duration: 0.75 * T, ease: 'power3.inOut', absolute: true });
  gsap.to(backdrop, { opacity: 0, duration: 0.45 * T, delay: 0.15 * T });
  gsap.to(panel, {
    ...(touch ? { yPercent: 100 } : { xPercent: 100 }), duration: 0.5 * T, ease: 'power3.in',
    onComplete: () => {
      zoom.hidden = true;
      lockScroll(false);
      swings[i].held = false;
      swings[i].v = reduce ? 0 : 40; /* volta ao cabide com um pequeno balanço */
      current = null;
      busy = false;
      pieceEls[i].focus({ preventScroll: true });
    },
  });
}

function bindPanel(p: View) {
  const add = $<HTMLButtonElement>('[data-add]', body);
  const msg = $('[data-msg]', body);
  const label = $('[data-size-label]', body);
  body.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === 'lp-size') { if (label) label.textContent = t.value; msg.textContent = ''; msg.classList.remove('is-error'); }
  });
  add.addEventListener('click', () => {
    const size = ($<HTMLInputElement>('input[name=lp-size]:checked', body) as HTMLInputElement | null)?.value;
    if (p.sizes.length && !size) {
      msg.textContent = 'Escolhe um tamanho.';
      msg.classList.add('is-error');
      gsap.fromTo($('.lp-p__sizes', body), { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, .3)' });
      return;
    }
    const { sizeNotes, ...info } = p.cart as any;
    cart.add({ ...info, size }, 1);
    add.textContent = 'Está no saco ✓';
    add.classList.add('is-done');
    msg.classList.remove('is-error');
    msg.innerHTML = 'Juntámos ao teu saco. <a href="/checkout/">Ver o saco</a>';
    setTimeout(() => { add.textContent = 'Adicionar ao saco'; add.classList.remove('is-done'); }, 1800);
  });
}

pieceEls.forEach((el, i) => el.addEventListener('click', () => open(i)));
closeBtn.addEventListener('click', close);
backdrop.addEventListener('click', close);
stage.addEventListener('click', (e) => { if (e.target === stage) close(); });
document.addEventListener('keydown', (e) => {
  if (current === null) return;
  if (e.key === 'Escape') { e.preventDefault(); close(); }
  /* o foco fica dentro do painel enquanto está aberto */
  if (e.key === 'Tab') {
    const f = $$<HTMLElement>('button, a[href], input:not([disabled])', panel);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* as imagens a carregar mudam a largura da arara: recalcula no fim */
window.addEventListener('load', () => ScrollTrigger.refresh());
