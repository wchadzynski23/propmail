import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { STARTER_TEMPLATES } from "@/lib/starter-templates";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { starterId } = await req.json() as { starterId: string };

  const starter = STARTER_TEMPLATES.find((t) => t.id === starterId);
  if (!starter) return NextResponse.json({ error: "Starter not found" }, { status: 404 });

  const template = await db.template.create({
    data: {
      userId,
      name: starter.name,
      subject: starter.subject,
      blocks: JSON.stringify(starter.blocks),
    },
  });

  return NextResponse.json({ id: template.id }, { status: 201 });
}
