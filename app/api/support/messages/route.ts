import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";

export async function POST(req: Request) {
  const session = await getServerSession(req);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { ticketId, body } = await req.json();
  if (!ticketId || !body?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });
  const ticket = await prisma.supportTicket.findFirst({ where: { id: ticketId, userId }, include: { conversation: true } });
  if (!ticket?.conversation) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  const message = await prisma.supportMessage.create({ data: { conversationId: ticket.conversation.id, senderId: userId, body: body.trim() } });
  await prisma.supportTicket.update({ where: { id: ticketId }, data: { status: "OPEN" } });
  return NextResponse.json({ message }, { status: 201 });
}
