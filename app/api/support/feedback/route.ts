import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";

export async function POST(req: Request) {
  const session = await getServerSession(req);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { articleId, helpful } = await req.json();
  if (typeof articleId !== "string" || typeof helpful !== "boolean") return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  await prisma.supportFeedback.upsert({ where: { articleId_userId: { articleId, userId } }, update: { helpful }, create: { articleId, userId, helpful } });
  return NextResponse.json({ ok: true });
}
