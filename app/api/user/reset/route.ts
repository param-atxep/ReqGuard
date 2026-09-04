import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { resetSchema } from '../../../../lib/validations';
import bcrypt from 'bcrypt';
import { rateLimit, requireSameOrigin, jsonError } from '../../../../lib/security';

export async function POST(req: Request) {
  try {
    const limited = rateLimit(req, "reset-password", 5, 60 * 60_000);
    if (limited) return limited;
    const csrf = requireSameOrigin(req);
    if (csrf) return csrf;
    const { token, email, password, confirmPassword } = await req.json();
    const parsed = resetSchema.parse({ password, confirmPassword });

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const record = await prisma.verificationToken.findFirst({ where: { identifier: normalizedEmail, used: false, type: 'PASSWORD_RESET', expires: { gt: new Date() } }, orderBy: { expires: 'desc' } });
    if (!record) return NextResponse.json({ error: 'INVALID_OR_EXPIRED' }, { status: 400 });

    const match = await bcrypt.compare(token, record.hashedToken);
    if (!match) return NextResponse.json({ error: 'INVALID' }, { status: 400 });

    const newHashed = await bcrypt.hash(parsed.password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { email: normalizedEmail }, data: { password: newHashed, passwordChangedAt: new Date() } }),
      prisma.verificationToken.updateMany({ where: { identifier: normalizedEmail, type: 'PASSWORD_RESET', used: false }, data: { used: true } }),
      prisma.session.updateMany({ where: { user: { email: normalizedEmail }, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
