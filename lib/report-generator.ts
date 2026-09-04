import PDFDocument from "pdfkit";
import { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from "docx";

export type ReportSnapshot = {
  name: string;
  analysis: { fileName: string; summary: string; quality: Record<string, number>; createdAt: string };
  severity: Record<string, number>;
  categories: Record<string, number>;
  requirements: { key: string; text: string; category: string; status: string; passed: boolean }[];
  findings: { title: string; type: string; severity: string; status: string; requirement: string; suggestion: string }[];
  recommendations: string[];
  audit: { actor: string; field: string; from: string; to: string; createdAt: string }[];
};

function lines(snapshot: ReportSnapshot) {
  const rows = [["Requirement", "Text", "Category", "Status", "Passed", "Finding", "Severity", "Finding Status"]];
  for (const requirement of snapshot.requirements) {
    const findings = snapshot.findings.filter((finding) => finding.requirement === requirement.key);
    if (!findings.length) rows.push([requirement.key, requirement.text, requirement.category, requirement.status, String(requirement.passed), "", "", ""]);
    else findings.forEach((finding) => rows.push([requirement.key, requirement.text, requirement.category, requirement.status, String(requirement.passed), finding.title, finding.severity, finding.status]));
  }
  return rows;
}

export function snapshotCsv(snapshot: ReportSnapshot) {
  return lines(snapshot).map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
}

export async function snapshotPdf(snapshot: ReportSnapshot) {
  const document = new PDFDocument({ margin: 48 });
  const chunks: Buffer[] = [];
  document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise<Buffer>((resolve) => document.on("end", () => resolve(Buffer.concat(chunks))));
  document.fontSize(22).text(snapshot.name).moveDown();
  document.fontSize(10).text(`Generated ${new Date().toLocaleString()}`).moveDown();
  document.fontSize(16).text("Executive Summary").moveDown(0.3).fontSize(10).text(snapshot.analysis.summary || "No executive summary available.").moveDown();
  document.fontSize(16).text("Quality Score").moveDown(0.3).fontSize(10).text(Object.entries(snapshot.analysis.quality).map(([key, value]) => `${key}: ${value}/100`).join("  ")).moveDown();
  document.fontSize(16).text("Severity Distribution").moveDown(0.3).fontSize(10).text(Object.entries(snapshot.severity).map(([key, value]) => `${key}: ${value}`).join("  ")).moveDown();
  document.fontSize(16).text("Requirement Statistics").moveDown(0.3).fontSize(10).text(`${snapshot.requirements.length} total; ${snapshot.requirements.filter((item) => item.passed).length} passed; ${snapshot.requirements.filter((item) => !item.passed).length} failed`).moveDown();
  document.fontSize(16).text("Findings").moveDown(0.3).fontSize(9);
  snapshot.findings.forEach((finding) => document.text(`${finding.severity} · ${finding.title} · ${finding.requirement}\n${finding.suggestion || "Review this finding."}`).moveDown(0.3));
  document.fontSize(16).text("Recommendations").moveDown(0.3).fontSize(10).list(snapshot.recommendations.length ? snapshot.recommendations : ["No additional recommendations."]).moveDown();
  document.fontSize(16).text("Audit History").moveDown(0.3).fontSize(9);
  snapshot.audit.forEach((entry) => document.text(`${entry.actor} changed ${entry.field} ${entry.from || "none"} → ${entry.to || "none"} (${new Date(entry.createdAt).toLocaleString()})`));
  document.end();
  return done;
}

export async function snapshotDocx(snapshot: ReportSnapshot) {
  const heading = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
  const document = new Document({ sections: [{ children: [
    new Paragraph({ children: [new TextRun({ text: snapshot.name, bold: true, size: 32 })] }),
    heading("Executive Summary"), new Paragraph(snapshot.analysis.summary || "No executive summary available."),
    heading("Quality Score"), new Paragraph(Object.entries(snapshot.analysis.quality).map(([key, value]) => `${key}: ${value}/100`).join(" | ")),
    heading("Severity Distribution"), new Paragraph(Object.entries(snapshot.severity).map(([key, value]) => `${key}: ${value}`).join(" | ")),
    heading("Requirement Statistics"), new Paragraph(`${snapshot.requirements.length} total; ${snapshot.requirements.filter((item) => item.passed).length} passed; ${snapshot.requirements.filter((item) => !item.passed).length} failed`),
    heading("Findings"), new Table({ rows: [["Severity", "Title", "Requirement", "Status"]].concat(snapshot.findings.map((item) => [item.severity, item.title, item.requirement, item.status])).map((row) => new TableRow({ children: row.map((cell) => new TableCell({ children: [new Paragraph(cell)] })) })) }),
    heading("Recommendations"), ...snapshot.recommendations.map((item) => new Paragraph({ text: item, bullet: { level: 0 } })),
    heading("Audit History"), ...snapshot.audit.map((entry) => new Paragraph(`${entry.actor} changed ${entry.field} ${entry.from || "none"} → ${entry.to || "none"} (${new Date(entry.createdAt).toLocaleString()})`)),
  ] }] });
  return Packer.toBuffer(document);
}
