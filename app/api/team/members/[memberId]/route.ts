import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "../../../../../lib/session";
import { canManageWorkspace } from "../../../../../lib/workspace";
import { z } from "zod";

const schema = z.object({ role: z.enum(["OWNER", "ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"]) });

async function actor(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return null;
  const workspaceId = new URL(req.url).searchParams.get("workspaceId");
  return { userId, workspaceId };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ memberId: string }> }) {
  const current = await actor(req);
  if (!current) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { memberId } = await params;
  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId }, include: { user: { select: { id: true, fullName: true } } } });
  if (!target || (current.workspaceId && target.workspaceId !== current.workspaceId)) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const manager = await prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId: target.workspaceId, userId: current.userId } } });
  if (!manager || !canManageWorkspace(manager.role) || target.role === "OWNER" || target.userId === current.userId) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success || (parsed.data.role === "OWNER" && manager.role !== "OWNER") || (parsed.data.role === "ADMIN" && manager.role !== "OWNER")) return NextResponse.json({ error: "INVALID_ROLE" }, { status: 400 });
  if (parsed.data.role === "OWNER") {
    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.workspace.update({ where: { id: target.workspaceId }, data: { ownerId: target.userId } });
      await tx.workspaceMember.update({ where: { id: manager.id }, data: { role: "ADMIN" } });
      const promoted = await tx.workspaceMember.update({ where: { id: memberId }, data: { role: "OWNER" } });
      await tx.notification.create({ data: { userId: target.userId, workspaceId: target.workspaceId, category: "TEAM", title: "Ownership transferred", message: "You are now the workspace owner." } });
      await tx.notification.create({ data: { userId: current.userId, workspaceId: target.workspaceId, category: "TEAM", title: "Ownership transferred", message: `You transferred ownership to ${target.user.fullName}.` } });
      await tx.activityLog.create({ data: { userId: current.userId, workspaceId: target.workspaceId, type: "TEAM", title: "Workspace ownership transferred", message: target.user.fullName } });
      return promoted;
    });
    return NextResponse.json({ member: updated });
  }
  const updated = await prisma.workspaceMember.update({ where: { id: memberId }, data: { role: parsed.data.role } });
  await prisma.notification.create({ data: { userId: target.userId, workspaceId: target.workspaceId, category: "TEAM", title: "Your workspace role changed", message: `You are now a ${parsed.data.role.toLowerCase()}.` } });
  await prisma.activityLog.create({ data: { userId: current.userId, workspaceId: target.workspaceId, type: "TEAM", title: "Member role updated", message: target.user.fullName } });
  return NextResponse.json({ member: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ memberId: string }> }) {
  const current = await actor(req);
  if (!current) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { memberId } = await params;
  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId }, include: { user: { select: { id: true, fullName: true } } } });
  if (!target || (current.workspaceId && target.workspaceId !== current.workspaceId)) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const manager = await prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId: target.workspaceId, userId: current.userId } } });
  const selfLeaving = target.userId === current.userId;
  if (!manager || (!selfLeaving && !canManageWorkspace(manager.role)) || target.role === "OWNER") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await prisma.workspaceMember.delete({ where: { id: memberId } });
  await prisma.activityLog.create({ data: { userId: current.userId, workspaceId: target.workspaceId, type: "TEAM", title: selfLeaving ? "Left workspace" : "Removed workspace member", message: target.user.fullName } });
  return NextResponse.json({ ok: true });
}
