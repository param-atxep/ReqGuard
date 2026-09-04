import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";
import { getWorkspaceContext } from "../../../../lib/workspace";

type WorkspaceMemberRecord = {
  id: string;
  userId: string;
  role: string;
  createdAt: Date;
  lastActiveAt: Date | null;
  user: { id: string; fullName: string; username: string; email: string | null; image: string | null; jobTitle: string | null; department: string | null; location: string | null; phone: string | null; updatedAt: Date; settings: { bio: string | null; timezone: string; language: string; organization: string | null } | null };
};

export async function GET(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const workspaceId = new URL(req.url).searchParams.get("workspaceId");
  const context = await getWorkspaceContext(userId, workspaceId);
  if (!context) return NextResponse.json({ error: "WORKSPACE_NOT_FOUND" }, { status: 404 });
  const members: WorkspaceMemberRecord[] = await prisma.workspaceMember.findMany({
    where: { workspaceId: context.workspaceId },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    include: { user: { select: { id: true, fullName: true, username: true, email: true, image: true, jobTitle: true, department: true, location: true, phone: true, updatedAt: true, settings: { select: { bio: true, timezone: true, language: true, organization: true } } } } },
  });
  const memberData = await Promise.all(members.map(async (member) => {
    const [projects, activity] = await Promise.all([
      prisma.project.findMany({ where: { workspaceId: context.workspaceId, OR: [{ ownerId: member.userId }, { members: { some: { userId: member.userId } } }] }, select: { id: true, name: true }, orderBy: { updatedAt: "desc" }, take: 8 }),
      prisma.activityLog.findMany({ where: { userId: member.userId, workspaceId: context.workspaceId }, orderBy: { createdAt: "desc" }, take: 6, select: { id: true, title: true, createdAt: true } }),
    ]);
    return { ...member.user, bio: member.user.settings?.bio || null, timezone: member.user.settings?.timezone || "UTC", language: member.user.settings?.language || "en", organization: member.user.settings?.organization || null, membershipId: member.id, role: member.role, joinedAt: member.createdAt, lastActiveAt: member.lastActiveAt || activity[0]?.createdAt || member.user.updatedAt, projects, activity };
  }));
  return NextResponse.json({ workspace: context.workspace, currentRole: context.role, members: memberData });
}
