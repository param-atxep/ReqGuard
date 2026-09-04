import prisma from "./prisma";

export const supportCategories = ["Getting Started", "Analysis", "Team", "Reports", "Billing", "Security"];

const starterArticles = [
  ["Upload your first requirements file", "Getting Started", "article", "Start an analysis in minutes.", "Open New analysis, choose a project, and upload a TXT, CSV, or JSON file. ReqGuard extracts readable requirements, runs deterministic checks, and saves findings and the quality score to the selected project."],
  ["How severity works", "Analysis", "faq", "Understand Low, Medium, High, and Critical findings.", "Severity reflects potential delivery impact: Low is informational, Medium needs review, High can affect behavior or scope, and Critical indicates a blocking conflict or serious ambiguity. Review the suggested action before changing the source requirement."],
  ["Reading an analysis report", "Reports", "documentation", "Find the signal in your quality report.", "Reports connect each finding to its requirement, type, severity, confidence, and suggestion. Filter Issues by severity or status, then export or share the report from Reports when your review is complete."],
  ["Invite and manage teammates", "Team", "tutorial", "Collaborate without losing auditability.", "Open Team to invite members and assign workspace roles. Keep ownership and access current, and use project membership to limit who can work with a project."],
  ["Troubleshoot a failed upload", "Getting Started", "faq", "Resolve the most common upload issues.", "Use TXT, CSV, or JSON files smaller than 20 MB. CSV files should include a header and a requirement column. JSON must contain a requirements array. If the file is valid but no requirements are detected, contact support with the project and file name."],
  ["Workspace security basics", "Security", "documentation", "Keep requirement data protected.", "Use least-privilege workspace roles, review team membership regularly, and avoid placing credentials or secrets in requirement files. Contact an administrator if you see unexpected access."],
  ["Plans and billing", "Billing", "faq", "Where to get help with your plan.", "Billing questions are handled by the workspace owner. Include your workspace name and invoice date in a support ticket so the team can respond quickly."],
];

export async function ensureSupportArticles() {
  const count = await prisma.supportArticle.count();
  if (count > 0) return;
  await prisma.supportArticle.createMany({
    data: starterArticles.map(([title, category, kind, excerpt, content]) => ({
      title, category, kind, excerpt, content,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    })),
  });
}
