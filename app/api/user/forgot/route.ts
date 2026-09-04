import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { forgotSchema } from '../../../../lib/validations';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendPasswordResetEmail } from '../../../../lib/mail';
import { rateLimit, requireSameOrigin, jsonError } from '../../../../lib/security';

export async function POST(req: Request) {
  try {
    const limited = rateLimit(req, "forgot-password", 5, 60 * 60_000);
    if (limited) return limited;
    const csrf = requireSameOrigin(req);
    if (csrf) return csrf;
    const body = await req.json();
    const parsed = forgotSchema.parse(body);
    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user) return NextResponse.json({ ok: true }); // don't reveal

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 12);
    await prisma.verificationToken.create({ data: { token: crypto.randomUUID(), hashedToken, type: 'PASSWORD_RESET', identifier: parsed.email, expires: new Date(Date.now() + 60 * 60 * 1000) } });

    try {
      await sendPasswordResetEmail(parsed.email, token);
    } catch (e) {
      console.error('password email error', e);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
