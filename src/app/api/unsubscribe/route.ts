import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const BASE = process.env.NEXTAUTH_URL || "https://agent.vizmadesign.com";

// ── Shared handler ────────────────────────────────────────────────────────────
async function processUnsubscribe(token: string | null) {
  if (!token) return { ok: false, message: "Missing token." };

  const record = await db.unsubscribe.findUnique({ where: { token } });
  if (!record) return { ok: false, message: "Invalid or expired unsubscribe link." };

  if (record.unsubscribedAt) {
    return { ok: true, message: "You are already unsubscribed.", alreadyDone: true };
  }

  await db.unsubscribe.update({
    where: { token },
    data: { unsubscribedAt: new Date() },
  });

  return { ok: true, message: "You have been unsubscribed successfully.", alreadyDone: false };
}

// ── GET — user clicks link in email ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const result = await processUnsubscribe(token);

  // Redirect to the public unsubscribe page with status
  const url = new URL("/unsubscribe", BASE);
  url.searchParams.set("status", result.ok ? "success" : "error");
  if (result.alreadyDone) url.searchParams.set("already", "1");
  return NextResponse.redirect(url.toString());
}

// ── POST — RFC 8058 one-click unsubscribe from email clients (Gmail, Apple Mail)
export async function POST(req: NextRequest) {
  // Email clients send: Content-Type: application/x-www-form-urlencoded
  // Body: List-Unsubscribe=One-Click
  // Token is in the query string of the URL they POST to
  const token = req.nextUrl.searchParams.get("token");
  const result = await processUnsubscribe(token);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
