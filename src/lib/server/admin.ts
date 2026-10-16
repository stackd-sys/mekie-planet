/* Ajudas para as páginas do CRM */
import type { AstroGlobal } from 'astro';

/** Lê o formulário de um POST (ou devolve null num GET) */
export async function postForm(Astro: AstroGlobal) {
  if (Astro.request.method !== 'POST') return null;
  return Astro.request.formData();
}

/** Redireciona para a mesma página com uma mensagem (padrão POST, redirect, GET) */
export function done(Astro: AstroGlobal, message: string, path = Astro.url.pathname, error = false) {
  const u = new URL(path, Astro.url);
  for (const [k, v] of Astro.url.searchParams) if (k !== 'ok' && k !== 'erro') u.searchParams.set(k, v);
  u.searchParams.set(error ? 'erro' : 'ok', message);
  return Astro.redirect(u.pathname + u.search);
}

export const flash = (Astro: AstroGlobal) => ({
  ok: Astro.url.searchParams.get('ok') || '',
  error: Astro.url.searchParams.get('erro') || '',
});

export const str = (f: FormData, k: string, max = 500) => String(f.get(k) ?? '').trim().slice(0, max);
export const num = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? '').replace(',', '.').trim();
  return v === '' ? null : Number(v);
};
