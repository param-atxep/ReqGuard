import { NextResponse } from "next/server";
import { getServerSession } from "../../../../lib/session";

const answers = [
  { terms: ["upload", "file"], answer: "Open New analysis, select a project, and upload a TXT, CSV, or JSON file under 20 MB. JSON must contain a requirements array." },
  { terms: ["severity", "critical", "high"], answer: "Critical findings are blocking conflicts or serious ambiguity. High can affect behavior or scope; Medium needs review; Low is informational." },
  { terms: ["report", "finding"], answer: "Reports connect each finding to its requirement, type, severity, confidence, and suggestion. Use Issues filters to focus your review." },
  { terms: ["workspace", "team", "invite"], answer: "Use Team to invite members and manage workspace roles. If access looks wrong, ask an administrator to review membership." },
];

export async function POST(req: Request) {
  const session = await getServerSession(req);
  if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });
  const normalized = message.toLowerCase();
  const match = answers.find((item) => item.terms.some((term) => normalized.includes(term)));
  return NextResponse.json({ answer: match?.answer || "I can help with uploads, analyses, reports, severity, team access, and workspace troubleshooting. Try asking about one of those topics, or create a support ticket for a human reply." });
}
