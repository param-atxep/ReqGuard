import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";
import { canManageWorkspace, getWorkspaceContext } from "../../../../lib/workspace";
import { sendWorkspaceInvitationEmail } from "../../../../lib/mail";

const createSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"]).default("DEVELOPER"),
  message: z.string().trim().max(1000).optional(),
  workspaceId: z.string().optional(),
});

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export async function GET(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const params = new URL(req.url).searchParams;
  const context = await getWorkspaceContext(userId, params.get("workspaceId"));
  if (!context) return NextResponse.json({ error: "WORKSPACE_NOT_FOUND" }, { status: 404 });
  await prisma.workspaceInvitation.updateMany({ where: { OR: [{ workspaceId: context.workspaceId }, { recipientId: userId }], status: "PENDING", expiresAt: { lt: new Date() } }, data: { status: "EXPIRED" } });
  const [sent, received] = await Promise.all([
    canManageWorkspace(context.role) ? prisma.workspaceInvitation.findMany({ where: { workspaceId: context.workspaceId }, orderBy: { createdAt: "desc" }, include: { invitedBy: { select: { fullName: true, email: true } } } }) : Promise.resolve([]),
    prisma.workspaceInvitation.findMany({ where: { recipientId: userId, status: "PENDING" }, orderBy: { createdAt: "desc" }, include: { workspace: { select: { id: true, name: true, logoUrl: true } }, invitedBy: { select: { fullName: true, email: true } } } }),
  ]);
  return NextResponse.json({ invitations: sent, received });
}

export async function POST(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "INVALID_REQUEST" }, { status: 400 });
  const context = await getWorkspaceContext(userId, parsed.data.workspaceId);
  if (!context || !canManageWorkspace(context.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (context.role === "ADMIN" && parsed.data.role !== "DEVELOPER") return NextResponse.json({ error: "ADMINS_CAN_ONLY_INVITE_DEVELOPERS" }, { status: 403 });
  if (parsed.data.role === "ADMIN" && context.role !== "OWNER") return NextResponse.json({ error: "ONLY_OWNER_CAN_GRANT_ADMIN" }, { status: 403 });
  const email = parsed.data.email.toLowerCase();
  const recipient = await prisma.user.findUnique({ where: { email }, select: { id: true, fullName: true } });
  if (recipient) {
    const member = await prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId: context.workspaceId, userId: recipient.id } } });
    if (member) return NextResponse.json({ error: "ALREADY_MEMBER" }, { status: 409 });
  }
  const pending = await prisma.workspaceInvitation.findFirst({ where: { workspaceId: context.workspaceId, email, status: "PENDING" } });
  if (pending) return NextResponse.json({ error: "INVITATION_ALREADY_SENT", invitation: pending }, { status: 409 });
  const token = crypto.randomBytes(32).toString("hex");
  const invitation = await prisma.workspaceInvitation.create({
    data: { workspaceId: context.workspaceId, email, role: parsed.data.role, message: parsed.data.message || null, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), invitedById: userId, recipientId: recipient?.id },
    include: { workspace: { select: { name: true } } },
  });
  await sendWorkspaceInvitationEmail(email, token, invitation.workspace.name, invitation.role, invitation.message);
  await prisma.activityLog.create({ data: { userId, workspaceId: context.workspaceId, type: "TEAM", title: "Invitation sent", message: email } });
  return NextResponse.json({ invitation: { id: invitation.id, email, role: invitation.role, status: invitation.status, expiresAt: invitation.expiresAt }, token: process.env.NODE_ENV !== "production" ? token : undefined }, { status: 201 });
}
