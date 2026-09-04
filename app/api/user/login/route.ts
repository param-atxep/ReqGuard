import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import bcrypt from 'bcrypt';
import { rateLimit, requireSameOrigin, jsonError } from '../../../../lib/security';

export async function POST(req: Request) {
    const limited = rateLimit(req, "login", 8, 60_000);
    if (limited) return limited;
    const csrf = requireSameOrigin(req);
    if (csrf) return csrf;
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password) return NextResponse.json({ error: 'INVALID' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    // Note: This route only validates credentials. Session creation is handled by Auth.js. For full sign-in, use Auth.js endpoints.
    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
