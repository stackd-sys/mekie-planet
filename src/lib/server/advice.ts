/* Notas automáticas de marketing: lêem os números dos anúncios, da newsletter e do Google e dizem, em português simples,
   o que está bem, o que está mal e o que fazer a seguir. Os valores de referência são médios para lojas de moda online
   pequenas na Europa: servem de orientação, não são uma garantia. Ajustem-nos à medida que a Mekie tiver história própria. */

export type Tone = 'ok' | 'warn' | 'off' | 'info';
export type Note = { tone: Tone; title: string; text: string; action?: string };

/** Valores de referência (moda, loja pequena, Portugal e UE) */
export const BENCH = {
  ctr: { low: 0.8, good: 1.5 }, // % de cliques no link por impressão
  cpc: { good: 0.35, high: 0.7 }, // € por clique no link
  cpm: { good: 7, high: 12 }, // € por 1000 impressões
  landingRate: { low: 60, good: 75 }, // % dos cliques que chegam a abrir a página
  cartRate: { low: 3, good: 8 }, // % das visitas que põem no carrinho
  freq: { high: 3 }, // vezes que a mesma pessoa vê o anúncio
  roas: { breakEven: 2, good: 3 }, // vendas por cada euro gasto
  costPerLead: { good: 1, high: 2.5 },
  minSpendToJudge: 5, // abaixo disto (€) ainda não há dados para decidir
  minImpressionsToJudge: 800,
  learningEvents: 50, // a Meta precisa de ~50 resultados por semana para otimizar bem
};

export const fmtEur = (v: number) => `${v.toFixed(2).replace('.', ',')}€`;
const pct = (v: number, d = 1) => `${v.toFixed(d).replace('.', ',')}%`;

type AdLike = {
  spend: number; impressions: number; reach: number; frequency: number; linkClicks: number; ctr: number; cpc: number; cpm: number;
  landing: number; carts: number; checkouts: number; purchases: number; value: number; leads: number; roas: number;
};

/** Veredicto de um anúncio: o que fazer com ele */
export function adVerdict(a: AdLike): { label: string; tone: Tone; why: string } {
  if (a.spend < BENCH.minSpendToJudge || a.impressions < BENCH.minImpressionsToJudge) {
    return { label: 'Poucos dados', tone: 'info', why: `Gastou ${fmtEur(a.spend)} e teve ${a.impressions} impressões. Dêem-lhe pelo menos ${fmtEur(BENCH.minSpendToJudge)} e ${BENCH.minImpressionsToJudge} impressões antes de decidir.` };
  }
  if (a.purchases > 0 && a.roas >= BENCH.roas.good) return { label: 'Escalar', tone: 'ok', why: `Vende ${a.roas.toFixed(1).replace('.', ',')}€ por cada euro. Subam o orçamento do conjunto 20% de 3 em 3 dias enquanto se mantiver.` };
  if (a.purchases > 0 && a.roas >= BENCH.roas.breakEven) return { label: 'Manter', tone: 'ok', why: 'Já vende e paga-se. Deixem correr e testem um criativo novo ao lado.' };
  if (a.ctr < BENCH.ctr.low) return { label: 'Trocar criativo', tone: 'off', why: `Só ${pct(a.ctr)} clica (referência: acima de ${pct(BENCH.ctr.low)}). A imagem ou os primeiros 2 segundos do vídeo não fazem parar o scroll.` };
  if (a.frequency > BENCH.freq.high) return { label: 'Cansado', tone: 'warn', why: `A mesma pessoa já o viu ${a.frequency.toFixed(1).replace('.', ',')} vezes. Troquem o criativo ou alarguem o público.` };
  if (a.leads > 0) {
    const cpl = a.spend / a.leads;
    return cpl <= BENCH.costPerLead.good
      ? { label: 'Contactos baratos', tone: 'ok', why: `${fmtEur(cpl)} por contacto. Manter e pôr mais orçamento aqui.` }
      : cpl <= BENCH.costPerLead.high
        ? { label: 'Manter', tone: 'ok', why: `${fmtEur(cpl)} por contacto, dentro do normal.` }
        : { label: 'Contactos caros', tone: 'warn', why: `${fmtEur(cpl)} por contacto (referência: até ${fmtEur(BENCH.costPerLead.high)}). Testem outro criativo ou outra frase.` };
  }
  if (a.spend >= 15 && a.carts === 0 && a.purchases === 0) return { label: 'Pausar', tone: 'off', why: `${fmtEur(a.spend)} gastos sem nenhum carrinho. O dinheiro rende mais nos outros anúncios.` };
  if (a.carts > 0) return { label: 'Promissor', tone: 'ok', why: `${a.carts} ${a.carts === 1 ? 'carrinho' : 'carrinhos'} a ${fmtEur(a.spend / a.carts)} cada. Manter: é daqui que vêm as próximas vendas.` };
  if (a.ctr >= BENCH.ctr.good && a.cpc <= BENCH.cpc.good) return { label: 'Atrai bem', tone: 'ok', why: `Clique barato (${fmtEur(a.cpc)}) e CTR alto (${pct(a.ctr)}). Ainda não leva ao carrinho: confirmem que o link abre a peça certa.` };
  return { label: 'A ver', tone: 'info', why: 'Números normais. Comparem com os outros daqui a uns dias.' };
}

type MetaData = {
  total: AdLike;
  daily: { spend: number }[];
  campaigns: (AdLike & { name: string; objective: string; status: string })[];
  adsets: (AdLike & { name: string; status: string; dailyBudget: number; goal: string })[];
  ads: (AdLike & { name: string; adset: string; status: string })[];
  platform: (AdLike & { platform: string; position: string })[];
  age: (AdLike & { age: string; gender: string })[];
};

/** Diagnóstico da conta de anúncios: as notas mais importantes primeiro */
export function metaAdvice(d: MetaData, days: number, crm?: { visits: number; carts: number; checkouts: number; orders: number }): Note[] {
  const t = d.total;
  const notes: Note[] = [];
  if (!t.impressions) return [{ tone: 'info', title: 'Ainda sem anúncios neste período', text: 'Escolham um período maior ou lancem uma campanha.' }];
  const perDay = t.spend / Math.max(1, d.daily.length || days);

  /* 1. Orçamento e aprendizagem */
  const salesCamps = d.campaigns.filter((c) => /SALES|CONVERSIONS/.test(c.objective) && c.spend > 0);
  const weeklyResults = ((t.purchases || t.carts) / Math.max(1, days)) * 7;
  if (salesCamps.length && weeklyResults < BENCH.learningEvents) {
    notes.push({
      tone: 'warn', title: 'A campanha de vendas não tem dados para aprender',
      text: `A Meta precisa de cerca de ${BENCH.learningEvents} resultados por semana para otimizar. Estão a ter cerca de ${Math.round(weeklyResults)} (${t.purchases ? 'compras' : 'carrinhos'}). Com ${fmtEur(perDay)} por dia isto não muda.`,
      action: 'Juntem tudo num só conjunto de anúncios com 2 a 4 anúncios, ou mudem para uma campanha de Leads (contactos), que dá muitos mais resultados com o mesmo dinheiro e alimenta a newsletter.',
    });
  }
  if (perDay < 5) notes.push({ tone: 'info', title: `Orçamento de ${fmtEur(perDay)} por dia`, text: 'Com menos de 5€ por dia cada conjunto de anúncios demora semanas a dar sinais claros.', action: 'Concentrem o dinheiro num ou dois conjuntos, em vez de o espalhar.' });

  /* 2. Demasiados anúncios a dividir pouco dinheiro */
  const activeAds = d.ads.filter((a) => a.status === 'ACTIVE');
  const bySet = new Map<string, number>();
  for (const a of activeAds) bySet.set(a.adset, (bySet.get(a.adset) ?? 0) + 1);
  for (const [set, n] of bySet) if (n > 6) notes.push({ tone: 'warn', title: `${n} anúncios ativos em "${set}"`, text: 'O orçamento fica dividido e a maioria nunca chega a ser testada.', action: 'Deixem os 3 ou 4 com mais carrinhos ou melhor CTR e pausem os outros.' });

  /* 3. Atrair: CTR, CPC, CPM */
  if (t.ctr >= BENCH.ctr.good) notes.push({ tone: 'ok', title: `Os anúncios atraem bem: CTR de ${pct(t.ctr)}`, text: `Acima da referência de ${pct(BENCH.ctr.good)} para moda. Os criativos não são o problema.` });
  else if (t.ctr < BENCH.ctr.low) notes.push({ tone: 'off', title: `Poucos cliques: CTR de ${pct(t.ctr)}`, text: `Abaixo de ${pct(BENCH.ctr.low)}, os anúncios não fazem parar o scroll.`, action: 'Testem vídeos curtos (5 a 10 segundos) com a peça nos primeiros 2 segundos, pessoas a usar a roupa e texto grande com o preço.' });
  if (t.linkClicks && t.cpc > BENCH.cpc.high) notes.push({ tone: 'warn', title: `Clique caro: ${fmtEur(t.cpc)}`, text: `Referência: até ${fmtEur(BENCH.cpc.high)}.`, action: 'Troquem os anúncios com CTR mais baixo.' });
  if (t.cpm > BENCH.cpm.high) notes.push({ tone: 'warn', title: `Mostrar anúncios está caro: ${fmtEur(t.cpm)} por mil`, text: 'Normal em novembro e dezembro (toda a gente anuncia), ou sinal de público pequeno demais.', action: 'Usem público aberto (Advantage+) e evitem interesses muito estreitos.' });
  if (t.frequency > BENCH.freq.high) notes.push({ tone: 'warn', title: `As mesmas pessoas veem os anúncios ${t.frequency.toFixed(1).replace('.', ',')} vezes`, text: 'Acima de 3 vezes os resultados costumam cair.', action: 'Criativos novos ou um público maior.' });

  /* 4. Do clique ao site */
  if (t.linkClicks >= 30) {
    const lr = (t.landing / t.linkClicks) * 100;
    if (lr < BENCH.landingRate.low) notes.push({
      tone: 'warn', title: `Só ${pct(lr, 0)} dos cliques chegam a contar como visita`,
      text: 'Parte é normal: o Pixel só regista quem aceita os cookies de publicidade, por isso as visitas reais são mais. A outra parte são cliques sem querer (comuns no Audience Network e nos Stories).',
      action: 'Comparem com as entradas que o CRM conta em Marketing > Visitas. Se o Audience Network tiver muitos cliques, tirem-no dos posicionamentos.',
    });
  }

  /* 5. Do site à compra */
  if (t.landing >= 50) {
    const cr = (t.carts / t.landing) * 100;
    if (cr < BENCH.cartRate.low) notes.push({ tone: 'off', title: `Poucos carrinhos: ${pct(cr)} das visitas`, text: `Referência: ${pct(BENCH.cartRate.low, 0)} a ${pct(BENCH.cartRate.good, 0)}. As pessoas chegam mas não ficam convencidas.`, action: 'Confirmem que cada anúncio abre a peça que mostra (e não a página inicial), com o preço e o envio grátis bem à vista.' });
    else notes.push({ tone: 'ok', title: `${pct(cr)} das visitas põem no carrinho`, text: 'Dentro da referência para moda.' });
  }
  if (t.carts >= 5 && t.purchases === 0) notes.push({ tone: 'warn', title: `${t.carts} carrinhos e nenhuma compra`, text: 'O problema está entre o carrinho e o pagamento: portes, prazo, confiança ou o próprio checkout.', action: 'Vejam no CRM, em Marketing > Visitas, os checkouts abandonados. Uma campanha só para quem pôs no carrinho (retargeting) costuma converter.' });
  if (t.purchases > 0) {
    notes.push(t.roas >= BENCH.roas.breakEven
      ? { tone: 'ok', title: `Retorno de ${t.roas.toFixed(1).replace('.', ',')}€ por cada euro`, text: 'Acima de 2€ por euro a campanha paga-se com as margens normais de roupa.', action: 'Subam o orçamento 20% de 3 em 3 dias e vejam se o retorno se mantém.' }
      : { tone: 'warn', title: `Retorno de ${t.roas.toFixed(1).replace('.', ',')}€ por cada euro`, text: 'Abaixo de 2€ por euro a campanha provavelmente perde dinheiro em cada venda.', action: 'Cortem os anúncios sem compras e concentrem o dinheiro nos que vendem.' });
  }

  /* 6. Contactos (formulários) */
  if (t.leads > 0) {
    const cpl = t.spend / t.leads;
    notes.push({ tone: cpl <= BENCH.costPerLead.high ? 'ok' : 'warn', title: `${t.leads} contactos a ${fmtEur(cpl)} cada`, text: `Referência: até ${fmtEur(BENCH.costPerLead.high)} por contacto.`, action: 'Importem-nos no CRM (Newsletter e avisos > Importar contactos) no mesmo dia: um contacto esquece a marca em horas.' });
  }

  /* 7. Onde funciona melhor: posicionamentos e idades */
  const places = d.platform.filter((p) => p.spend >= 2).map((p) => ({ ...p, rate: p.linkClicks ? p.spend / p.linkClicks : Infinity }));
  if (places.length >= 2) {
    const best = [...places].sort((a, b) => a.rate - b.rate)[0];
    const an = places.filter((p) => p.platform === 'audience_network').reduce((s, p) => s + p.spend, 0);
    notes.push({ tone: 'info', title: 'Onde o clique sai mais barato', text: `${({ instagram: 'Instagram', facebook: 'Facebook', audience_network: 'Audience Network', messenger: 'Messenger' } as Record<string, string>)[best.platform] ?? best.platform} (${String(best.position).replace(/_/g, ' ')}): ${fmtEur(best.rate)} por clique.`, action: 'Façam os criativos primeiro para esse formato.' });
    if (an / t.spend > 0.1) notes.push({ tone: 'warn', title: `${pct((an / t.spend) * 100, 0)} do dinheiro vai para o Audience Network`, text: 'São apps e sites fora da Meta, com muitos cliques sem querer.', action: 'Nos posicionamentos manuais, desliguem o Audience Network.' });
  }
  const ages = new Map<string, AdLike>();
  for (const r of d.age) {
    const g = ages.get(r.age) ?? { spend: 0, impressions: 0, linkClicks: 0, carts: 0 } as any;
    g.spend += r.spend; g.impressions += r.impressions; g.linkClicks += r.linkClicks; g.carts += r.carts;
    ages.set(r.age, g);
  }
  const ageRank = [...ages.entries()].filter(([, g]) => g.linkClicks >= 10).map(([age, g]) => ({ age, cpc: g.spend / g.linkClicks, carts: g.carts })).sort((a, b) => a.cpc - b.cpc);
  if (ageRank.length >= 2) notes.push({ tone: 'info', title: `Idade com o clique mais barato: ${ageRank[0].age}`, text: `${fmtEur(ageRank[0].cpc)} por clique, contra ${fmtEur(ageRank[ageRank.length - 1].cpc)} em ${ageRank[ageRank.length - 1].age}.`, action: 'Não restrinjam o público ainda, mas usem pessoas dessa idade nos criativos.' });

  /* 8. Comparação com o que o CRM vê (conta toda a gente, também quem recusa cookies) */
  if (crm && crm.visits) notes.push({ tone: 'info', title: 'O que o CRM vê no mesmo período', text: `${crm.visits} entradas no site vindas do Facebook e do Instagram e ${crm.orders} encomendas pagas com essa origem. No site inteiro houve ${crm.carts} carrinhos e ${crm.checkouts} idas ao checkout. Esta contagem não depende dos cookies, por isso é a mais fiável.` });

  const order: Record<Tone, number> = { off: 0, warn: 1, ok: 2, info: 3 };
  return notes.sort((a, b) => order[a.tone] - order[b.tone]);
}

/** Newsletter: notas a partir dos envios, visitas e vendas de cada campanha */
export function newsletterAdvice(rows: { label: string; sent: number; visits: number; orders: number; revenue: number }[], subscribers: number): Note[] {
  const notes: Note[] = [];
  if (subscribers < 100) notes.push({ tone: 'warn', title: `${subscribers} subscritores ativos`, text: 'Com menos de 100 pessoas cada envio dá poucas vendas, mesmo que o email seja ótimo.', action: 'Prioridade número um: ganhar contactos (formulário da Meta, popup do site, passatempo). Objetivo: 500 até ao fim de janeiro.' });
  for (const r of rows.filter((x) => x.sent >= 20)) {
    const ctr = (r.visits / r.sent) * 100;
    notes.push(ctr >= 3
      ? { tone: 'ok', title: `"${r.label}": ${pct(ctr)} visitaram o site`, text: 'Acima de 3% é um bom resultado para lojas de moda.' }
      : { tone: 'warn', title: `"${r.label}": só ${pct(ctr)} visitaram o site`, text: 'Referência: 2% a 5%.', action: 'Assunto mais concreto (preço ou novidade), o botão logo no início e menos texto antes da primeira imagem.' });
  }
  notes.push({ tone: 'info', title: 'Regras para os emails', text: '1 a 2 emails por semana no máximo. Terça a quinta às 19h ou domingo às 11h costumam ter mais aberturas. Um objetivo por email, um botão principal, e sempre uma imagem de pessoas a usar a roupa.' });
  return notes;
}
