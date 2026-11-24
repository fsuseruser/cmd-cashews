import { NextResponse } from "next/server";
import { createOrder, validateInput } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const v = validateInput(body);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  const result = await createOrder(v.data);
  if (!result.ok) return NextResponse.json(result, { status: 409 });
  return NextResponse.json(result, { status: 201 });
}
