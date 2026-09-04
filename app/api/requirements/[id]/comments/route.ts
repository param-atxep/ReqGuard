import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "../../../../../lib/session";
import { z } from "zod";

const schema = z.object({ body: z.string().trim().min(1).max(4000), parentId: z.string().optional() });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const requirement = await prisma.requirement.findFirst({ where: { id, analysis: { ownerId: userId } } });
  if (!requirement) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ comments: await prisma.requirementComment.findMany({ where: { requirementId: id }, orderBy: { createdAt: "asc" }, include: { author: { select: { fullName: true, username: true, image: true } } } }) });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  const requirement = await prisma.requirement.findFirst({ where: { id, analysis: { ownerId: userId } } });
  if (!requirement) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const comment = await prisma.requirementComment.create({ data: { requirementId: id, authorId: userId, body: parsed.data.body, parentId: parsed.data.parentId }, include: { author: { select: { fullName: true, username: true, image: true } } } });
  await prisma.activityLog.create({ data: { userId, type: "ANALYSIS", title: `Comment added to ${requirement.key}`, message: parsed.data.body } });
  return NextResponse.json({ comment }, { status: 201 });
}
