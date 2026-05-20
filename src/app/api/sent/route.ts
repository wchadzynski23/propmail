import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const sends = await db.emailSend.findMany({
    where: { userId },
    orderBy: { sentAt: "desc" },
    include: { template: { select: { id: true, name: true, subject: true } } },
  });

  // get all contacts + unsubscribes for this user to enrich recipients
  const [contacts, unsubscribes] = await Promise.all([
    db.contact.findMany({ where: { userId }, select: { email: true, name: true, company: true, tags: true } }),
    db.unsubscribe.findMany({ where: { agentUserId: userId }, select: { email: true, unsubscribedAt: true } }),
  ]);

  const contactMap  = new Map(contacts.map((c) => [c.email, c]));
  const unsubMap    = new Map(unsubscribes.map((u) => [u.email, u.unsubscribedAt]));

  return NextResponse.json(
    sends.map((s) => {
      const recipients = (JSON.parse(s.recipients) as { email: string; name?: string }[]).map((r) => ({
        ...r,
        contactName:    contactMap.get(r.email)?.name  ?? null,
        company:        contactMap.get(r.email)?.company ?? null,
        tags:           contactMap.get(r.email)?.tags   ?? null,
        unsubscribedAt: unsubMap.get(r.email)           ?? null,
      }));
      return {
        id:             s.id,
        sentAt:         s.sentAt,
        status:         s.status,
        template:       s.template,
        recipientCount: recipients.length,
        recipients,
      };
    })
  );
}
