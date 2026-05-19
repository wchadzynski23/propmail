import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function getAuthedTemplate(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthorized", status: 401 };

  const userId = (session.user as { id: string }).id;
  const template = await db.template.findFirst({ where: { id, userId } });
  if (!template) return { error: "Not found", status: 404 };

  return { template, userId };
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const result = await getAuthedTemplate(params.id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.template);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await getAuthedTemplate(params.id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const { name, subject, blocks } = await req.json();
  const updated = await db.template.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(subject && { subject }),
      ...(blocks && { blocks: JSON.stringify(blocks) }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const result = await getAuthedTemplate(params.id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  await db.template.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
