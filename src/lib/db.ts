import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { CATALOG, PREVIOUS_PRICES } from "./catalog";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export const hasDatabase = Boolean(url);

let _sql: NeonQueryFunction<false, false> | null = null;
let _ready: Promise<void> | null = null;

const SCHEMA_VERSION = 2;

function client() {
  if (!url) throw new Error("No DATABASE_URL configured");
  if (!_sql) _sql = neon(url);
  return _sql;
}

async function init() {
  const sql = client();
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      slug        TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      short       TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      price       INTEGER NOT NULL,
      category    TEXT NOT NULL,
      in_stock    BOOLEAN NOT NULL DEFAULT TRUE,
      featured    BOOLEAN NOT NULL DEFAULT FALSE,
      image       TEXT,
      sort        INTEGER NOT NULL DEFAULT 0,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id            TEXT PRIMARY KEY,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      customer_name TEXT NOT NULL,
      phone         TEXT NOT NULL,
      address       TEXT NOT NULL,
      city          TEXT NOT NULL,
      zone          TEXT NOT NULL,
      notes         TEXT NOT NULL DEFAULT '',
      items         JSONB NOT NULL,
      subtotal      INTEGER NOT NULL,
      status        TEXT NOT NULL DEFAULT 'awaiting_payment'
    )`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS total INTEGER`;
  await sql`CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC)`;
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key        TEXT PRIMARY KEY,
      value      JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

  // Seed the catalogue the first time (existing rows are never overwritten).
  for (const p of CATALOG) {
    await sql`
      INSERT INTO products (slug, name, short, description, price, category, in_stock, featured, image, sort)
      VALUES (${p.slug}, ${p.name}, ${p.short}, ${p.description}, ${p.price}, ${p.category},
              ${p.inStock}, ${Boolean(p.featured)}, ${p.image ?? null}, ${p.sort})
      ON CONFLICT (slug) DO NOTHING`;
  }

  // One-time migration to v2: new prices and photos, but only where you haven't changed them yourself.
  const rows = (await sql`SELECT value FROM settings WHERE key = 'schema_version'`) as { value: number }[];
  const version = rows[0] ? Number(rows[0].value) : 1;
  if (version < 2) {
    for (const p of CATALOG) {
      const old = PREVIOUS_PRICES[p.slug];
      if (old) await sql`UPDATE products SET price = ${p.price} WHERE slug = ${p.slug} AND price = ${old}`;
      if (p.image) await sql`UPDATE products SET image = ${p.image} WHERE slug = ${p.slug} AND (image IS NULL OR image = '')`;
    }
  }
  if (version < SCHEMA_VERSION) {
    await sql`
      INSERT INTO settings (key, value) VALUES ('schema_version', ${JSON.stringify(SCHEMA_VERSION)}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`;
  }
}

/** Returns the SQL client after making sure tables exist. */
export async function db() {
  if (!_ready) {
    _ready = init().catch((e) => {
      _ready = null;
      throw e;
    });
  }
  await _ready;
  return client();
}
