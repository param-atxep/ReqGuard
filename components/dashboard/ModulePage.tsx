import DashboardShell from "./DashboardShell";
import prisma from "../../lib/prisma";
import { requirePageAuth } from "../../lib/session";

type ModuleConfig = { title: string; eyebrow: string; description: string; model: string; whereKey?: string; empty: string; action?: { label: string; href: string } };

function recordLabel(item: { id: string; name?: string; fileName?: string; title?: string; type?: string; message?: string }) {
  return item.name || item.fileName || item.title || (item.type ? `${item.type} activity` : item.message) || `Record ${item.id.slice(-8)}`;
}

export default async function ModulePage({ config }: { config: ModuleConfig }) {
  const session = await requirePageAuth();
  const user = session?.user as { id?: string; name?: string; role?: string; image?: string } | undefined;
  const model = (prisma as Record<string, { findMany?: (args: unknown) => Promise<unknown[]> }>)[config.model];
  let records: unknown[] = [];
  if (model?.findMany && user?.id) {
    try {
      records = await model.findMany({ where: { [config.whereKey || "ownerId"]: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
    } catch {
      records = [];
    }
  }
  return <DashboardShell user={user}><section className="py-7">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.17em] text-[#e3b341]">{config.eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{config.title}</h1><p className="mt-2 text-sm text-[#8b949e]">{config.description}</p></div>{config.action && <a href={config.action.href} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#e3b341] px-4 text-xs font-semibold text-[#171006]">{config.action.label}</a>}</div>
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025]">
      {records.length === 0 ? <div className="p-16 text-center"><p className="text-sm text-[#d8dee4]">{config.empty}</p><p className="mt-2 text-xs text-[#737b85]">Records created in ReqGuard will appear here automatically.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="sticky top-0 bg-[#111] text-xs uppercase tracking-wider text-[#737b85]"><tr><th className="p-4">Name</th><th className="p-4">Status</th><th className="p-4">Created</th><th className="p-4">ID</th></tr></thead><tbody>{records.map((record) => { const item = record as { id: string; name?: string; fileName?: string; title?: string; type?: string; message?: string; status?: string; createdAt?: Date }; const href = config.model === "analysis" ? `/analysis/${item.id}` : config.model === "project" ? `/projects/${item.id}` : undefined; return <tr key={item.id} className="border-t border-white/[0.06]"><td className="p-4 font-medium text-white">{href ? <a href={href} className="hover:text-[#e3b341]">{recordLabel(item)}</a> : recordLabel(item)}</td><td className="p-4 text-xs text-[#e3b341]">{item.status || item.type || "Recorded"}</td><td className="p-4 text-xs text-[#8b949e]">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</td><td className="p-4 font-mono text-xs text-[#737b85]">{item.id}</td></tr>; })}</tbody></table></div>}
    </div>
  </section></DashboardShell>;
}
