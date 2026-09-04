import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { ensureSupportArticles } from "../../../../lib/support";
import { getServerSession } from "../../../../lib/session";

export async function GET(req: Request) {
  const session = await getServerSession(req);
  if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  await ensureSupportArticles();
  const query = new URL(req.url).searchParams;
  const search = query.get("q")?.trim();
  const category = query.get("category");
  const articles = await prisma.supportArticle.findMany({
    where: { published: true, ...(category && category !== "All" ? { category } : {}), ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { excerpt: { contains: search, mode: "insensitive" } }, { content: { contains: search, mode: "insensitive" } }] } : {}) },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { feedback: true } } },
  });
  return NextResponse.json({ articles });
}
