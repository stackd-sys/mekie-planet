/* Formatação usada no CRM e nos emails */
export const euro = (v: number | string | null | undefined) =>
  `${Number(v ?? 0).toFixed(2).replace('.', ',')}€`;

export const date = (d: Date | string | null | undefined, withTime = false) => {
  if (!d) return '';
  const x = new Date(d);
  return x.toLocaleString('pt-PT', {
    timeZone: 'Europe/Lisbon',
    day: '2-digit', month: '2-digit', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
};

export const STATUS: Record<string, { label: string; tone: string }> = {
  pendente: { label: 'A aguardar pagamento', tone: 'warn' },
  paga: { label: 'Paga', tone: 'info' },
  enviada: { label: 'Enviada', tone: 'ok' },
  entregue: { label: 'Entregue', tone: 'done' },
  cancelada: { label: 'Cancelada', tone: 'off' },
  devolvida: { label: 'Devolvida', tone: 'off' },
};

export const statusLabel = (s: string) => STATUS[s]?.label ?? s;

/** Link de seguimento CTT. Se a CTT mudar o endereço, muda-se em CTT_TRACK_URL na Vercel. */
export const trackingUrl = (code: string) =>
  (process.env.CTT_TRACK_URL || 'https://appserver.ctt.pt/CustomerArea/PublicArea_Detail?ObjectCodeInput={code}&SearchInput={code}')
    .replaceAll('{code}', encodeURIComponent(code.trim()));

export const csv = (rows: (string | number | null | undefined)[][]) =>
  '﻿' + rows.map((r) => r.map((c) => {
    const v = String(c ?? '');
    return /[";\n,]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(';')).join('\r\n');
