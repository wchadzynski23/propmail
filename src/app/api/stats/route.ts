import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const [templateCount, sendCount, recentSends] = await Promise.all([
    db.template.count({ where: { userId } }),
    db.emailSend.count({ where: { userId } }),
    db.emailSend.findMany({
      where: { userId },
      orderBy: { sentAt: "desc" },
      take: 5,
      include: { template: { select: { name: true } } },
    }),
  ]);

  const totalRecipients = await db.emailSend.findMany({ where: { userId }, select: { recipients: true } });
  const recipientCount = totalRecipients.reduce((acc, s) => {
    const arr = JSON.parse(s.recipients) as unknown[];
    return acc + arr.length;
  }, 0);

  return NextResponse.json({ templateCount, sendCount, recipientCount, recentSends });
}
