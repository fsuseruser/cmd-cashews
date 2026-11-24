"use client";

import { useCart } from "./CartProvider";
import { formatKg, sortedTiers } from "@/lib/pricing";
import { lkr } from "@/lib/format";

/** Totals block with bulk discount and a nudge towards the next tier. */
export function Totals({ deliveryNote }: { deliveryNote: string }) {
  const { subtotal, discount, discountPct, total, weightGrams, next } = useCart();
  const pct = next ? Math.min(100, (weightGrams / 1000 / next.minKg) * 100) : 100;
  return (
    <>
      {next && (
        <div className="nudge">
          <div className="nudge-text">
            Add <b>{formatKg(next.missingKg * 1000)}</b> more to save <b>{next.pct}%</b>
          </div>
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      <div className="totals">
        <div>
          <span>Subtotal · {formatKg(weightGrams)}</span>
          <span>{lkr(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="saving">
            <span>Bulk discount ({discountPct}%)</span>
            <span>−{lkr(discount)}</span>
          </div>
        )}
        <div className="muted" style={{ fontSize: "0.84rem" }}>
          <span>Delivery</span>
          <span>{deliveryNote}</span>
        </div>
        <div className="grand">
          <span>Total</span>
          <span>{lkr(total)}</span>
        </div>
      </div>
    </>
  );
}

export function TierList({ compact = false }: { compact?: boolean }) {
  const { pricing } = useCart();
  const tiers = sortedTiers(pricing);
  if (tiers.length === 0) return null;
  return (
    <div className={`tiers${compact ? " compact" : ""}`}>
      <span className="tiers-title">Bulk savings</span>
      {tiers.map((t) => (
        <span key={t.minKg} className="tier">
          {t.minKg} kg+ <b>−{t.pct}%</b>
        </span>
      ))}
    </div>
  );
}
