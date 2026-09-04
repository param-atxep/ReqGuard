import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";
import { z } from "zod";

const updateSchema = z.object({ status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED", "WONT_FIX"]).optional(), severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(), assigneeId: z.string().nullable().optional(), acceptSuggestion: z.boolean().optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.finding.findFirst({ where: { id, analysis: { ownerId: userId } } });
  if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  const finding = await prisma.finding.update({ where: { id }, data: { status: parsed.data.status, severity: parsed.data.severity, assigneeId: parsed.data.assigneeId } });
  const auditData = [
    parsed.data.status && parsed.data.status !== existing.status ? { field: "status", fromValue: existing.status, toValue: parsed.data.status } : null,
    parsed.data.severity && parsed.data.severity !== existing.severity ? { field: "severity", fromValue: existing.severity, toValue: parsed.data.severity } : null,
    parsed.data.assigneeId !== undefined && parsed.data.assigneeId !== existing.assigneeId ? { field: "assignee", fromValue: existing.assigneeId, toValue: parsed.data.assigneeId } : null,
  ].filter((item): item is { field: string; fromValue: string | null; toValue: string | null } => Boolean(item));
  if (auditData.length) await prisma.findingAudit.createMany({ data: auditData.map((item) => ({ findingId: id, actorId: userId, ...item })) });
  if (parsed.data.acceptSuggestion && existing.requirementId && finding.suggestion) {
    await prisma.requirement.update({ where: { id: existing.requirementId }, data: { text: finding.suggestion } });
    await prisma.activityLog.create({ data: { userId, type: "ANALYSIS", title: "Accepted finding suggestion", message: finding.title } });
  }
  await prisma.activityLog.create({ data: { userId, type: "ANALYSIS", title: parsed.data.status === "RESOLVED" ? "Finding resolved" : "Finding updated", message: finding.title } });
  return NextResponse.json({ finding });
}
