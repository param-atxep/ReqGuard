import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(request: Request, name: string, limit = 10, windowMs = 60_000) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = `${name}:${forwarded || "unknown"}`;
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  current.count += 1;
  if (current.count > limit) {
    return NextResponse.json({ error: "RATE_LIMITED", retryAfter: Math.ceil((current.resetAt - now) / 1000) }, { status: 429, headers: { "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)) } });
  }
  return null;
}

export function requireSameOrigin(request: Request) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return null;
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return NextResponse.json({ error: "CSRF_ORIGIN_REJECTED" }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "CSRF_ORIGIN_REJECTED" }, { status: 403 });
    }
  }
  return null;
}

export function jsonError(error: unknown, fallback = "INVALID_REQUEST") {
  if (error && typeof error === "object" && "name" in error && error.name === "ZodError") return NextResponse.json({ error: fallback }, { status: 400 });
  console.error(error);
  return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
}
