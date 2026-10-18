/* Envio de emails pela Resend (resend.com). Sem RESEND_API_KEY os emails não saem e ficam só no registo. */
import { site } from '../../data/site';

const FROM = () => process.env.MAIL_FROM || `Mekie Planet <${site.email}>`;
export const hasMail = () => Boolean(process.env.RESEND_API_KEY);

export const escapeHtml = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Moldura simples, com o logótipo, para todos os emails */
export function layout(title: string, body: string) {
  return `<!doctype html><html lang="pt-PT"><body style="margin:0;background:#f5f5f4;font-family:Helvetica,Arial,sans-serif;color:#1f1f1f">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<img src="${site.url}/images/site/logo.png" alt="Mekie" width="120" style="display:block;margin:0 0 28px">
<h1 style="font-size:20px;font-weight:600;margin:0 0 16px">${escapeHtml(title)}</h1>
<div style="font-size:15px;line-height:1.6">${body}</div>
<p style="font-size:12px;color:#5c5c5c;margin-top:36px">Mekie Planet · <a href="${site.url}" style="color:#5c5c5c">${site.url.replace('https://', '')}</a> · ${site.email}</p>
</div></body></html>`;
}

export async function sendMail(to: string, subject: string, html: string, replyTo = site.inbox) {
  if (!hasMail()) {
    console.warn(`[Mekie] Email não enviado (falta RESEND_API_KEY): "${subject}" para ${to}`);
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM(), to: [to], subject, html, reply_to: replyTo }),
  });
  if (!res.ok) {
    console.error('[Mekie] Resend respondeu', res.status, await res.text().catch(() => ''));
    return false;
  }
  return true;
}
