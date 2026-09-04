import DashboardShell from "../../components/dashboard/DashboardShell";
import { requirePageAuth } from "../../lib/session";
import prisma from "../../lib/prisma";
import { ensureSupportArticles, supportCategories } from "../../lib/support";
import SupportPortal from "./SupportPortal";

export default async function HelpPage() {
  const session = await requirePageAuth();
  await ensureSupportArticles();
  const articles = await prisma.supportArticle.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" } });
  return (
    <DashboardShell user={session.user as { name?: string; role?: string; image?: string }}>
      <SupportPortal initialArticles={articles.map((article: { id: string; title: string; slug: string; category: string; kind: string; excerpt: string; content: string; createdAt: Date; updatedAt: Date }) => ({ ...article, createdAt: article.createdAt.toISOString(), updatedAt: article.updatedAt.toISOString() }))} categories={supportCategories} />
    </DashboardShell>
  );
}
