/* Visual de época (sem descontos): Halloween. Liga e desliga sozinho nas datas abaixo
   (o site é reconstruído no fim, pelos "crons" de vercel.json). Para ver antes do tempo: SEASON_PREVIEW=halloween. */
export const halloween = {
  /* hora de Lisboa (desde 25 de outubro é igual a UTC) */
  start: '2026-10-29T00:00:00Z',
  end: '2026-11-01T00:00:00Z',
};

export const halloweenActive = (now = new Date()) => {
  try {
    if (typeof process !== 'undefined' && process.env?.SEASON_PREVIEW === 'halloween') return true;
  } catch {}
  return now >= new Date(halloween.start) && now < new Date(halloween.end);
};
