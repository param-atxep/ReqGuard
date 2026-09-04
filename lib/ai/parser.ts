export type ParsedRequirement = { key: string; text: string; category: string };

const categories: Array<[string, RegExp]> = [
  ["Authentication", /\b(login|sign in|authenticate|password|session|2fa|multi[- ]factor)\b/i],
  ["Security", /\b(encrypt|security|authorize|permission|access control|audit)\b/i],
  ["Database", /\b(database|persist|store|record|query|sql)\b/i],
  ["API", /\b(api|endpoint|webhook|rest|request|response)\b/i],
  ["UI", /\b(screen|page|button|form|display|interface|dashboard)\b/i],
  ["Performance", /\b(response time|latency|performance|throughput|seconds?|milliseconds?)\b/i],
  ["Reporting", /\b(report|export|csv|pdf|summary)\b/i],
  ["Notifications", /\b(notif|email|alert|push)\b/i],
];

export function categorizeRequirement(text: string): string {
  return categories.find(([, pattern]) => pattern.test(text))?.[0] || "Business Logic";
}

export function cleanRequirementText(text: string): string {
  return text.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").replace(/\s+/g, " ").trim();
}
