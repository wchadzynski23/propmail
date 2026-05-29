import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const source = await db.template.findFirst({ where: { id: params.id, userId } });
  if (!source) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const copy = await db.template.create({
    data: {
      userId,
      name:    `Copy of ${source.name}`,
      subject: source.subject,
      blocks:  source.blocks,
    },
  });

  return NextResponse.json(copy, { status: 201 });
}
