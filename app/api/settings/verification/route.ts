import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";
import { sendVerificationEmail } from "../../../../lib/mail";

export async function POST() {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, emailVerified: true } });
  if (!user?.email) return NextResponse.json({ error: "EMAIL_REQUIRED" }, { status: 400 });
  if (user.emailVerified) return NextResponse.json({ error: "ALREADY_VERIFIED" }, { status: 400 });
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({ data: { token: crypto.randomUUID(), hashedToken: await bcrypt.hash(token, 12), type: "EMAIL_VERIFICATION", identifier: user.email, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
  try {
    await sendVerificationEmail(user.email, token);
  } catch {
    return NextResponse.json({ error: "VERIFICATION_DELIVERY_FAILED" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
