import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "../../../lib/session";
import type { ReportSnapshot } from "../../../lib/report-generator";

export async function POST(req: Request) {
  const session = await getServerSession(req);
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json() as { analysisId?: string; name?: string };
  if (!body.analysisId) return NextResponse.json({ error: "analysisId is required" }, { status: 400 });
  const analysis = await prisma.analysis.findFirst({ where: { id: body.analysisId, ownerId: userId, status: "COMPLETED" }, include: { project: true, requirementsData: true, findings: { include: { requirement: true, audits: { include: { actor: { select: { fullName: true, username: true } } } } } } } });
  if (!analysis) return NextResponse.json({ error: "Completed analysis not found" }, { status: 404 });
  const severity: Record<string, number> = {}; const categories: Record<string, number> = {}; const audit: ReportSnapshot["audit"] = [];
  const findingsData = analysis.findings as Array<{ title: string; type: string; severity: string; status: string; suggestion: string | null; requirement: { key: string } | null; audits: Array<{ field: string; fromValue: string | null; toValue: string | null; createdAt: Date; actor: { fullName: string; username: string } }> }>;
  const requirementsData = analysis.requirementsData as Array<{ id: string; key: string; text: string; category: string | null; aiType: string | null; status: string }>;
  findingsData.forEach((finding) => { severity[finding.severity] = (severity[finding.severity] || 0) + 1; finding.audits.forEach((entry) => audit.push({ actor: entry.actor.fullName || entry.actor.username, field: entry.field, from: entry.fromValue || "", to: entry.toValue || "", createdAt: entry.createdAt.toISOString() })); });
  requirementsData.forEach((requirement) => { const category = requirement.category || requirement.aiType || "Uncategorized"; categories[category] = (categories[category] || 0) + 1; });
  const findings = findingsData.map((finding) => ({ title: finding.title, type: finding.type, severity: finding.severity, status: finding.status, requirement: finding.requirement?.key || "General", suggestion: finding.suggestion || "" }));
  const snapshot: ReportSnapshot = { name: body.name?.trim() || `${analysis.fileName} report`, analysis: { fileName: analysis.fileName, summary: analysis.summary || "", quality: (analysis.qualityBreakdown as Record<string, number> | null) || { overall: Math.round((analysis.confidence || 0) * 100) }, createdAt: analysis.createdAt.toISOString() }, severity, categories, requirements: requirementsData.map((requirement) => ({ key: requirement.key, text: requirement.text, category: requirement.category || requirement.aiType || "Uncategorized", status: requirement.status, passed: !findingsData.some((finding) => finding.requirement?.key === requirement.key && finding.status !== "RESOLVED" && finding.status !== "CLOSED") })), findings, recommendations: findings.filter((finding) => finding.suggestion).map((finding) => finding.suggestion), audit: audit.sort((left, right) => right.createdAt.localeCompare(left.createdAt)) };
  const previous = await prisma.report.findFirst({ where: { ownerId: userId, analysisId: analysis.id }, orderBy: { version: "desc" } });
  const report = await prisma.report.create({ data: { ownerId: userId, analysisId: analysis.id, projectId: analysis.projectId, name: snapshot.name, version: (previous?.version || 0) + 1, format: "ALL", snapshot } });
  await prisma.activityLog.create({ data: { userId, type: "REPORT", title: `Generated report for ${analysis.fileName}`, metadata: { reportId: report.id, analysisId: analysis.id, version: report.version } } });
  return NextResponse.json({ report }, { status: 201 });
}
