import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { signupSchema } from '../../../../lib/validations';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendVerificationEmail } from '../../../../lib/mail';
import { rateLimit, requireSameOrigin, jsonError } from '../../../../lib/security';

export async function POST(req: Request) {
  try {
    const limited = rateLimit(req, "register", 5, 60 * 60_000);
    if (limited) return limited;
    const csrf = requireSameOrigin(req);
    if (csrf) return csrf;
    const body = await req.json();
    const parsed = signupSchema.parse(body);
    const email = parsed.email.trim().toLowerCase();

    // uniqueness checks
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { username: parsed.username }] } });
    if (existingUser) {
      if (existingUser.email === email) return NextResponse.json({ error: 'EMAIL_EXISTS' }, { status: 409 });
      return NextResponse.json({ error: 'USERNAME_TAKEN' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(parsed.password, 12);
    const user = await prisma.user.create({ data: { fullName: parsed.fullName, username: parsed.username, email, password: hashed } });

    // create verification token (256-bit -> 32 bytes hex)
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 12);
    await prisma.verificationToken.create({ data: { token: crypto.randomUUID(), hashedToken, type: 'EMAIL_VERIFICATION', identifier: email, expires: new Date(Date.now() + 24 * 3600 * 1000) } });

    // send email
    try {
      await sendVerificationEmail(email, token);
    } catch (e) {
      // log but don't expose internals
      console.error('email send failed', e);
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
