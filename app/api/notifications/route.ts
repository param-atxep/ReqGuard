import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSession } from "../../../lib/session";

export async function GET(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const params = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(Number(params.get("limit") || 25), 1), 50);
  const cursor = params.get("cursor");
  const notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: limit + 1, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) });
  const nextCursor = notifications.length > limit ? notifications.pop()?.id || null : null;
  const unreadCount = await prisma.notification.count({ where: { userId, readAt: null } });
  return NextResponse.json({ notifications, unreadCount, nextCursor });
}

export async function PATCH(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json() as { id?: string; all?: boolean };
  if (body.all) await prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  else if (body.id) await prisma.notification.updateMany({ where: { id: body.id, userId }, data: { readAt: new Date() } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json() as { id?: string };
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const deleted = await prisma.notification.deleteMany({ where: { id: body.id, userId } });
  if (!deleted.count) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
