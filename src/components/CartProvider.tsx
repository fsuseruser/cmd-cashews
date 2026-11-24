"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/catalog";
import { MAX_QTY } from "@/lib/catalog";
import { computeTotals, isPack, nextTier, packInfo, packPrice, type PackId, type PricingSettings } from "@/lib/pricing";

export type CartLine = { slug: string; pack: PackId; qty: number };
type ProductLite = Pick<Product, "slug" | "name" | "short" | "price" | "tone" | "image" | "inStock">;

export type ViewLine = CartLine & {
  key: string;
  product: ProductLite;
  packLabel: string;
  grams: number;
  unitPrice: number;
  lineTotal: number;
};

type CartCtx = {
  lines: ViewLine[];
  products: Record<string, ProductLite>;
  pricing: PricingSettings;
  count: number;
  subtotal: number;
  discount: number;
  discountPct: number;
  total: number;
  weightGrams: number;
  next: ReturnType<typeof nextTier>;
  ready: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, pack: PackId, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  toast: string | null;
  bumpKey: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "cmd-cart-v2";
const keyOf = (slug: string, pack: PackId) => `${slug}:${pack}`;

export function CartProvider({
  products,
  pricing,
  children,
}: {
  products: ProductLite[];
  pricing: PricingSettings;
  children: React.ReactNode;
}) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bumpKey, setBumpKey] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const map = useMemo(() => Object.fromEntries(products.map((p) => [p.slug, p])), [products]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartLine[];
        if (Array.isArray(parsed))
          setRaw(parsed.filter((l) => l && typeof l.slug === "string" && isPack(l.pack) && l.qty > 0));
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(raw));
    } catch {}
  }, [raw, ready]);

  // Live prices: every line is re-priced from the current price list.
  const lines: ViewLine[] = useMemo(
    () =>
      raw
        .filter((l) => map[l.slug])
        .map((l) => {
          const product = map[l.slug];
          const info = packInfo(l.pack);
          const unitPrice = packPrice(product.price, l.pack, pricing);
          return { ...l, key: keyOf(l.slug, l.pack), product, packLabel: info.label, grams: info.grams, unitPrice, lineTotal: unitPrice * l.qty };
        }),
    [raw, map, pricing],
  );

  const totals = useMemo(
    () => computeTotals(lines.map((l) => ({ unitPrice: l.unitPrice, qty: l.qty, grams: l.grams })), pricing),
    [lines, pricing],
  );

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const add = useCallback(
    (slug: string, pack: PackId, qty = 1) => {
      setRaw((prev) => {
        const found = prev.find((l) => l.slug === slug && l.pack === pack);
        if (found) return prev.map((l) => (l === found ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
        return [...prev, { slug, pack, qty: Math.min(MAX_QTY, qty) }];
      });
      setBumpKey((k) => k + 1);
      flash(`${map[slug]?.name ?? "Item"} (${packInfo(pack).label}) added`);
    },
    [map, flash],
  );

  const setQty = useCallback((key: string, qty: number) => {
    setRaw((prev) =>
      qty <= 0
        ? prev.filter((l) => keyOf(l.slug, l.pack) !== key)
        : prev.map((l) => (keyOf(l.slug, l.pack) === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => setRaw((prev) => prev.filter((l) => keyOf(l.slug, l.pack) !== key)), []);
  const clear = useCallback(() => setRaw([]), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Ctx.Provider
      value={{
        lines,
        products: map,
        pricing,
        count: lines.reduce((s, l) => s + l.qty, 0),
        ...totals,
        next: nextTier(totals.weightGrams, pricing),
        ready,
        open,
        setOpen,
        add,
        setQty,
        remove,
        clear,
        toast,
        bumpKey,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
