"use client";

import { useState } from "react";

type Requirement = { id: string; key: string; text: string; category: string | null; priority: string; status: string; version: number; analysisId: string };

export default function RequirementsTable({ initial }: { initial: Requirement[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  async function transition(item: Requirement, status: string) {
    setBusy(item.id); setMessage("");
    const response = await fetch(`/api/requirements/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, changeSummary: `Moved to ${status.replaceAll("_", " ").toLowerCase()}` }) });
    const data = await response.json();
    if (response.ok) setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: data.requirement.status, version: data.requirement.version } : entry));
    else setMessage(data.error || "Unable to update requirement");
    setBusy("");
  }
  return <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-[10px] uppercase tracking-wider text-[#737b85]"><tr><th className="pb-3">ID</th><th className="pb-3">Requirement</th><th className="pb-3">Category</th><th className="pb-3">Priority</th><th className="pb-3">Review status</th><th className="pb-3">Version</th><th className="pb-3">Action</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-white/[0.06]"><td className="py-3 font-medium text-[#e3b341]">{item.key}</td><td className="max-w-[360px] truncate py-3 text-[#d8dee4]">{item.text}</td><td className="py-3 text-[#8b949e]">{item.category || "Unclassified"}</td><td className="py-3 text-[#8b949e]">{item.priority}</td><td className="py-3 text-xs text-[#e3b341]">{item.status.replaceAll("_", " ")}</td><td className="py-3 text-[#8b949e]">v{item.version}</td><td className="py-3"><select aria-label={`Update ${item.key} status`} value={item.status} disabled={busy === item.id} onChange={(event) => void transition(item, event.target.value)} className="rounded border border-white/[0.1] bg-black/30 px-2 py-1 text-xs text-white">{["DRAFT", "READY_FOR_REVIEW", "UNDER_REVIEW", "APPROVED", "REJECTED", "RELEASED"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></td></tr>)}</tbody></table>{message && <p className="mt-3 text-xs text-[#f85149]">{message}</p>}{!items.length && <p className="py-8 text-center text-sm text-[#737b85]">No requirements are stored for this project yet.</p>}</div>;
}
