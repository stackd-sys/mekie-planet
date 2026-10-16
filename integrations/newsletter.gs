/**
 * Webhook da newsletter Mekie (Google Apps Script + Google Sheets).
 *
 * Guarda os emails numa folha, não deixa o mesmo email entrar duas vezes
 * e regista quando o código de boas-vindas é usado numa encomenda.
 *
 * Instalar:
 * 1. Cria uma Google Sheet nova. Menu Extensões > Apps Script.
 * 2. Apaga o que lá estiver, cola este ficheiro e guarda.
 * 3. Implementar > Nova implementação > Tipo: Aplicação Web.
 *    Executar como: Eu. Quem tem acesso: Qualquer pessoa.
 * 4. Copia o URL que termina em /exec para `newsletterWebhook` em src/data/site.ts,
 *    ou para a variável PUBLIC_NEWSLETTER_WEBHOOK na Vercel (e faz Redeploy).
 *
 * Pedidos (POST, application/x-www-form-urlencoded):
 *   action=subscribe  email, consent, source, page, code, created_at
 *     -> { status: 'new' | 'exists', subscribed: true, used }
 *   action=check      email
 *     -> { status: 'exists' | 'new', subscribed, used }   ('new' aqui = não inscrito)
 *   action=redeem     email, code, order, created_at
 *     -> { status: 'exists', subscribed: true, used: true }
 */

const SHEET = 'Subscritores';
const HEADERS = ['email', 'inscrito_em', 'origem', 'pagina', 'consentimento', 'codigo', 'codigo_usado_em', 'encomenda'];
const COL = { email: 1, used: 7, order: 8 };

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function find_(sh, email) {
  const last = sh.getLastRow();
  if (last < 2) return null;
  const rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toLowerCase() === email) {
      return { row: i + 2, used: rows[i][COL.used - 1] !== '' };
    }
  }
  return null;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const email = String(p.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ status: 'error', error: 'email inválido' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const found = find_(sh, email);
    const action = p.action || 'subscribe';

    if (action === 'check') {
      return json_({ status: found ? 'exists' : 'new', subscribed: !!found, used: found ? found.used : false });
    }

    if (action === 'redeem') {
      if (!found) return json_({ status: 'new', subscribed: false, used: false });
      if (!found.used) {
        sh.getRange(found.row, COL.used).setValue(p.created_at || new Date().toISOString());
        sh.getRange(found.row, COL.order).setValue(p.order || '');
      }
      return json_({ status: 'exists', subscribed: true, used: true });
    }

    if (found) return json_({ status: 'exists', subscribed: true, used: found.used });
    sh.appendRow([email, p.created_at || new Date().toISOString(), p.source || '', p.page || '', p.consent || '', p.code || '', '', '']);
    return json_({ status: 'new', subscribed: true, used: false });
  } finally {
    lock.releaseLock();
  }
}
