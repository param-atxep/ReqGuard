import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";

export async function GET() {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const sessions = await prisma.session.findMany({
    where: { userId },
    select: { id: true, deviceName: true, deviceType: true, browser: true, os: true, ip: true, ipAddress: true, userAgent: true, createdAt: true, lastActiveAt: true, expires: true, revokedAt: true },
    orderBy: { lastActiveAt: "desc" },
  });
  return NextResponse.json({ sessions });
}

export async function DELETE(request: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (body?.all !== true) return NextResponse.json({ error: "CONFIRM_ALL_REQUIRED" }, { status: 400 });
  await prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
