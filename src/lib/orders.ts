import "server-only";
import { randomInt } from "crypto";
import { db, hasDatabase } from "./db";
import { getProducts } from "./products";
import { getPricing } from "./settings";
import { DELIVERY, type DeliveryZone } from "./config";
import { MAX_QTY } from "./catalog";
import { computeTotals, isPack, packInfo, packPrice, type PackId } from "./pricing";

export const ORDER_STATUSES = {
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const;
export type OrderStatus = keyof typeof ORDER_STATUSES;

export type OrderItem = {
  slug: string;
  name: string;
  pack: PackId;
  packLabel: string;
  grams: number;
  qty: number;
  price: number; // per pack
  total: number;
};

export type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  zone: DeliveryZone;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountPct: number;
  total: number;
  weightGrams: number;
  deliveryFee: number | null;
  status: OrderStatus;
  saved: boolean;
};

export type OrderInput = {
  items: { slug: string; pack: PackId; qty: number }[];
  customer: { name: string; phone: string; address: string; city: string; notes?: string };
  zone: DeliveryZone;
};

function clean(s: unknown, max: number) {
  return String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function validateInput(body: unknown): { ok: true; data: OrderInput } | { ok: false; error: string } {
  const b = body as Partial<OrderInput> | null;
  if (!b || typeof b !== "object") return { ok: false, error: "Invalid request." };
  const items = Array.isArray(b.items) ? b.items : [];
  if (items.length === 0) return { ok: false, error: "Your cart is empty." };
  if (items.length > 60) return { ok: false, error: "Too many items." };

  const c = b.customer ?? ({} as OrderInput["customer"]);
  const name = clean(c.name, 80);
  const phone = clean(c.phone, 20);
  const address = clean(c.address, 240);
  const city = clean(c.city, 60);
  const notes = clean(c.notes, 400);
  if (name.length < 2) return { ok: false, error: "Please enter your name." };
  if (phone.replace(/\D/g, "").length < 9) return { ok: false, error: "Please enter a valid phone number." };
  if (address.length < 5) return { ok: false, error: "Please enter your delivery address." };
  if (city.length < 2) return { ok: false, error: "Please enter your town or city." };

  const zone: DeliveryZone = b.zone === "island" ? "island" : "negombo";

  return {
    ok: true,
    data: {
      items: items.map((i) => ({
        slug: clean(i?.slug, 80),
        pack: isPack(i?.pack) ? i.pack : "1kg",
        qty: Math.max(1, Math.min(MAX_QTY, Math.floor(Number(i?.qty) || 0))),
      })),
      customer: { name, phone, address, city, notes },
      zone,
    },
  };
}

function newOrderId() {
  const d = new Date();
  const ymd =
    String(d.getUTCFullYear()).slice(2) +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += alphabet[randomInt(alphabet.length)];
  return `CMD-${ymd}-${s}`;
}

/** Prices and discounts are always worked out on the server from the live price list. */
export async function createOrder(input: OrderInput): Promise<{ ok: true; order: Order } | { ok: false; error: string }> {
  const [products, pricing] = await Promise.all([getProducts(), getPricing()]);

  const merged = new Map<string, { slug: string; pack: PackId; qty: number }>();
  for (const i of input.items) {
    const key = `${i.slug}:${i.pack}`;
    const prev = merged.get(key);
    merged.set(key, { slug: i.slug, pack: i.pack, qty: Math.min(MAX_QTY, (prev?.qty ?? 0) + i.qty) });
  }

  const items: OrderItem[] = [];
  for (const { slug, pack, qty } of merged.values()) {
    const p = products.find((x) => x.slug === slug);
    if (!p) return { ok: false, error: "One of the items in your cart is no longer available." };
    if (!p.inStock) return { ok: false, error: `${p.name} is currently out of stock.` };
    const info = packInfo(pack);
    const price = packPrice(p.price, pack, pricing);
    items.push({ slug, name: p.name, pack, packLabel: info.label, grams: info.grams, qty, price, total: price * qty });
  }

  const t = computeTotals(
    items.map((i) => ({ unitPrice: i.price, qty: i.qty, grams: i.grams })),
    pricing,
  );

  const order: Order = {
    id: newOrderId(),
    createdAt: new Date().toISOString(),
    customerName: input.customer.name,
    phone: input.customer.phone,
    address: input.customer.address,
    city: input.customer.city,
    zone: input.zone,
    notes: input.customer.notes ?? "",
    items,
    subtotal: t.subtotal,
    discount: t.discount,
    discountPct: t.discountPct,
    total: t.total,
    weightGrams: t.weightGrams,
    deliveryFee: DELIVERY[input.zone].fee,
    status: "awaiting_payment",
    saved: false,
  };

  if (hasDatabase) {
    try {
      const sql = await db();
      await sql`
        INSERT INTO orders (id, customer_name, phone, address, city, zone, notes, items, subtotal, discount, total, status)
        VALUES (${order.id}, ${order.customerName}, ${order.phone}, ${order.address}, ${order.city},
                ${order.zone}, ${order.notes}, ${JSON.stringify(items)}::jsonb, ${order.subtotal},
                ${order.discount}, ${order.total}, ${order.status})`;
      order.saved = true;
    } catch (e) {
      // Never block a customer: the order still goes through on WhatsApp.
      console.error("[orders] could not save order", e);
    }
  }
  return { ok: true, order };
}

type OrderRow = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  zone: string;
  notes: string;
  items: Partial<OrderItem>[];
  subtotal: number;
  discount: number | null;
  total: number | null;
  status: string;
};

function fromRow(r: OrderRow): Order {
  const zone: DeliveryZone = r.zone === "island" ? "island" : "negombo";
  const items: OrderItem[] = (r.items ?? []).map((i) => {
    const pack: PackId = isPack(i.pack) ? i.pack : "1kg";
    const info = packInfo(pack);
    return {
      slug: i.slug ?? "",
      name: i.name ?? "",
      pack,
      packLabel: i.packLabel ?? info.label,
      grams: i.grams ?? info.grams,
      qty: Number(i.qty ?? 0),
      price: Number(i.price ?? 0),
      total: Number(i.total ?? 0),
    };
  });
  const subtotal = Number(r.subtotal);
  const discount = Number(r.discount ?? 0);
  return {
    id: r.id,
    createdAt: new Date(r.created_at).toISOString(),
    customerName: r.customer_name,
    phone: r.phone,
    address: r.address,
    city: r.city,
    zone,
    notes: r.notes,
    items,
    subtotal,
    discount,
    discountPct: subtotal ? Math.round((discount / subtotal) * 100) : 0,
    total: r.total != null ? Number(r.total) : subtotal - discount,
    weightGrams: items.reduce((s, i) => s + i.grams * i.qty, 0),
    deliveryFee: DELIVERY[zone].fee,
    status: (r.status in ORDER_STATUSES ? r.status : "awaiting_payment") as OrderStatus,
    saved: true,
  };
}

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  if (!hasDatabase) return [];
  const sql = await db();
  const rows = (status
    ? await sql`SELECT * FROM orders WHERE status = ${status} ORDER BY created_at DESC LIMIT 300`
    : await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 300`) as OrderRow[];
  return rows.map(fromRow);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const sql = await db();
  await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
}
