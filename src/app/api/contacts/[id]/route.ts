import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const contact = await db.contact.findFirst({ where: { id: params.id, userId } });
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // email history: all sends that contained this contact's email
  const allSends = await db.emailSend.findMany({
    where: { userId },
    orderBy: { sentAt: "desc" },
    include: { template: { select: { id: true, name: true, subject: true } } },
  });

  const emailHistory = allSends
    .filter((s) => {
      const recipients = JSON.parse(s.recipients) as { email: string }[];
      return recipients.some((r) => r.email === contact.email);
    })
    .map((s) => ({
      id:        s.id,
      sentAt:    s.sentAt,
      status:    s.status,
      template:  s.template,
    }));

  // unsubscribe status
  const unsub = await db.unsubscribe.findUnique({
    where: { agentUserId_email: { agentUserId: userId, email: contact.email } },
    select: { unsubscribedAt: true },
  });

  return NextResponse.json({ ...contact, emailHistory, unsubscribedAt: unsub?.unsubscribedAt ?? null });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const contact = await db.contact.findFirst({ where: { id: params.id, userId } });
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, phone, company, notes, tags } = await req.json();

  const updated = await db.contact.update({
    where: { id: params.id },
    data:  { name, phone, company, notes, tags },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const contact = await db.contact.findFirst({ where: { id: params.id, userId } });
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.contact.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
