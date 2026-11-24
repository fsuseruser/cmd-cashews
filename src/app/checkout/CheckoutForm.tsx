"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { Qty } from "@/components/Qty";
import { BankDetails } from "@/components/BankDetails";
import { Totals } from "@/components/Savings";
import { DELIVERY, type DeliveryZone } from "@/lib/config";
import { lkr } from "@/lib/format";

const LAST_ORDER_KEY = "cmd-last-order";

export function CheckoutForm() {
  const { lines, setQty, clear, ready, total } = useCart();
  const router = useRouter();
  const [zone, setZone] = useState<DeliveryZone>("negombo");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) return <div style={{ minHeight: 400 }} />;

  if (lines.length === 0) {
    return (
      <div className="empty fade-in" style={{ padding: "80px 0 140px" }}>
        <h2>Your cart is empty</h2>
        <p>Add some cashews before checking out.</p>
        <Link href="/shop" className="btn">
          Browse cashews
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    if (fd.get("company")) return; // spam trap
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ slug: l.slug, pack: l.pack, qty: l.qty })),
          zone,
          customer: {
            name: fd.get("name"),
            phone: fd.get("phone"),
            address: fd.get("address"),
            city: fd.get("city"),
            notes: fd.get("notes"),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(data));
      clear();
      router.push(`/checkout/success?order=${encodeURIComponent(data.order.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form className="checkout" onSubmit={submit}>
      <div>
        <div className="panel fade-in" style={{ ["--d" as string]: "150ms" }}>
          <h2>Delivery details</h2>
          <div className="fields">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" autoComplete="name" required minLength={2} maxLength={80} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone / WhatsApp</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" required placeholder="07X XXX XXXX" maxLength={20} />
            </div>
            <div className="field full">
              <label htmlFor="address">Delivery address</label>
              <input id="address" name="address" autoComplete="street-address" required minLength={5} maxLength={240} />
            </div>
            <div className="field">
              <label htmlFor="city">Town / city</label>
              <input id="city" name="city" autoComplete="address-level2" required maxLength={60} />
            </div>
            <div className="field">
              <label htmlFor="notes">Notes (optional)</label>
              <input id="notes" name="notes" maxLength={400} placeholder="Gift, delivery time…" />
            </div>
            <input className="hp" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          </div>
        </div>

        <div className="panel fade-in" style={{ ["--d" as string]: "250ms" }}>
          <h2>Delivery area</h2>
          <div className="options">
            {(Object.keys(DELIVERY) as DeliveryZone[]).map((z) => (
              <label className="option" key={z}>
                <input type="radio" name="zone" value={z} checked={zone === z} onChange={() => setZone(z)} />
                <div>
                  <b>{DELIVERY[z].label}</b>
                  <span>{DELIVERY[z].note}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="panel fade-in" style={{ ["--d" as string]: "350ms" }}>
          <h2>Payment</h2>
          <div className="options" style={{ marginBottom: 20 }}>
            <label className="option">
              <input type="radio" checked readOnly />
              <div>
                <b>Bank transfer</b>
                <span>Transfer after placing your order, then send us the slip on WhatsApp.</span>
              </div>
            </label>
          </div>
          <BankDetails />
        </div>
      </div>

      <aside className="panel summary fade-in" style={{ ["--d" as string]: "200ms" }}>
        <h2>Your order</h2>
        {lines.map((l) => (
          <div className="sum-item" key={l.key}>
            <div>
              <b style={{ display: "block", color: "var(--green)" }}>{l.product.name}</b>
              <span className="muted" style={{ fontSize: "0.8rem" }}>
                {l.packLabel} · {lkr(l.unitPrice)} each
              </span>
              <div style={{ marginTop: 6 }}>
                <Qty value={l.qty} min={0} onChange={(v) => setQty(l.key, v)} small label={l.product.name} />
              </div>
            </div>
            <b>{lkr(l.lineTotal)}</b>
          </div>
        ))}
        <div style={{ marginTop: 18 }}>
          <Totals deliveryNote={zone === "negombo" ? "Free" : "Confirmed on WhatsApp"} />
        </div>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <button className="btn btn-block" style={{ marginTop: 22 }} disabled={busy}>
          {busy ? "Placing order…" : `Place order · ${lkr(total)}${zone === "island" ? " + delivery" : ""}`}
        </button>
        <p className="muted" style={{ fontSize: "0.78rem", textAlign: "center", margin: "12px 0 0" }}>
          Next you&apos;ll get your order number and a button to send it to us on WhatsApp.
        </p>
      </aside>
    </form>
  );
}
