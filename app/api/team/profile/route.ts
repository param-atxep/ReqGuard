import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";
import { getWorkspaceContext } from "../../../../lib/workspace";

const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  username: z.string().trim().min(2).max(50).regex(/^[a-zA-Z0-9_.-]+$/).optional(),
  jobTitle: z.string().trim().max(120).nullable().optional(),
  department: z.string().trim().max(120).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const context = await getWorkspaceContext(userId, new URL(req.url).searchParams.get("workspaceId"));
  if (!context) return NextResponse.json({ error: "WORKSPACE_NOT_FOUND" }, { status: 404 });
  const [user, projects, activity] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, fullName: true, username: true, email: true, image: true, jobTitle: true, department: true, location: true, phone: true } }),
    prisma.project.findMany({ where: { workspaceId: context.workspaceId, OR: [{ ownerId: userId }, { members: { some: { userId } } }] }, select: { id: true, name: true, status: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 12 }),
    prisma.activityLog.findMany({ where: { userId, workspaceId: context.workspaceId }, orderBy: { createdAt: "desc" }, take: 12, select: { id: true, type: true, title: true, message: true, createdAt: true } }),
  ]);
  const settings = await prisma.userSettings.findUnique({ where: { userId }, select: { bio: true, timezone: true, language: true } });
  return NextResponse.json({ profile: { ...user, bio: settings?.bio || null, timezone: settings?.timezone || "UTC", language: settings?.language || "en", organization: settings?.organization || null }, role: context.role, workspace: context.workspace, projects, activity });
}

export async function PATCH(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = profileSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "INVALID_REQUEST" }, { status: 400 });
  try {
    const { bio, ...userData } = parsed.data;
    const user = await prisma.user.update({ where: { id: userId }, data: userData, select: { id: true, fullName: true, username: true, email: true, image: true, jobTitle: true, department: true, location: true, phone: true } });
    if (bio !== undefined) await prisma.userSettings.upsert({ where: { userId }, create: { userId, bio }, update: { bio } });
    await prisma.activityLog.create({ data: { userId, type: "SETTINGS", title: "Profile updated" } });
    return NextResponse.json({ profile: { ...user, bio: bio ?? null } });
  } catch (error: any) {
    if (error?.code === "P2002") return NextResponse.json({ error: "USERNAME_TAKEN" }, { status: 409 });
    throw error;
  }
}
