import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "../../../../../lib/session";
import { z } from "zod";

const commentSchema = z.object({ body: z.string().trim().min(1).max(4000), attachment: z.string().max(500).optional(), mentions: z.array(z.string()).max(20).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const parsed = commentSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  const finding = await prisma.finding.findFirst({ where: { id, analysis: { ownerId: userId } } });
  if (!finding) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const comment = await prisma.findingComment.create({ data: { findingId: id, authorId: userId, body: parsed.data.body, attachment: parsed.data.attachment, mentions: parsed.data.mentions }, include: { author: { select: { id: true, fullName: true, username: true } } } });
  await prisma.activityLog.create({ data: { userId, type: "ANALYSIS", title: `Comment added to ${finding.title}`, message: parsed.data.body } });
  return NextResponse.json({ comment }, { status: 201 });
}
