import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "../../../lib/session";
import { z } from "zod";

const requirementSchema = z.object({
  analysisId: z.string().min(1),
  key: z.string().trim().min(1).max(40).optional(),
  text: z.string().trim().min(8).max(5000),
  category: z.string().trim().max(80).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

async function authenticatedUser() {
  const session = await getServerSession();
  return session?.user?.id as string | undefined;
}

export async function GET(req: Request) {
  const userId = await authenticatedUser();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const analysisId = new URL(req.url).searchParams.get("analysisId");
  if (!analysisId) return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
  const analysis = await prisma.analysis.findFirst({ where: { id: analysisId, ownerId: userId } });
  if (!analysis) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ requirements: await prisma.requirement.findMany({ where: { analysisId }, orderBy: { key: "asc" }, include: { findings: true } }) });
}

export async function POST(req: Request) {
  const userId = await authenticatedUser();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = requirementSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "INVALID_REQUEST" }, { status: 400 });
  const analysis = await prisma.analysis.findFirst({ where: { id: parsed.data.analysisId, ownerId: userId } });
  if (!analysis) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const count = await prisma.requirement.count({ where: { analysisId: analysis.id } });
  const requirement = await prisma.requirement.create({ data: { analysisId: analysis.id, key: parsed.data.key || `REQ-${String(count + 1).padStart(3, "0")}`, text: parsed.data.text, category: parsed.data.category, priority: parsed.data.priority || "MEDIUM", ownerId: userId, versions: { create: { createdById: userId, version: 1, text: parsed.data.text, status: "DRAFT", changeSummary: "Created" } } } });
  await prisma.activityLog.create({ data: { userId, type: "ANALYSIS", title: `Requirement ${requirement.key} created`, message: requirement.text } });
  return NextResponse.json({ requirement }, { status: 201 });
}
