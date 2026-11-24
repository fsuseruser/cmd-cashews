"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BankDetails } from "@/components/BankDetails";
import { DELIVERY } from "@/lib/config";
import { lkr } from "@/lib/format";
import { orderMessage, whatsappLink } from "@/lib/whatsapp";
import type { Order } from "@/lib/orders";
import { formatKg } from "@/lib/pricing";

const KEY = "cmd-last-order";

export function SuccessView() {
  const params = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw) as { order: Order };
        if (!params.get("order") || data.order.id === params.get("order")) setOrder(data.order);
      }
    } catch {}
    setLoaded(true);
  }, [params]);

  if (!loaded) return <div style={{ minHeight: 500 }} />;

  if (!order) {
    return (
      <div className="success empty">
        <h1 style={{ fontSize: "2.6rem" }}>No recent order found</h1>
        <p>If you just placed an order, please send it to us on WhatsApp with your order number.</p>
        <Link href="/shop" className="btn">
          Back to shop
        </Link>
      </div>
    );
  }

  const wa = whatsappLink(orderMessage(order));
  const total = lkr(order.total) + (order.deliveryFee === null ? " + delivery" : "");

  return (
    <div className="success">
      <div className="tick" aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 34 34">
          <path d="M8 17.5l6 6 12-13" fill="none" stroke="#F8F4EC" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="eyebrow fade-in">Thank you, {order.customerName.split(" ")[0]}</span>
      <h1 className="fade-in" style={{ ["--d" as string]: "100ms", fontSize: "clamp(2.4rem, 5vw, 3.6rem)", marginTop: 12 }}>
        Your order is reserved
      </h1>
      <div className="order-id fade-in" style={{ ["--d" as string]: "180ms" }}>
        {order.id}
      </div>

      <ol className="next-steps fade-in" style={{ ["--d" as string]: "260ms" }}>
        <li>
          <span>
            Transfer <b>{total}</b> to the account below. Use <b>{order.id}</b> as the reference.
          </span>
        </li>
        <li>
          <span>Send your order to us on WhatsApp using the button below.</span>
        </li>
        <li>
          <span>Share your payment slip in the same chat. We&apos;ll confirm and arrange delivery.</span>
        </li>
      </ol>

      <div className="fade-in" style={{ ["--d" as string]: "340ms", display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 30 }}>
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
            </svg>
            Send order on WhatsApp
          </a>
        ) : (
          <div className="notice">The WhatsApp number isn&apos;t set up yet. Please contact the shop with your order number.</div>
        )}
        <Link href="/shop" className="btn btn-ghost">
          Continue shopping
        </Link>
      </div>

      <div className="fade-in" style={{ ["--d" as string]: "420ms" }}>
        <BankDetails amount={total} reference={order.id} />
      </div>

      <div className="panel fade-in" style={{ ["--d" as string]: "500ms", marginTop: 24 }}>
        <h2 style={{ fontSize: "1.6rem" }}>Order summary</h2>
        {order.items.map((i) => (
          <div className="sum-item" key={i.slug}>
            <span>
              {i.name} · {i.packLabel} × {i.qty}
            </span>
            <b>{lkr(i.total)}</b>
          </div>
        ))}
        <div className="totals" style={{ marginTop: 16 }}>
          <div>
            <span>Subtotal · {formatKg(order.weightGrams)}</span>
            <span>{lkr(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="saving">
              <span>Bulk discount ({order.discountPct}%)</span>
              <span>−{lkr(order.discount)}</span>
            </div>
          )}
          <div>
            <span>Delivery</span>
            <span>
              {DELIVERY[order.zone].label}: {DELIVERY[order.zone].note}
            </span>
          </div>
          <div className="grand">
            <span>Total</span>
            <span>{total}</span>
          </div>
        </div>
        <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 0 }}>
          Delivering to {order.address}, {order.city} · {order.phone}
        </p>
      </div>
    </div>
  );
}
