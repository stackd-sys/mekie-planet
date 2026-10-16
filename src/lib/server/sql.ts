/* Ligação à base de dados Postgres (Neon na Vercel, ou outra). Só corre no servidor. */
import postgres from 'postgres';

const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

let client: postgres.Sql | null = null;

export const hasDb = () => url() !== '';

/** Cliente partilhado. Uma ligação por função é suficiente para o volume da loja. */
export function sql() {
  if (!client) {
    const u = url();
    if (!u) throw new Error('Falta DATABASE_URL: liga uma base de dados Postgres na Vercel (Storage > Neon).');
    const local = /localhost|127\.0\.0\.1/.test(u);
    client = postgres(u, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      ssl: local ? false : 'require',
      types: { numeric: { to: 1700, from: [1700], serialize: String, parse: Number } },
      onnotice: () => {},
    });
  }
  return client;
}
