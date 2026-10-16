/* Esquema da base de dados do CRM. É criado sozinho no primeiro pedido, por isso não há passos manuais. */
import { sql } from './sql';
import { products } from '../../data/products';
import { site } from '../../data/site';

const SCHEMA = /* sql */ `
create table if not exists products_state (
  id integer primary key,
  slug text not null,
  name text not null,
  color text not null default '',
  price numeric(10,2) not null,
  stock integer,
  size_stock jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id serial primary key,
  email text not null unique,
  name text not null default '',
  phone text not null default '',
  nif text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists order_number_seq start 1001;

create table if not exists orders (
  id serial primary key,
  number text not null unique,
  customer_id integer references customers(id),
  email text not null,
  name text not null default '',
  phone text not null default '',
  nif text not null default '',
  address jsonb,
  lines jsonb not null,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  discount_code text not null default '',
  shipping numeric(10,2) not null default 0,
  gift_code text not null default '',
  gift_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'pendente',
  tracking text not null default '',
  customer_notes text not null default '',
  notes text not null default '',
  stock_applied boolean not null default false,
  source text not null default 'site',
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz
);
alter table orders add column if not exists utm jsonb;
create index if not exists orders_created on orders (created_at desc);
create index if not exists orders_email on orders (email);

create table if not exists order_events (
  id serial primary key,
  order_id integer not null references orders(id) on delete cascade,
  at timestamptz not null default now(),
  text text not null,
  by text not null default ''
);

create table if not exists returns (
  id serial primary key,
  order_id integer not null references orders(id) on delete cascade,
  kind text not null,
  items jsonb not null,
  reason text not null default '',
  refund numeric(10,2) not null default 0,
  restock boolean not null default true,
  restocked boolean not null default false,
  status text not null default 'pedido',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists subscribers (
  email text primary key,
  created_at timestamptz not null default now(),
  source text not null default '',
  page text not null default '',
  consent text not null default '',
  unsubscribed_at timestamptz
);

create table if not exists discount_codes (
  code text primary key,
  kind text not null default 'percent',
  value numeric(10,2) not null,
  welcome boolean not null default false,
  active boolean not null default true,
  starts_at date,
  ends_at date,
  max_uses integer,
  once_per_email boolean not null default true,
  min_subtotal numeric(10,2) not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists code_uses (
  id serial primary key,
  code text not null,
  email text not null,
  order_number text not null default '',
  at timestamptz not null default now()
);
create index if not exists code_uses_code on code_uses (code, email);

create table if not exists gift_cards (
  code text primary key,
  value numeric(10,2) not null,
  balance numeric(10,2) not null,
  created_at timestamptz not null default now(),
  expires_at date not null,
  buyer text not null default '',
  recipient_name text not null default '',
  recipient_email text not null default '',
  message text not null default '',
  order_number text not null default '',
  sent_at timestamptz,
  notes text not null default ''
);

create table if not exists gift_movements (
  id serial primary key,
  code text not null references gift_cards(code) on delete cascade,
  amount numeric(10,2) not null,
  order_number text not null default '',
  note text not null default '',
  at timestamptz not null default now()
);

create table if not exists notify_requests (
  id serial primary key,
  email text not null,
  product text not null,
  size text not null default '',
  page text not null default '',
  created_at timestamptz not null default now(),
  notified_at timestamptz
);

create table if not exists admin_tokens (
  hash text primary key,
  email text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists admin_sessions (
  hash text primary key,
  email text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
`;

let ready: Promise<void> | null = null;

async function setup() {
  const db = sql();
  await db.unsafe(SCHEMA);
  /* produtos que ainda não estão no CRM entram com os valores do código */
  const known = new Set((await db<{ id: number }[]>`select id from products_state`).map((r) => r.id));
  for (const p of products.filter((x) => !known.has(x.id))) {
    await db`
      insert into products_state ${db({
        id: p.id,
        slug: p.slug,
        name: p.name,
        color: p.color,
        price: p.price,
        stock: p.sizeStock ? null : p.stock ?? null,
        size_stock: p.sizeStock ? db.json(p.sizeStock) : null,
      } as Record<string, unknown>)}
      on conflict (id) do nothing`;
  }
  /* o código de boas-vindas da newsletter */
  await db`
    insert into discount_codes (code, kind, value, welcome, once_per_email, notes)
    values (${site.welcomeCode}, 'percent', ${site.welcomeDiscount}, true, true, 'Boas-vindas da newsletter')
    on conflict (code) do nothing`;
}

/** Cliente da base de dados com o esquema garantido. */
export async function db() {
  if (!ready) ready = setup().catch((e) => { ready = null; throw e; });
  await ready;
  return sql();
}
