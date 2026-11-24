import type { Metadata } from "next";
import Link from "next/link";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { listOrders, ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/orders";
import { getProducts } from "@/lib/products";
import { formatDate, lkr } from "@/lib/format";
import { DELIVERY } from "@/lib/config";
import { logout, setOrderStatus, updatePricing, updateProduct } from "./actions";
import { getPricing } from "@/lib/settings";
import { PACKS, packPrice, sortedTiers } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

type SP = { searchParams: Promise<{ tab?: string; status?: string; error?: string }> };

export default async function AdminPage({ searchParams }: SP) {
  const sp = await searchParams;

  if (!adminConfigured) {
    return (
      <div className="container admin">
        <h1 style={{ fontSize: "2.6rem" }}>Admin</h1>
        <p className="notice" style={{ marginTop: 20 }}>
          Set an <b>ADMIN_PASSWORD</b> environment variable in Vercel (Project → Settings → Environment Variables), then redeploy.
        </p>
      </div>
    );
  }

  if (!(await isAdmin())) {
    return (
      <div className="container admin" style={{ maxWidth: 460 }}>
        <span className="eyebrow">CMD Cashews</span>
        <h1 style={{ fontSize: "2.6rem", margin: "12px 0 24px" }}>Admin sign in</h1>
        <form action="/api/admin/login" method="post" className="panel">
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" />
          </div>
          {sp.error && <div className="error">Incorrect password.</div>}
          <button className="btn btn-block" style={{ marginTop: 18 }}>
            Sign in
          </button>
        </form>
      </div>
    );
  }

  const tab = sp.tab === "products" ? "products" : sp.tab === "pricing" ? "pricing" : "orders";
  const statusFilter = sp.status && sp.status in ORDER_STATUSES ? (sp.status as OrderStatus) : undefined;

  return (
    <div className="container admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span className="eyebrow">CMD Cashews</span>
          <h1 style={{ fontSize: "2.6rem", marginTop: 10 }}>Admin</h1>
        </div>
        <form action={logout}>
          <button className="btn btn-ghost btn-sm">Sign out</button>
        </form>
      </div>

      {!hasDatabase && (
        <p className="notice" style={{ marginTop: 22 }}>
          No database is connected, so orders are only received on WhatsApp and prices come from <code>src/lib/catalog.ts</code>. In Vercel,
          open your project → <b>Storage</b> → <b>Create Database</b> → <b>Neon (Postgres)</b> and connect it. Tables are created
          automatically.
        </p>
      )}

      <div className="admin-tabs">
        <Link href="/admin" className="chip" aria-pressed={tab === "orders"} style={{ display: "inline-flex", alignItems: "center" }}>
          Orders
        </Link>
        <Link
          href="/admin?tab=products"
          className="chip"
          aria-pressed={tab === "products"}
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          Products & prices
        </Link>
        <Link
          href="/admin?tab=pricing"
          className="chip"
          aria-pressed={tab === "pricing"}
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          Packs & bulk discounts
        </Link>
      </div>

      {tab === "orders" ? <Orders statusFilter={statusFilter} /> : tab === "products" ? <Products /> : <Pricing />}
    </div>
  );
}

async function Orders({ statusFilter }: { statusFilter?: OrderStatus }) {
  let orders: Order[] = [];
  let failed = false;
  try {
    orders = hasDatabase ? await listOrders() : [];
  } catch (e) {
    console.error(e);
    failed = true;
  }
  const shown = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;
  const awaiting = orders.filter((o) => o.status === "awaiting_payment");
  const paidValue = orders.filter((o) => ["paid", "dispatched", "delivered"].includes(o.status)).reduce((s, o) => s + o.total, 0);

  return (
    <>
      {failed && <p className="notice">Could not load orders. Check the database connection.</p>}
      <div className="stats" style={{ marginBottom: 22 }}>
        <div className="stat">
          <small>Total orders</small>
          <b>{orders.length}</b>
        </div>
        <div className="stat">
          <small>Awaiting payment</small>
          <b>{awaiting.length}</b>
        </div>
        <div className="stat">
          <small>Awaiting value</small>
          <b>{lkr(awaiting.reduce((s, o) => s + o.total, 0))}</b>
        </div>
        <div className="stat">
          <small>Paid sales</small>
          <b>{lkr(paidValue)}</b>
        </div>
      </div>

      <div className="filters" style={{ marginBottom: 18 }}>
        <Link href="/admin" className="chip" aria-pressed={!statusFilter} style={{ display: "inline-flex", alignItems: "center" }}>
          All
        </Link>
        {(Object.keys(ORDER_STATUSES) as OrderStatus[]).map((s) => (
          <Link
            key={s}
            href={`/admin?status=${s}`}
            className="chip"
            aria-pressed={statusFilter === s}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            {ORDER_STATUSES[s]}
          </Link>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="muted" style={{ textAlign: "center", padding: 40 }}>
                  No orders yet.
                </td>
              </tr>
            )}
            {shown.map((o) => (
              <tr key={o.id}>
                <td>
                  <b style={{ color: "var(--green)" }}>{o.id}</b>
                  <div className="muted" style={{ fontSize: "0.78rem" }}>
                    {formatDate(o.createdAt)}
                  </div>
                </td>
                <td>
                  <b>{o.customerName}</b>
                  <div>
                    <a className="link" href={`https://wa.me/${o.phone.replace(/\D/g, "").replace(/^0/, "94")}`} target="_blank" rel="noopener noreferrer">
                      {o.phone}
                    </a>
                  </div>
                  <div className="muted" style={{ fontSize: "0.8rem" }}>
                    {o.address}, {o.city}
                    <br />
                    {DELIVERY[o.zone].label}
                  </div>
                  {o.notes && <div style={{ fontSize: "0.8rem", marginTop: 4 }}>“{o.notes}”</div>}
                </td>
                <td>
                  {o.items.map((i) => (
                    <div key={i.slug} style={{ whiteSpace: "nowrap" }}>
                      {i.name} · {i.packLabel} × {i.qty}
                    </div>
                  ))}
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <b>{lkr(o.total)}</b>
                  {o.discount > 0 && <div className="muted" style={{ fontSize: "0.75rem" }}>−{lkr(o.discount)} bulk</div>}
                  {o.deliveryFee === null && <div className="muted" style={{ fontSize: "0.75rem" }}>+ delivery</div>}
                </td>
                <td>
                  <span className={`status ${o.status}`}>{ORDER_STATUSES[o.status]}</span>
                  <form action={setOrderStatus} style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <input type="hidden" name="id" value={o.id} />
                    <select name="status" defaultValue={o.status} className="mini-select" aria-label="Change status">
                      {(Object.keys(ORDER_STATUSES) as OrderStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUSES[s]}
                        </option>
                      ))}
                    </select>
                    <button className="copy" style={{ color: "var(--green)", borderColor: "var(--line-strong)" }}>
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

async function Products() {
  const [products, pricing] = await Promise.all([getProducts(), getPricing()]);
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price per kg · photo · visibility</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.slug}>
              <td style={{ width: 260 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" width={52} height={52} style={{ borderRadius: 10, objectFit: "cover", width: 52, height: 52 }} />
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: 10, background: p.tone.bg }} />
                  )}
                  <div>
                    <b style={{ color: "var(--green)" }}>{p.name}</b>
                    <div className="muted" style={{ fontSize: "0.78rem" }}>
                      {PACKS.map((x) => `${x.label} ${lkr(packPrice(p.price, x.id, pricing))}`).join(" · ")}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <form action={updateProduct} style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <input type="hidden" name="slug" value={p.slug} />
                  <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    Rs.
                    <input name="price" type="number" min={1} step={10} defaultValue={p.price} className="mini-input" disabled={!hasDatabase} aria-label={`Price per kg for ${p.name}`} />
                  </label>
                  <input
                    name="image"
                    type="url"
                    defaultValue={p.image ?? ""}
                    placeholder="Photo URL (https://…)"
                    className="mini-input"
                    style={{ width: 240 }}
                    disabled={!hasDatabase}
                    aria-label={`Photo URL for ${p.name}`}
                  />
                  <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="checkbox" name="inStock" defaultChecked={p.inStock} disabled={!hasDatabase} /> In stock
                  </label>
                  <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="checkbox" name="featured" defaultChecked={p.featured} disabled={!hasDatabase} /> Signature
                  </label>
                  <button className="btn btn-sm" disabled={!hasDatabase}>
                    Save
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function Pricing() {
  const [pricing, products] = await Promise.all([getPricing(), getProducts()]);
  const tiers = sortedTiers(pricing);
  const rows = [0, 1, 2, 3, 4].map((i) => tiers[i] ?? { minKg: "", pct: "" });
  const sample = products[0];
  return (
    <form action={updatePricing} className="panel" style={{ maxWidth: 760 }}>
      <h2 style={{ fontSize: "1.7rem" }}>Pack sizes</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Smaller packs cost a little more per kg to cover packaging. Prices are rounded to the nearest Rs. 50.
      </p>
      <div className="fields" style={{ maxWidth: 420 }}>
        <div className="field">
          <label htmlFor="p250">250 g premium (%)</label>
          <input id="p250" name="p250" type="number" min={0} max={100} step={0.5} defaultValue={pricing.packPremium["250g"]} disabled={!hasDatabase} />
        </div>
        <div className="field">
          <label htmlFor="p500">500 g premium (%)</label>
          <input id="p500" name="p500" type="number" min={0} max={100} step={0.5} defaultValue={pricing.packPremium["500g"]} disabled={!hasDatabase} />
        </div>
      </div>
      {sample && (
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          Example, {sample.name}:{" "}
          {PACKS.map((x) => `${x.label} ${lkr(packPrice(sample.price, x.id, pricing))}`).join(" · ")}
        </p>
      )}

      <h2 style={{ fontSize: "1.7rem", marginTop: 30 }}>Bulk discounts</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Based on the total weight of the order (all flavours and pack sizes count). Leave a row empty to remove it.
      </p>
      <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        {rows.map((t, i) => (
          <div key={i} className="fields" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="field">
              <label htmlFor={`tier${i}_kg`}>From (kg)</label>
              <input id={`tier${i}_kg`} name={`tier${i}_kg`} type="number" min={0} step={0.5} defaultValue={t.minKg} disabled={!hasDatabase} />
            </div>
            <div className="field">
              <label htmlFor={`tier${i}_pct`}>Discount (%)</label>
              <input id={`tier${i}_pct`} name={`tier${i}_pct`} type="number" min={0} max={50} step={0.5} defaultValue={t.pct} disabled={!hasDatabase} />
            </div>
          </div>
        ))}
      </div>
      <button className="btn" style={{ marginTop: 24 }} disabled={!hasDatabase}>
        Save pricing
      </button>
    </form>
  );
}
