/* Email de boas-vindas da newsletter, com o código de desconto e o link para sair. */
import { site } from '../../data/site';
import { sendMail, layout, escapeHtml } from './mail';
import { money, href } from '../../i18n';
import { serverT, asLang } from '../../i18n/server';

export async function sendWelcome(sql: any, email: string) {
  const [s] = await sql`select token, lang from subscribers where email = ${email}`;
  if (!s) return false;
  const lang = asLang(s.lang);
  const t = serverT(lang);
  const [c] = await sql`select code, kind, value from discount_codes where welcome = true and active = true limit 1`;
  const off = c ? (c.kind === 'percent' ? `${Number(c.value)}%` : money(Number(c.value), lang)) : '';
  const leave = `${site.url}/newsletter/sair/?t=${s.token}${lang === 'pt' ? '' : `&l=${lang}`}`;
  return sendMail(email, c ? t('m.welcomeSubject', { off }) : t('m.welcomeSubjectNoCode'), layout(t('m.welcomeTitle'),
    `<p>${t('m.welcome')}</p>
     ${c ? `<p>${t('m.welcomeCode', { off })}</p>
     <p style="font-size:22px;font-weight:600;letter-spacing:2px;background:#fff;border:1px dashed #1f1f1f;padding:14px;text-align:center;margin:20px 0">${escapeHtml(c.code)}</p>
     <p>${t('m.welcomeHow')}</p>` : ''}
     <p><a href="${site.url}${href(lang, '/loja/')}" style="display:inline-block;background:#1f1f1f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:13px;letter-spacing:1px">${t('m.shopBtn')}</a></p>
     <p style="font-size:12px;color:#5c5c5c;margin-top:28px">${t('m.why', { site: site.url.replace('https://', ''), leave })}</p>`, lang));
}
