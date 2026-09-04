import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";
import { snapshotCsv, snapshotDocx, snapshotPdf } from "../../../../lib/report-generator";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(req); const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params; const report = await prisma.report.findFirst({ where: { id, ownerId: userId } });
  if (!report) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const format = (new URL(req.url).searchParams.get("format") || "json").toLowerCase();
  const snapshot = report.snapshot as never;
  if (format === "csv") return new NextResponse(snapshotCsv(snapshot), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${report.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv"` } });
  if (format === "pdf") return new NextResponse(new Uint8Array(await snapshotPdf(snapshot)), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${report.name}.pdf"` } });
  if (format === "docx") return new NextResponse(new Uint8Array(await snapshotDocx(snapshot)), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": `attachment; filename="${report.name}.docx"` } });
  return NextResponse.json({ report });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(req); const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params; const report = await prisma.report.findFirst({ where: { id, ownerId: userId } });
  if (!report) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  await prisma.report.delete({ where: { id } }); return NextResponse.json({ ok: true });
}
