/**
 * Pricing rules shared by the browser (cart) and the server (orders).
 * The server always recalculates, so the browser can never change a price.
 */

export const PACKS = [
  { id: "250g", grams: 250, label: "250 g" },
  { id: "500g", grams: 500, label: "500 g" },
  { id: "1kg", grams: 1000, label: "1 kg" },
] as const;

export type PackId = (typeof PACKS)[number]["id"];
export const DEFAULT_PACK: PackId = "1kg";

export type DiscountTier = { minKg: number; pct: number };

export type PricingSettings = {
  /** Extra % charged on smaller packs, relative to the per-kg price. */
  packPremium: { "250g": number; "500g": number };
  /** Bulk discounts by total order weight. */
  tiers: DiscountTier[];
};

export const DEFAULT_PRICING: PricingSettings = {
  packPremium: { "250g": 10, "500g": 5 },
  tiers: [
    { minKg: 3, pct: 3 },
    { minKg: 5, pct: 5 },
    { minKg: 10, pct: 8 },
  ],
};

export function isPack(id: unknown): id is PackId {
  return PACKS.some((p) => p.id === id);
}

export function packInfo(id: PackId) {
  return PACKS.find((p) => p.id === id)!;
}

/** Price of one pack, rounded to the nearest Rs. 50. */
export function packPrice(pricePerKg: number, pack: PackId, s: PricingSettings): number {
  const { grams } = packInfo(pack);
  if (grams === 1000) return pricePerKg;
  const premium = pack === "1kg" ? 0 : s.packPremium[pack] ?? 0;
  const raw = (pricePerKg * grams) / 1000 * (1 + premium / 100);
  return Math.max(50, Math.round(raw / 50) * 50);
}

export function sortedTiers(s: PricingSettings) {
  return [...s.tiers].filter((t) => t.minKg > 0 && t.pct > 0).sort((a, b) => a.minKg - b.minKg);
}

export function discountFor(totalGrams: number, s: PricingSettings): DiscountTier | null {
  const kg = totalGrams / 1000;
  let best: DiscountTier | null = null;
  for (const t of sortedTiers(s)) if (kg >= t.minKg) best = t;
  return best;
}

/** The next discount the customer could unlock, and how much more weight they need. */
export function nextTier(totalGrams: number, s: PricingSettings) {
  const kg = totalGrams / 1000;
  const t = sortedTiers(s).find((x) => x.minKg > kg);
  return t ? { ...t, missingKg: Math.round((t.minKg - kg) * 100) / 100 } : null;
}

export type PricedLine = { unitPrice: number; qty: number; grams: number };

export function computeTotals(lines: PricedLine[], s: PricingSettings) {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const weightGrams = lines.reduce((sum, l) => sum + l.grams * l.qty, 0);
  const tier = discountFor(weightGrams, s);
  const discount = tier ? Math.round((subtotal * tier.pct) / 100 / 10) * 10 : 0;
  return { subtotal, weightGrams, discountPct: tier?.pct ?? 0, discount, total: subtotal - discount };
}

export function formatKg(grams: number) {
  const kg = grams / 1000;
  return (Number.isInteger(kg) ? kg.toString() : kg.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")) + " kg";
}

/** Clean up settings coming from the admin form or the database. */
export function normalisePricing(input: unknown): PricingSettings {
  const v = (input ?? {}) as Partial<PricingSettings>;
  const clamp = (n: unknown, lo: number, hi: number, d: number) => {
    const x = Number(n);
    return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : d;
  };
  return {
    packPremium: {
      "250g": clamp(v.packPremium?.["250g"], 0, 100, DEFAULT_PRICING.packPremium["250g"]),
      "500g": clamp(v.packPremium?.["500g"], 0, 100, DEFAULT_PRICING.packPremium["500g"]),
    },
    tiers: Array.isArray(v.tiers)
      ? v.tiers
          .map((t) => ({ minKg: clamp(t?.minKg, 0, 1000, 0), pct: clamp(t?.pct, 0, 50, 0) }))
          .filter((t) => t.minKg > 0 && t.pct > 0)
          .slice(0, 6)
      : DEFAULT_PRICING.tiers,
  };
}
