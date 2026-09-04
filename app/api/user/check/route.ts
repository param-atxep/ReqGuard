import { NextResponse } from 'next/server';

let prisma: any = null;
try {
  prisma = require('../../../../lib/prisma').default;
} catch (e) {
  prisma = null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get('username');
    const email = url.searchParams.get('email');

    if (!username && !email) return NextResponse.json({ error: 'missing' }, { status: 400 });

    if (username) {
      const u = await prisma.user.findUnique({ where: { username } });
      return NextResponse.json({ exists: !!u });
    }
    if (email) {
      const u = await prisma.user.findUnique({ where: { email } });
      return NextResponse.json({ exists: !!u });
    }

    return NextResponse.json({ exists: false });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
