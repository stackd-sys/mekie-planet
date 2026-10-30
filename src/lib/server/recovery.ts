/* Checkout abandonado: quem chegou à página de pagamento e não pagou recebe um email,
   uma única vez, com o link para concluir a mesma encomenda (a página da Stripe fica aberta 24 horas).
   Corre sozinho, no máximo de 10 em 10 minutos, aproveitando as visitas ao site (não precisa de agendamento). */
import { db } from './db';
import { sendMail, layout, escapeHtml } from './mail';
import { linesHtml } from './orders';
import { serverT, asLang } from '../../i18n/server';

/** espera antes de escrever ao cliente, e até quando ainda vale a pena (a Stripe fecha a página às 24 horas) */
const AFTER = '1 hour';
const UNTIL = '20 hours';

/** Corre a recuperação se a última vez foi há mais de 10 minutos. Nunca falha. */
export async function maybeRecoverCheckouts() {
  try {
    const sql = await db();
    /* só uma execução de cada vez: quem conseguir mudar a data é que corre */
    const [lock] = await sql<any[]>`
      insert into settings (key, value) values ('recovery_last', ${sql.json({ at: new Date().toISOString() })})
      on conflict (key) do update set value = excluded.value
      where (settings.value->>'at')::timestamptz < now() - interval '10 minutes'
      returning key`;
    if (!lock) return 0;
    return await recoverCheckouts();
  } catch (e) {
    console.error('[Mekie] Recuperação de checkouts falhou:', (e as Error).message);
    return 0;
  }
}

export async function recoverCheckouts() {
  const sql = await db();
  const orders = await sql<any[]>`
    select o.* from orders o
    /* só encomendas com o link guardado: as antigas (algumas eram de bots, com emails de outras pessoas) ficam de fora */
    where o.status = 'pendente' and o.source = 'site' and o.stripe_url <> '' and o.recovery_sent_at is null
      and o.created_at < now() - ${AFTER}::interval and o.created_at > now() - ${UNTIL}::interval
      /* se a pessoa já voltou e fez outra encomenda, não incomodamos */
      and not exists (select 1 from orders n where n.email = o.email and n.created_at > o.created_at)
    order by o.created_at limit 20`;
  let sent = 0;
  for (const o of orders) {
    /* marca primeiro: mesmo que o email falhe, nunca sai duas vezes */
    const [claimed] = await sql`update orders set recovery_sent_at = now() where id = ${o.id} and recovery_sent_at is null returning id`;
    if (!claimed) continue;
    const url = o.stripe_url as string;
    const lang = asLang(o.lang);
    const t = serverT(lang);
    const first = String(o.name).split(' ')[0];
    const ok = await sendMail(o.email, t('m.abandonSubject'), layout(t('m.hello', { name: escapeHtml(first) }),
      `<p>${t('m.abandon')}</p>
       ${linesHtml(o, lang)}
       <p><a href="${escapeHtml(url)}" style="display:inline-block;background:#1f1f1f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:13px;letter-spacing:1px">${t('m.abandonBtn')}</a></p>
       <p style="font-size:13px;color:#5c5c5c">${t('m.abandonNote')}</p>`, lang));
    if (ok) {
      sent++;
      await sql`insert into order_events (order_id, text, by) values (${o.id}, 'Email de checkout abandonado enviado ao cliente', 'site')`;
    }
  }
  return sent;
}
