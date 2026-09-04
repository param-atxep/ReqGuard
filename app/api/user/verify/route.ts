import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { rateLimit, requireSameOrigin, jsonError } from '../../../../lib/security';

export async function POST(req: Request) {
  try {
    const limited = rateLimit(req, "verify-email", 10, 60 * 60_000);
    if (limited) return limited;
    const csrf = requireSameOrigin(req);
    if (csrf) return csrf;
    const { token, email } = await req.json();
    if (!token || !email) return NextResponse.json({ error: 'INVALID' }, { status: 400 });

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const record = await prisma.verificationToken.findFirst({ where: { identifier: normalizedEmail, used: false, type: 'EMAIL_VERIFICATION', expires: { gt: new Date() } }, orderBy: { expires: 'desc' } });
    if (!record) return NextResponse.json({ error: 'INVALID_OR_EXPIRED' }, { status: 400 });

    const match = await bcrypt.compare(token, record.hashedToken);
    if (!match) return NextResponse.json({ error: 'INVALID' }, { status: 400 });

    // mark used and set user's emailVerified
    await prisma.$transaction([
      prisma.verificationToken.updateMany({ where: { identifier: normalizedEmail, type: 'EMAIL_VERIFICATION', used: false }, data: { used: true } }),
      prisma.user.update({ where: { email: normalizedEmail }, data: { emailVerified: new Date() } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
