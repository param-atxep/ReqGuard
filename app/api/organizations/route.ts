import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "../../../lib/session";
import { z } from "zod";

const schema = z.object({ name: z.string().trim().min(2).max(120) });
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);

export async function GET() {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const organizations = await prisma.organization.findMany({ where: { members: { some: { userId } } }, include: { _count: { select: { members: true, projects: true } } }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ organizations });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
  const base = slugify(parsed.data.name) || `workspace-${userId.slice(-6)}`;
  const slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
  const organization = await prisma.organization.create({ data: { name: parsed.data.name, slug, ownerId: userId, members: { create: { userId, role: "OWNER" } } }, include: { _count: { select: { members: true, projects: true } } } });
  await prisma.activityLog.create({ data: { userId, type: "SETTINGS", title: `Created workspace ${organization.name}` } });
  return NextResponse.json({ organization }, { status: 201 });
}
