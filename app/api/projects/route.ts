import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "../../../lib/session";
import { getWorkspaceContext } from "../../../lib/workspace";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  client: z.string().trim().max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  dueDate: z.string().optional(),
});

async function userId() {
  const session = await getServerSession();
  return session?.user?.id as string | undefined;
}

export async function GET(req: Request) {
  const ownerId = await userId();
  if (!ownerId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const url = new URL(req.url);
  const search = url.searchParams.get("q")?.trim();
  const projects = await prisma.project.findMany({
    where: { ownerId, ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { members: true, analyses: true } } },
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const ownerId = await userId();
  if (!ownerId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = projectSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "INVALID_REQUEST" }, { status: 400 });
  const workspace = await getWorkspaceContext(ownerId);
  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      ownerId,
      workspaceId: workspace?.workspaceId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    },
  });
  await prisma.activityLog.create({ data: { userId: ownerId, type: "PROJECT", title: "Project created", message: project.name } });
  return NextResponse.json({ project }, { status: 201 });
}
