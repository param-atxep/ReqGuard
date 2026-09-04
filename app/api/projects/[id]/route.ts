import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  client: z.string().trim().max(120).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(["ACTIVE", "REVIEW", "COMPLETED", "ARCHIVED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  dueDate: z.string().nullable().optional(),
});

async function ownerId() {
  const session = await getServerSession();
  return session?.user?.id as string | undefined;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await ownerId();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  const exists = await prisma.project.findFirst({ where: { id, ownerId } });
  if (!exists) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const project = await prisma.project.update({
    where: { id },
    data: { ...parsed.data, dueDate: parsed.data.dueDate === undefined ? undefined : parsed.data.dueDate ? new Date(parsed.data.dueDate) : null },
  });
  return NextResponse.json({ project });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await ownerId();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const source = await prisma.project.findFirst({ where: { id, ownerId } });
  if (!source) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const project = await prisma.project.create({ data: { ownerId, name: `${source.name} (Copy)`, client: source.client, description: source.description, priority: source.priority, dueDate: source.dueDate } });
  await prisma.activityLog.create({ data: { userId, type: "PROJECT", title: `Duplicated project "${source.name}"`, message: project.name } });
  return NextResponse.json({ project }, { status: 201 });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await ownerId();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const deleted = await prisma.project.deleteMany({ where: { id, ownerId } });
  if (!deleted.count) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
