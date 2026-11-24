import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "cmd_admin";
const password = process.env.ADMIN_PASSWORD || "";

export const adminConfigured = password.length > 0;

function token() {
  return createHmac("sha256", password).update("cmd-admin-session-v1").digest("hex");
}

export function checkPassword(input: string) {
  if (!adminConfigured) return false;
  const a = Buffer.from(createHmac("sha256", "cmp").update(input).digest("hex"));
  const b = Buffer.from(createHmac("sha256", "cmp").update(password).digest("hex"));
  return timingSafeEqual(a, b);
}

export function sessionToken() {
  return token();
}

export async function isAdmin() {
  if (!adminConfigured) return false;
  const jar = await cookies();
  const v = jar.get(ADMIN_COOKIE)?.value;
  if (!v) return false;
  const expected = token();
  return v.length === expected.length && timingSafeEqual(Buffer.from(v), Buffer.from(expected));
}
