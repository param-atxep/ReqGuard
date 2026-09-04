import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "../../../../../lib/session";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const schema = z.object({ decision: z.enum(["APPROVED", "REJECTED", "CHANGES_REQUESTED"]), comment: z.string().trim().max(4000).optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid review decision" }, { status: 400 });
  const requirement = await prisma.requirement.findFirst({ where: { id, analysis: { ownerId: userId } } });
  if (!requirement) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const status = parsed.data.decision === "APPROVED" ? "APPROVED" : parsed.data.decision === "REJECTED" ? "REJECTED" : "DRAFT";
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const approval = await tx.requirementApproval.create({ data: { requirementId: id, reviewerId: userId, decision: parsed.data.decision, comment: parsed.data.comment } });
    const updated = await tx.requirement.update({ where: { id }, data: { status } });
    await tx.requirementVersion.create({ data: { requirementId: id, createdById: userId, version: updated.version + 1, text: updated.text, status: updated.status, changeSummary: parsed.data.decision.replace("_", " ").toLowerCase() } });
    await tx.requirement.update({ where: { id }, data: { version: updated.version + 1 } });
    return { approval, updated };
  });
  await prisma.activityLog.create({ data: { userId, type: "ANALYSIS", title: `${requirement.key} ${parsed.data.decision.replace("_", " ").toLowerCase()}`, message: parsed.data.comment } });
  return NextResponse.json(result, { status: 201 });
}
