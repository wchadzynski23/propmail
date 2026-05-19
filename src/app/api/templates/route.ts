import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const templates = await db.template.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { sends: true } } },
  });

  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { name, subject, blocks } = await req.json();

  if (!name || !subject || !blocks) {
    return NextResponse.json({ error: "name, subject, and blocks are required" }, { status: 400 });
  }

  const template = await db.template.create({
    data: { userId, name, subject, blocks: JSON.stringify(blocks) },
  });

  return NextResponse.json(template, { status: 201 });
}
