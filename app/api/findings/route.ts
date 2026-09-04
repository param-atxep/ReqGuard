import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "../../../lib/session";

export async function GET(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const params = new URL(req.url).searchParams;
  const projectId = params.get("projectId");
  if (!projectId) return NextResponse.json({ findings: [], requiresProject: true });
  const severity = params.get("severity") || undefined;
  const status = params.get("status") || undefined;
  const category = params.get("category") || undefined;
  const assigneeId = params.get("assigneeId") || undefined;
  const from = params.get("from");
  const to = params.get("to");
  const findings = await prisma.finding.findMany({ where: { analysis: { ownerId: userId, projectId }, ...(severity ? { severity: severity as never } : {}), ...(status ? { status: status as never } : {}), ...(category ? { type: category as never } : {}), ...(assigneeId ? { assigneeId } : {}), ...((from || to) ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}) }, include: { requirement: true, assignee: true, analysis: { select: { owner: { select: { id: true, fullName: true, username: true } } } }, comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, fullName: true, username: true } } } }, audits: { orderBy: { createdAt: "desc" }, include: { actor: { select: { fullName: true, username: true } } } } }, orderBy: { updatedAt: "desc" }, take: 100 });
  return NextResponse.json({ findings });
}
