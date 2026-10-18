/* Email de boas-vindas da newsletter, com o código de desconto e o link para sair. */
import { site } from '../../data/site';
import { sendMail, layout, escapeHtml } from './mail';

export async function sendWelcome(sql: any, email: string) {
  const [s] = await sql`select token from subscribers where email = ${email}`;
  if (!s) return false;
  const [c] = await sql`select code, kind, value from discount_codes where welcome = true and active = true limit 1`;
  const off = c ? (c.kind === 'percent' ? `${Number(c.value)}%` : `${Number(c.value).toFixed(2).replace('.', ',')}€`) : '';
  const leave = `${site.url}/newsletter/sair/?t=${s.token}`;
  return sendMail(email, c ? `O teu código de ${off} na Mekie` : 'Já fazes parte da Mekie', layout('Bem-vindo à Mekie!',
    `<p>Obrigado por subscreveres. Vais ser dos primeiros a saber das novidades, reposições e promoções.</p>
     ${c ? `<p>Aqui está o teu código de ${off} de desconto na primeira compra:</p>
     <p style="font-size:22px;font-weight:600;letter-spacing:2px;background:#fff;border:1px dashed #1f1f1f;padding:14px;text-align:center;margin:20px 0">${escapeHtml(c.code)}</p>
     <p>Escreve-o no campo "Código de desconto", no checkout. Só pode ser usado uma vez e com este email.</p>` : ''}
     <p><a href="${site.url}/loja/" style="display:inline-block;background:#1f1f1f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:13px;letter-spacing:1px">VER A LOJA</a></p>
     <p style="font-size:12px;color:#5c5c5c;margin-top:28px">Recebeste este email porque subscreveste a newsletter em ${site.url.replace('https://', '')}. Se não quiseres receber mais, <a href="${leave}" style="color:#5c5c5c">sai da newsletter aqui</a>.</p>`));
}
