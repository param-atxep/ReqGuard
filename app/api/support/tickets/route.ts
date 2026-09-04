import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";

export async function GET(req: Request) {
  const session = await getServerSession(req);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const tickets = await prisma.supportTicket.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, include: { conversation: { include: { messages: { orderBy: { createdAt: "asc" } } } } } });
  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const session = await getServerSession(req);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json();
  if (!body.subject?.trim() || !body.description?.trim() || !body.category) return NextResponse.json({ error: "Subject, category, and description are required" }, { status: 400 });
  const ticket = await prisma.supportTicket.create({ data: { userId, subject: body.subject.trim(), category: body.category, priority: body.priority || "NORMAL", description: body.description.trim(), attachment: body.attachment || null, conversation: { create: { messages: { create: { senderId: userId, body: body.description.trim() } } } } }, include: { conversation: true } });
  return NextResponse.json({ ticket }, { status: 201 });
}
