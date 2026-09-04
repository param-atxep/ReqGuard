import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";
import { z } from "zod";

const updateSchema = z.object({
  text: z.string().trim().min(8).max(5000).optional(),
  key: z.string().trim().min(1).max(40).optional(),
  category: z.string().trim().max(80).nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  status: z.enum(["DRAFT", "READY_FOR_REVIEW", "UNDER_REVIEW", "APPROVED", "REJECTED", "RELEASED"]).optional(),
  changeSummary: z.string().trim().max(240).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  const existing = await prisma.requirement.findFirst({ where: { id, analysis: { ownerId: userId } } });
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const versionChanged = Boolean(parsed.data.text && parsed.data.text !== existing.text) || Boolean(parsed.data.status && parsed.data.status !== existing.status);
  const nextVersion = existing.version + (versionChanged ? 1 : 0);
  const requirement = await prisma.$transaction(async (tx: typeof prisma) => {
    const updated = await tx.requirement.update({ where: { id }, data: { text: parsed.data.text, key: parsed.data.key, category: parsed.data.category, priority: parsed.data.priority, status: parsed.data.status, version: nextVersion } });
    if (versionChanged) {
      await tx.requirementVersion.create({ data: { requirementId: id, createdById: userId, version: nextVersion, text: updated.text, status: updated.status, changeSummary: parsed.data.changeSummary || (nextVersion !== existing.version ? "Requirement edited" : "Workflow status changed") } });
    }
    return updated;
  });
  await prisma.activityLog.create({ data: { userId, type: "ANALYSIS", title: `Requirement ${requirement.key} updated`, message: requirement.text } });
  return NextResponse.json({ requirement });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.requirement.findFirst({ where: { id, analysis: { ownerId: userId } } });
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  await prisma.requirement.delete({ where: { id } });
  await prisma.activityLog.create({ data: { userId, type: "ANALYSIS", title: `Requirement ${existing.key} deleted` } });
  return NextResponse.json({ ok: true });
}
