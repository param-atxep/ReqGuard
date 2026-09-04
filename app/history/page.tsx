import DashboardShell from "../../components/dashboard/DashboardShell";
import prisma from "../../lib/prisma";
import { requirePageAuth } from "../../lib/session";
import type { ActivityLog } from "@prisma/client";

export default async function HistoryPage() {
  const session = await requirePageAuth();
  const userId = session.user?.id as string;
  const activities = await prisma.activityLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 200 });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const typedActivities = activities as ActivityLog[];
  const groups: { label: string; items: ActivityLog[] }[] = [{ label: "Today", items: typedActivities.filter((item: ActivityLog) => item.createdAt >= today) }, { label: "Yesterday", items: typedActivities.filter((item: ActivityLog) => item.createdAt >= yesterday && item.createdAt < today) }, { label: "Earlier", items: typedActivities.filter((item: ActivityLog) => item.createdAt < yesterday) }];
  return <DashboardShell user={session.user as { name?: string; role?: string; image?: string }}><section className="py-7"><div className="mb-7"><p className="text-xs font-medium uppercase tracking-[0.17em] text-[#e3b341]">Governance</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">History</h1><p className="mt-2 text-sm text-[#8b949e]">A searchable, meaningful audit trail of your workspace actions.</p></div><div className="space-y-5">{groups.map((group) => <section key={group.label} className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5"><h2 className="text-sm font-semibold text-white">{group.label}</h2><div className="mt-3 divide-y divide-white/[0.07]">{group.items.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 py-4"><div><p className="text-sm text-[#d8dee4]">{item.title}</p>{item.message && <p className="mt-1 text-xs text-[#8b949e]">{item.message}</p>}</div><time className="shrink-0 text-xs text-[#737b85]">{item.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div>)}{!group.items.length && <p className="py-5 text-sm text-[#737b85]">No recorded activity.</p>}</div></section>)}</div></section></DashboardShell>;
}
