/**
 * Webhook da Mekie (Google Apps Script + Google Sheets).
 *
 * Folhas que cria sozinho:
 *   Subscritores  newsletter e uso do código de boas-vindas
 *   Avisos        pedidos de "Avisa-me quando voltar"
 *   Cartoes       cartões presente: código, valor, saldo e validade
 *
 * Instalar (ou atualizar):
 * 1. Na Google Sheet, menu Extensões > Apps Script.
 * 2. Apaga o que lá estiver, cola este ficheiro e guarda.
 * 3. Implementar > Gerir implementações > editar (lápis) > Versão: Nova versão > Implementar.
 *    Na primeira vez: Implementar > Nova implementação > Aplicação Web,
 *    Executar como: Eu, Quem tem acesso: Qualquer pessoa.
 * 4. O URL que termina em /exec vai para `newsletterWebhook` em src/data/site.ts,
 *    ou para a variável PUBLIC_NEWSLETTER_WEBHOOK na Vercel (e faz Redeploy).
 *    Ao criar uma nova versão o URL mantém-se.
 *
 * Pedidos (POST, application/x-www-form-urlencoded):
 *   action=subscribe  email, consent, source, page, code, created_at
 *     -> { status: 'new' | 'exists', subscribed: true, used }
 *   action=check      email
 *     -> { status: 'exists' | 'new', subscribed, used }   ('new' aqui = não inscrito)
 *   action=redeem     email, code, order, created_at
 *     -> { status: 'exists', subscribed: true, used: true }
 *   action=notify     email, product, size, page, created_at
 *     -> { status: 'new' | 'exists' }
 *   action=gift       code
 *     -> { status: 'ok' | 'empty' | 'expired' | 'invalid', balance, expires }
 *
 * Cartões presente: depois de receberes o pagamento de um cartão, abre a Sheet e usa o menu
 * Mekie > Criar cartão presente. O código aparece numa janela e fica na folha Cartoes.
 * Quando um cliente paga uma encomenda com um cartão, baixa o saldo na coluna "saldo".
 */

const SHEET = 'Subscritores';
const HEADERS = ['email', 'inscrito_em', 'origem', 'pagina', 'consentimento', 'codigo', 'codigo_usado_em', 'encomenda'];
const COL = { email: 1, used: 7, order: 8 };

const NOTIFY_SHEET = 'Avisos';
const NOTIFY_HEADERS = ['email', 'produto', 'tamanho', 'pagina', 'pedido_em', 'avisado_em'];

const GIFT_SHEET = 'Cartoes';
const GIFT_HEADERS = ['codigo', 'valor', 'saldo', 'criado_em', 'valido_ate', 'comprado_por', 'para', 'notas'];
const GIFT_YEARS = 2;

function sheetOf_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}
const sheet_ = () => sheetOf_(SHEET, HEADERS);

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

function gift_(code) {
  code = String(code || '').trim().toUpperCase();
  if (!code) return { status: 'invalid' };
  const sh = sheetOf_(GIFT_SHEET, GIFT_HEADERS);
  const last = sh.getLastRow();
  if (last < 2) return { status: 'invalid' };
  const rows = sh.getRange(2, 1, last - 1, GIFT_HEADERS.length).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toUpperCase() !== code) continue;
    const balance = Number(rows[i][2]) || 0;
    const until = rows[i][4] ? new Date(rows[i][4]) : null;
    const expires = until ? until.toISOString() : '';
    if (until && until.getTime() < Date.now()) return { status: 'expired', balance: balance, expires: expires };
    if (balance <= 0) return { status: 'empty', balance: 0, expires: expires };
    return { status: 'ok', balance: balance, expires: expires };
  }
  return { status: 'invalid' };
}

function notify_(p, email) {
  const sh = sheetOf_(NOTIFY_SHEET, NOTIFY_HEADERS);
  const product = String(p.product || '').slice(0, 120);
  const size = String(p.size || '').slice(0, 20);
  const last = sh.getLastRow();
  if (last >= 2) {
    const rows = sh.getRange(2, 1, last - 1, NOTIFY_HEADERS.length).getValues();
    const dup = rows.some((r) => String(r[0]).toLowerCase() === email && r[1] === product && String(r[2]) === size && r[5] === '');
    if (dup) return { status: 'exists' };
  }
  sh.appendRow([email, product, size, String(p.page || '').slice(0, 200), p.created_at || new Date().toISOString(), '']);
  return { status: 'new' };
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const action = p.action || 'subscribe';

  if (action === 'gift') return json_(gift_(p.code));

  const email = String(p.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ status: 'error', error: 'email inválido' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (action === 'notify') return json_(notify_(p, email));

    const sh = sheet_();
    const found = find_(sh, email);

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

/* ---------- Menu da Sheet para criar cartões presente ---------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Mekie').addItem('Criar cartão presente', 'criarCartao').addToUi();
}

function novoCodigo_() {
  /* sem letras que se confundem (0/O, 1/I) */
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += abc.charAt(Math.floor(Math.random() * abc.length));
  return 'MEKIE-' + s.slice(0, 4) + '-' + s.slice(4);
}

function criarCartao() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('Criar cartão presente', 'Valor em euros (ex.: 50)', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const valor = Number(String(r.getResponseText()).replace(',', '.'));
  if (!(valor > 0)) return ui.alert('Valor inválido.');
  const quem = ui.prompt('Quem comprou e para quem (opcional)', 'Ex.: Rui Neves para Ana', ui.ButtonSet.OK_CANCEL);

  const sh = sheetOf_(GIFT_SHEET, GIFT_HEADERS);
  const existentes = sh.getLastRow() >= 2 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map((x) => x[0]) : [];
  let codigo = novoCodigo_();
  while (existentes.indexOf(codigo) !== -1) codigo = novoCodigo_();

  const hoje = new Date();
  const validade = new Date(hoje);
  validade.setFullYear(validade.getFullYear() + GIFT_YEARS);
  const nota = quem.getSelectedButton() === ui.Button.OK ? quem.getResponseText() : '';
  sh.appendRow([codigo, valor, valor, hoje, validade, nota, '', '']);
  ui.alert('Cartão criado', 'Código: ' + codigo + '\nValor: ' + valor + '€\nVálido até ' + Utilities.formatDate(validade, 'Europe/Lisbon', 'dd/MM/yyyy'), ui.ButtonSet.OK);
}
