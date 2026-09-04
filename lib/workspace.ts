import prisma from "./prisma";

export const WORKSPACE_ROLES = ["OWNER", "ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"] as const;
export type WorkspaceRoleValue = (typeof WORKSPACE_ROLES)[number];

export function canManageWorkspace(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

export async function getWorkspaceContext(userId: string, workspaceId?: string | null) {
  if (workspaceId) {
    return prisma.workspaceMember.findFirst({
      where: { userId, workspaceId },
      include: { workspace: true },
    });
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { workspace: true },
  });
  if (membership) return membership;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, username: true } });
  if (!user) return null;
  const base = (user.username || user.fullName || "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "workspace";
  const workspace = await prisma.workspace.create({
    data: {
      name: `${user.fullName || user.username}'s workspace`,
      slug: `${base}-${Math.random().toString(36).slice(2, 8)}`,
      ownerId: userId,
      members: { create: { userId, role: "OWNER" } },
    },
  });
  return prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId: workspace.id, userId } }, include: { workspace: true } });
}

export async function workspaceIdForUser(userId: string, workspaceId?: string | null) {
  const context = await getWorkspaceContext(userId, workspaceId);
  return context?.workspaceId ?? null;
}
