import "server-only";
import { db, hasDatabase } from "./db";
import { DEFAULT_PRICING, normalisePricing, type PricingSettings } from "./pricing";

export async function getPricing(): Promise<PricingSettings> {
  if (!hasDatabase) return DEFAULT_PRICING;
  try {
    const sql = await db();
    const rows = (await sql`SELECT value FROM settings WHERE key = 'pricing'`) as { value: unknown }[];
    return rows[0] ? normalisePricing(rows[0].value) : DEFAULT_PRICING;
  } catch (e) {
    console.error("[settings] using default pricing", e);
    return DEFAULT_PRICING;
  }
}

export async function savePricing(p: PricingSettings) {
  const sql = await db();
  const value = JSON.stringify(normalisePricing(p));
  await sql`
    INSERT INTO settings (key, value) VALUES ('pricing', ${value}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`;
}
