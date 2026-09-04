import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "../../../lib/session";
import { z } from "zod";
import { isSafeImageValue } from "../../../lib/settings-security";

const schema = z.object({
  fullName: z.string().trim().min(3).max(50).optional(),
  username: z.string().trim().min(3).max(30).regex(/^[a-z0-9_-]+$/).optional(),
  firstName: z.string().trim().max(80).nullable().optional(),
  lastName: z.string().trim().max(80).nullable().optional(),
  displayName: z.string().trim().max(100).nullable().optional(),
  jobTitle: z.string().trim().max(120).nullable().optional(),
  department: z.string().trim().max(120).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  website: z.string().url().max(2048).nullable().optional(),
  image: z.string().max(2_000_000).nullable().refine(value => value === null || isSafeImageValue(value), "Invalid profile image").optional(),
  coverImage: z.string().max(2_000_000).nullable().refine(value => value === null || isSafeImageValue(value), "Invalid cover image").optional(),
  bio: z.string().max(500).nullable().optional(),
  organization: z.string().max(120).nullable().optional(),
  timezone: z.string().max(80).optional(),
  language: z.string().max(20).optional(),
  emailAlerts: z.boolean().optional(),
  pushAlerts: z.boolean().optional(),
  analysisAlerts: z.boolean().optional(),
  reportAlerts: z.boolean().optional(),
  twoFactor: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  emailAnalysisComplete: z.boolean().optional(),
  emailNewMember: z.boolean().optional(),
  emailWeeklyReport: z.boolean().optional(),
  emailSecurityAlerts: z.boolean().optional(),
  pushMentions: z.boolean().optional(),
  pushComments: z.boolean().optional(),
  pushReports: z.boolean().optional(),
  theme: z.enum(["system", "light", "dark"]).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  dateFormat: z.string().max(40).optional(),
  weekStartsOn: z.number().int().min(0).max(6).optional(),
  profileVisibility: z.enum(["public", "team", "private"]).optional(),
  showActivity: z.boolean().optional(),
  workspaceName: z.string().trim().min(2).max(80).optional(),
  workspaceSlug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
});

async function currentUser() {
  const session = await getServerSession();
  return session?.user?.id as string | undefined;
}

export async function GET() {
  const userId = await currentUser();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const [user, settings, membership, apiKeys] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { fullName: true, username: true, email: true, emailVerified: true, image: true, coverImage: true, website: true, firstName: true, lastName: true, displayName: true, jobTitle: true, department: true, location: true, phone: true, passwordChangedAt: true, lastLoginAt: true } }),
    prisma.userSettings.findUnique({ where: { userId } }),
    prisma.workspaceMember.findFirst({ where: { userId }, include: { workspace: { select: { id: true, name: true, slug: true, logoUrl: true } } }, orderBy: { createdAt: "asc" } }),
    prisma.apiKey.findMany({ where: { userId }, select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, revokedAt: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
  ]);
  return NextResponse.json({ user, settings, workspace: membership ? { ...membership.workspace, role: membership.role } : null, apiKeys });
}

export async function PATCH(req: Request) {
  const userId = await currentUser();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "INVALID_REQUEST" }, { status: 400 });
  try {
    const { fullName, username, firstName, lastName, displayName, jobTitle, department, location, phone, website, image, coverImage, workspaceName, workspaceSlug, ...settings } = parsed.data;
    const userData = Object.fromEntries(Object.entries({ fullName, username, firstName, lastName, displayName, jobTitle, department, location, phone, website, image, coverImage }).filter(([, value]) => value !== undefined));
    const result = await prisma.$transaction(async (tx: any) => {
      const user = Object.keys(userData).length
        ? await tx.user.update({ where: { id: userId }, data: userData, select: { fullName: true, username: true, email: true, emailVerified: true, image: true, coverImage: true, website: true, firstName: true, lastName: true, displayName: true, jobTitle: true, department: true, location: true, phone: true } })
        : await tx.user.findUnique({ where: { id: userId }, select: { fullName: true, username: true, email: true, emailVerified: true, image: true, coverImage: true, website: true, firstName: true, lastName: true, displayName: true, jobTitle: true, department: true, location: true, phone: true } });
      const saved = Object.keys(settings).length ? await tx.userSettings.upsert({ where: { userId }, create: { userId, ...settings }, update: settings }) : await tx.userSettings.findUnique({ where: { userId } });
      let workspace = null;
      if (workspaceName !== undefined || workspaceSlug !== undefined) {
        const membership = await tx.workspaceMember.findFirst({ where: { userId }, select: { workspaceId: true, role: true } });
        if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) throw new Error("FORBIDDEN");
        workspace = await tx.workspace.update({ where: { id: membership.workspaceId }, data: { ...(workspaceName !== undefined ? { name: workspaceName } : {}), ...(workspaceSlug !== undefined ? { slug: workspaceSlug } : {}) }, select: { id: true, name: true, slug: true, logoUrl: true } });
      }
      await tx.activityLog.create({ data: { userId, type: "SETTINGS", title: "Settings updated" } });
      return { user, settings: saved, workspace };
    });
    return NextResponse.json(result);
  } catch (error: any) {
    if (error?.message === "FORBIDDEN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    if (error?.code === "P2002") return NextResponse.json({ error: "USERNAME_OR_WORKSPACE_SLUG_TAKEN" }, { status: 409 });
    return NextResponse.json({ error: "Unable to save settings" }, { status: 500 });
  }
}
