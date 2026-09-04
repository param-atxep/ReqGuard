import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "../../../../../lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const requirement = await prisma.requirement.findFirst({ where: { id, analysis: { ownerId: userId } } });
  if (!requirement) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const versions = await prisma.requirementVersion.findMany({
    where: { requirementId: id },
    orderBy: { version: "desc" },
    include: { createdBy: { select: { id: true, fullName: true, username: true, image: true } } },
  });
  return NextResponse.json({ versions });
}
