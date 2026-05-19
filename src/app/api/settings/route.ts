import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const settings = await db.userSettings.findUnique({ where: { userId } });

  return NextResponse.json(settings || {});
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { resendApiKey, senderEmail, senderName } = await req.json();

  const settings = await db.userSettings.upsert({
    where: { userId },
    create: { userId, resendApiKey, senderEmail, senderName },
    update: { resendApiKey, senderEmail, senderName },
  });

  return NextResponse.json(settings);
}
