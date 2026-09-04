import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import prisma from "../../../lib/prisma";
import { getServerSession } from "../../../lib/session";
import { analyzeRequirements, categorizeRequirement, extractRequirements } from "../../../lib/analysis-engine";
import { analyzeRequirementIntelligence } from "../../../lib/ai/gemini";
import { calculateQualityScore } from "../../../lib/ai/quality-score";
import { rateLimit, requireSameOrigin } from "../../../lib/security";

export async function POST(req: Request) {
  const limited = rateLimit(req, "analysis-upload", 10, 60 * 60_000);
  if (limited) return limited;
  const csrf = requireSameOrigin(req);
  if (csrf) return csrf;
  const startedAt = Date.now();
  const session = await getServerSession(req);
  const ownerId = session?.user?.id as string | undefined;
  if (!ownerId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get("file");
  const projectId = String(formData.get("projectId") || "") || undefined;
  if (!(file instanceof File)) return NextResponse.json({ error: "A TXT, CSV, or JSON file is required" }, { status: 400 });
  if (!projectId) return NextResponse.json({ error: "Select a project before starting an analysis" }, { status: 400 });
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["txt", "csv", "json"].includes(extension)) return NextResponse.json({ error: "TXT, CSV, and JSON uploads are currently supported" }, { status: 415 });
  if (file.size > 20 * 1024 * 1024 || file.size === 0) return NextResponse.json({ error: file.size === 0 ? "The uploaded file is empty" : "Files must be smaller than 20 MB" }, { status: 400 });
  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  let text = await file.text();
  if (extension === "json") {
    try {
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed) ? parsed : parsed.requirements;
      if (!Array.isArray(items)) throw new Error("requirements array required");
      text = items.map((item) => typeof item === "string" ? item : item?.text || item?.statement || "").filter(Boolean).join("\n");
    } catch { return NextResponse.json({ error: "The JSON file must contain a requirements array" }, { status: 400 }); }
  } else if (extension === "csv") {
    text = text.split(/\r?\n/).slice(1).map((line) => line.split(",").slice(1).join(",") || line).join("\n");
  }
  const extracted = extractRequirements(text);
  if (!extracted.length) return NextResponse.json({ error: "No readable requirements were found in the file" }, { status: 422 });
  const storageDir = path.join(process.cwd(), ".data", "uploads", ownerId);
  await mkdir(storageDir, { recursive: true });
  const storageKey = path.join(".data", "uploads", ownerId, `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`);
  await writeFile(path.join(process.cwd(), storageKey), Buffer.from(await file.arrayBuffer()));
  const analysis = await prisma.analysis.create({ data: { ownerId, projectId, fileName: file.name, fileType: extension.toUpperCase(), storageKey, status: "PROCESSING", requirements: extracted.length, engineVersion: "2.0.0" } });
  try {
    const ai = await analyzeRequirementIntelligence(text);
    const sourceRequirements = ai?.requirements?.length ? ai.requirements.map((item) => ({ key: item.key, text: extracted.find((candidate) => candidate.key === item.key)?.text || item.explanation || item.key, ai: item })) : extracted.map((item) => ({ key: item.key, text: item.text, ai: null }));
    const requirements: Array<{ id: string; key: string; text: string }> = [];
    for (const item of sourceRequirements) {
      requirements.push(await prisma.requirement.create({ data: { analysisId: analysis.id, key: item.key, text: item.text, category: categorizeRequirement(item.text), aiType: item.ai?.type, aiExplanation: item.ai?.explanation, rewrite: item.ai?.rewrite, testability: item.ai?.testability, implementationNotes: item.ai?.implementationNotes } }));
    }
    const localFindings = analyzeRequirements(requirements);
    const findings = ai?.findings?.length ? ai.findings.map((item) => {
      const requirement = requirements.find((candidate) => candidate.key === item.requirementKey);
      const related = item.relatedRequirementKey ? requirements.find((candidate) => candidate.key === item.relatedRequirementKey) : undefined;
      return { requirementId: requirement?.id || requirements[0].id, relatedRequirementId: related?.id, type: item.category.toUpperCase().includes("DUPLIC") ? "DUPLICATE" : item.category.toUpperCase().includes("CONTRAD") ? "CONFLICT" : item.category.toUpperCase().includes("SECURITY") ? "CONSISTENCY" : "AMBIGUITY", severity: item.severity, confidence: Math.max(0, Math.min(1, item.confidence / 100)), title: item.title, description: item.description, suggestion: item.suggestedFix, whyItMatters: item.whyItMatters, businessImpact: item.businessImpact, testability: item.testability };
    }) : localFindings;
    for (const finding of findings) await prisma.finding.create({ data: { analysisId: analysis.id, requirementId: finding.requirementId, relatedRequirementId: "relatedRequirementId" in finding ? finding.relatedRequirementId : undefined, type: finding.type, severity: finding.severity, confidence: finding.confidence, title: finding.title, description: finding.description, suggestion: finding.suggestion, whyItMatters: "whyItMatters" in finding ? finding.whyItMatters : undefined, businessImpact: "businessImpact" in finding ? finding.businessImpact : undefined, testability: "testability" in finding ? finding.testability : undefined } });
    const quality = ai?.quality || { overall: calculateQualityScore(requirements.length, localFindings), completeness: 0, consistency: 0, verifiability: 0, security: 0, performance: 0, clarity: 0 };
    const completed = await prisma.analysis.update({ where: { id: analysis.id }, data: { status: "COMPLETED", requirements: requirements.length, issuesCount: findings.length, confidence: (quality.overall || 0) / 100, consistency: (quality.consistency || 0) / 100, aiModel: ai ? (process.env.GEMINI_MODEL || "gemini-2.5-flash") : "deterministic-fallback", summary: ai?.executiveSummary || `${requirements.length} requirements analyzed with ${findings.length} findings.`, aiSummary: ai ? { executiveSummary: ai.executiveSummary, projectSummary: ai.projectSummary } : undefined, aiRisks: ai?.risks, qualityBreakdown: quality, testCases: ai?.testCases, processingMs: Date.now() - startedAt } });
    await prisma.activityLog.createMany({ data: [{ userId: ownerId, type: "UPLOAD", title: "Requirements uploaded", message: file.name }, { userId: ownerId, type: "ANALYSIS", title: "AI analysis completed", message: `${findings.length} findings detected` }] });
    return NextResponse.json({ analysis: completed, requirementsCreated: requirements.length, findingsCreated: findings.length, qualityScore: quality.overall }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    await prisma.analysis.update({ where: { id: analysis.id }, data: { status: "FAILED", errorMessage: message, processingMs: Date.now() - startedAt } });
    console.error("Requirement intelligence analysis failed", error);
    return NextResponse.json({ error: "Analysis failed", analysisId: analysis.id }, { status: 502 });
  }
}
