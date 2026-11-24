"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ORDER_STATUSES, updateOrderStatus, type OrderStatus } from "@/lib/orders";
import { savePricing } from "@/lib/settings";
import { normalisePricing } from "@/lib/pricing";

async function guard() {
  if (!(await isAdmin())) throw new Error("Not authorised");
}

export async function setOrderStatus(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!id || !(status in ORDER_STATUSES)) return;
  await updateOrderStatus(id, status);
  revalidatePath("/admin");
}

export async function updateProduct(formData: FormData) {
  await guard();
  const slug = String(formData.get("slug") ?? "");
  const price = Math.round(Number(formData.get("price")));
  const inStock = formData.get("inStock") === "on";
  const featured = formData.get("featured") === "on";
  const imageRaw = String(formData.get("image") ?? "").trim();
  const image = /^(https:\/\/|\/)[^\s"'<>]{1,1000}$/.test(imageRaw) ? imageRaw : null;
  if (!slug || !Number.isFinite(price) || price <= 0 || price > 10_000_000) return;
  const sql = await db();
  await sql`UPDATE products SET price = ${price}, in_stock = ${inStock}, featured = ${featured}, image = ${image}, updated_at = NOW() WHERE slug = ${slug}`;
  revalidatePath("/", "layout");
}

export async function updatePricing(formData: FormData) {
  await guard();
  const tiers = [0, 1, 2, 3, 4].map((i) => ({
    minKg: Number(formData.get(`tier${i}_kg`) || 0),
    pct: Number(formData.get(`tier${i}_pct`) || 0),
  }));
  await savePricing(
    normalisePricing({
      packPremium: { "250g": Number(formData.get("p250")), "500g": Number(formData.get("p500")) },
      tiers,
    }),
  );
  revalidatePath("/", "layout");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  revalidatePath("/admin");
}
