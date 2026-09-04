import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";

const passwordSchema = z.string().min(8).regex(/(?=.*[a-z])/, "Password needs a lowercase letter").regex(/(?=.*[A-Z])/, "Password needs an uppercase letter").regex(/(?=.*\d)/, "Password needs a number").regex(/(?=.*[^A-Za-z0-9])/, "Password needs a special character");
const changeSchema = z.object({ action: z.literal("change-password"), currentPassword: z.string().min(1), newPassword: passwordSchema });
const twoFactorSchema = z.object({ action: z.enum(["enable-2fa", "disable-2fa"]), currentPassword: z.string().min(1) });

async function currentUser() {
  const session = await getServerSession();
  const id = session?.user?.id as string | undefined;
  return id ? prisma.user.findUnique({
    where: { id },
    select: { id: true, password: true, emailVerified: true, passwordChangedAt: true, settings: { select: { twoFactor: true } } },
  }) : null;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const recoveryCodes = await prisma.recoveryCode.count({ where: { userId: user.id, usedAt: null } });
  return NextResponse.json({ twoFactor: user.settings?.twoFactor ?? false, recoveryCodes, emailVerified: Boolean(user.emailVerified), passwordChangedAt: user.passwordChangedAt });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await request.json();
  const parsed = body?.action === "change-password" ? changeSchema.safeParse(body) : twoFactorSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "INVALID_REQUEST" }, { status: 400 });
  if (!user.password || !(await bcrypt.compare(parsed.data.currentPassword, user.password))) return NextResponse.json({ error: "INVALID_PASSWORD" }, { status: 400 });

  if (parsed.data.action === "change-password") {
    const password = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password, passwordChangedAt: new Date() } }),
      prisma.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "disable-2fa") {
    await prisma.$transaction([
      prisma.userSettings.upsert({ where: { userId: user.id }, create: { userId: user.id, twoFactor: false }, update: { twoFactor: false, twoFactorSecretHash: null } }),
      prisma.recoveryCode.deleteMany({ where: { userId: user.id } }),
    ]);
    return NextResponse.json({ ok: true, enabled: false });
  }

  const secret = crypto.randomBytes(20).toString("base64url");
  const codes = Array.from({ length: 10 }, () => `${crypto.randomBytes(4).toString("hex")}-${crypto.randomBytes(4).toString("hex")}`);
  await prisma.$transaction(async (tx: any) => {
    await tx.userSettings.upsert({ where: { userId: user.id }, create: { userId: user.id, twoFactor: true, twoFactorSecretHash: await bcrypt.hash(secret, 12) }, update: { twoFactor: true, twoFactorSecretHash: await bcrypt.hash(secret, 12) } });
    await tx.recoveryCode.deleteMany({ where: { userId: user.id } });
    await tx.recoveryCode.createMany({ data: await Promise.all(codes.map(async code => ({ userId: user.id, codeHash: await bcrypt.hash(code, 12) }))) });
  });
  return NextResponse.json({ ok: true, enabled: true, secret, recoveryCodes: codes });
}
