"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { ProductArt } from "./ProductArt";
import { Qty } from "./Qty";
import { Totals } from "./Savings";
import { lkr } from "@/lib/format";
import { CashewIcon } from "./Cashew";

export function CartDrawer() {
  const { open, setOpen, lines, total, setQty, remove, toast } = useCart();

  return (
    <>
      <div className={`overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={`drawer${open ? " open" : ""}`} aria-label="Shopping cart" aria-hidden={!open} inert={!open}>
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {lines.length === 0 ? (
            <div className="empty">
              <div style={{ display: "grid", placeItems: "center", marginBottom: 18 }}>
                <CashewIcon size={46} color="#D2B07A" stroke />
              </div>
              <h3>Your cart is empty</h3>
              <p>Pick a flavour or two, in 250 g, 500 g or 1 kg packs.</p>
              <Link href="/shop" className="btn btn-sm" onClick={() => setOpen(false)}>
                Browse cashews
              </Link>
            </div>
          ) : (
            lines.map((l) => (
              <div className="line-item" key={l.key}>
                <div className="line-thumb">
                  <ProductArt name={l.product.name} tone={l.product.tone} image={l.product.image} sizes="72px" />
                </div>
                <div>
                  <h4>{l.product.name}</h4>
                  <p>
                    {l.packLabel} · {lkr(l.unitPrice)}
                  </p>
                  <Qty value={l.qty} min={0} onChange={(v) => setQty(l.key, v)} small label={l.product.name} />
                </div>
                <div className="line-right">
                  <b style={{ color: "var(--green)" }}>{lkr(l.lineTotal)}</b>
                  <button className="remove" onClick={() => remove(l.key)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className="drawer-foot">
            <Totals deliveryNote="Free in Negombo" />
            <Link href="/checkout" className="btn btn-block" style={{ marginTop: 18 }} onClick={() => setOpen(false)}>
              Checkout · {lkr(total)}
            </Link>
            <p className="muted" style={{ fontSize: "0.76rem", textAlign: "center", margin: "12px 0 0" }}>
              Pay by bank transfer · Confirm on WhatsApp
            </p>
          </div>
        )}
      </aside>

      <div className={`toast${toast ? " show" : ""}`} role="status" aria-live="polite">
        <CashewIcon size={16} color="#D2B07A" />
        {toast}
      </div>
    </>
  );
}
