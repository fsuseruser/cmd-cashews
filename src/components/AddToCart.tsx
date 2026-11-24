"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { Qty } from "./Qty";
import { TierList } from "./Savings";
import { lkr } from "@/lib/format";
import { DEFAULT_PACK, PACKS, packPrice, type PackId } from "@/lib/pricing";

export function QuickAdd({ slug, inStock }: { slug: string; inStock: boolean }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  if (!inStock) return null;
  return (
    <div className="card-quick">
      <button
        className="btn btn-sm btn-block"
        onClick={() => {
          add(slug, DEFAULT_PACK, 1);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        }}
      >
        {done ? "Added ✓" : "Add 1 kg to cart"}
      </button>
    </div>
  );
}

/** Live "from" price for cards, so admin changes to pack pricing show everywhere. */
export function FromPrice({ slug }: { slug: string }) {
  const { products, pricing } = useCart();
  const p = products[slug];
  if (!p) return null;
  return <small>250 g from {lkr(packPrice(p.price, "250g", pricing))}</small>;
}

export function BuyBox({ slug, inStock }: { slug: string; inStock: boolean }) {
  const { add, setOpen, products, pricing } = useCart();
  const [pack, setPack] = useState<PackId>(DEFAULT_PACK);
  const [qty, setQty] = useState(1);
  const p = products[slug];
  if (!p) return null;
  const unit = packPrice(p.price, pack, pricing);

  if (!inStock) {
    return (
      <div className="pdp-buy">
        <button className="btn btn-block" disabled>
          Out of stock
        </button>
      </div>
    );
  }
  return (
    <>
      <div className="packs" role="radiogroup" aria-label="Pack size">
        {PACKS.map((x) => {
          const price = packPrice(p.price, x.id, pricing);
          const perKg = Math.round((price / x.grams) * 1000);
          return (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={pack === x.id}
              className="pack"
              onClick={() => setPack(x.id)}
            >
              <b>{x.label}</b>
              <span>{lkr(price)}</span>
              <small>{x.grams === 1000 ? "Best value" : `${lkr(perKg)}/kg`}</small>
            </button>
          );
        })}
      </div>
      <div className="pdp-buy">
        <Qty value={qty} onChange={(v) => setQty(Math.max(1, v))} label={p.name} />
        <button
          className="btn"
          onClick={() => {
            add(slug, pack, qty);
            setOpen(true);
          }}
        >
          Add to cart · {lkr(unit * qty)}
        </button>
      </div>
      <TierList />
    </>
  );
}
