import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const [contacts, unsubscribes] = await Promise.all([
    db.contact.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
    db.unsubscribe.findMany({
      where: { agentUserId: userId },
      select: { email: true, unsubscribedAt: true },
    }),
  ]);

  const unsubMap = new Map(unsubscribes.map((u) => [u.email, u.unsubscribedAt]));

  return NextResponse.json(
    contacts.map((c) => ({
      ...c,
      unsubscribedAt: unsubMap.get(c.email) ?? null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { email, name, phone, company, notes, tags } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const contact = await db.contact.upsert({
    where:  { userId_email: { userId, email } },
    create: { userId, email, name, phone, company, notes, tags },
    update: { name, phone, company, notes, tags },
  });

  return NextResponse.json(contact, { status: 201 });
}
