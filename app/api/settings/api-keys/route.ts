import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "../../../../lib/session";

const createSchema = z.object({ name: z.string().trim().min(1).max(80) });

async function userId() {
  const session = await getServerSession();
  return session?.user?.id as string | undefined;
}

export async function GET() {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const keys = await prisma.apiKey.findMany({
    where: { userId: id },
    select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, revokedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "INVALID_REQUEST" }, { status: 400 });

  const secret = `rg_live_${crypto.randomBytes(32).toString("base64url")}`;
  const keyPrefix = secret.slice(0, 16);
  const keyHash = crypto.createHash("sha256").update(secret).digest("hex");
  const key = await prisma.apiKey.create({ data: { userId: id, name: parsed.data.name, keyPrefix, keyHash } });
  // The secret is intentionally returned only at creation time.
  return NextResponse.json({ key: { id: key.id, name: key.name, keyPrefix: key.keyPrefix, createdAt: key.createdAt }, secret }, { status: 201 });
}
