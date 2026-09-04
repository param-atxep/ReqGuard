import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "../../../../../lib/prisma";
import { getServerSession } from "../../../../../lib/session";

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
const schema = z.object({ action: z.enum(["accept", "decline"]) });

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  const email = session?.user?.email?.toLowerCase();
  if (!userId || !email) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "ACTION_REQUIRED" }, { status: 400 });
  const { token } = await params;
  const invitation = await prisma.workspaceInvitation.findUnique({ where: { tokenHash: hashToken(token) }, include: { workspace: true } });
  if (!invitation || invitation.status !== "PENDING") return NextResponse.json({ error: "INVITATION_NOT_AVAILABLE" }, { status: 404 });
  if (invitation.expiresAt <= new Date()) {
    await prisma.workspaceInvitation.update({ where: { id: invitation.id }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "INVITATION_EXPIRED" }, { status: 410 });
  }
  if (invitation.email !== email) return NextResponse.json({ error: "INVITATION_EMAIL_MISMATCH" }, { status: 403 });
  if (parsed.data.action === "decline") {
    await prisma.workspaceInvitation.update({ where: { id: invitation.id }, data: { status: "DECLINED", recipientId: userId } });
    await prisma.notification.create({ data: { userId: invitation.invitedById, workspaceId: invitation.workspaceId, category: "TEAM", title: "Invitation declined", message: `${email} declined your workspace invitation.` } });
    return NextResponse.json({ ok: true, status: "DECLINED" });
  }
  await prisma.$transaction([
    prisma.workspaceMember.upsert({ where: { workspaceId_userId: { workspaceId: invitation.workspaceId, userId } }, create: { workspaceId: invitation.workspaceId, userId, role: invitation.role }, update: { role: invitation.role } }),
    prisma.workspaceInvitation.update({ where: { id: invitation.id }, data: { status: "ACCEPTED", recipientId: userId } }),
    prisma.notification.create({ data: { userId, workspaceId: invitation.workspaceId, category: "TEAM", title: `Joined ${invitation.workspace.name}`, message: "You now have access to the workspace." } }),
    prisma.notification.create({ data: { userId: invitation.invitedById, workspaceId: invitation.workspaceId, category: "TEAM", title: "Invitation accepted", message: `${email} joined your workspace.` } }),
    prisma.activityLog.create({ data: { userId, workspaceId: invitation.workspaceId, type: "TEAM", title: "Joined workspace", message: invitation.workspace.name } }),
  ]);
  return NextResponse.json({ ok: true, status: "ACCEPTED", workspaceId: invitation.workspaceId });
}
