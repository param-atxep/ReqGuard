import crypto from "crypto";
import prisma from "./prisma";

/** Resolve a high-entropy API key without ever storing or returning its secret. */
export async function authenticateApiKey(value: string) {
  if (!value || !value.startsWith("rg_live_")) return null;
  const keyHash = crypto.createHash("sha256").update(value).digest("hex");
  const key = await prisma.apiKey.findFirst({ where: { keyHash, revokedAt: null } });
  if (!key) return null;
  await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  return { id: key.id, userId: key.userId };
}
