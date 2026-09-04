"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";

type Project = { id: string; name: string; client: string | null; description: string | null; status: string; priority: string; dueDate: string | null; _count?: { members: number; analyses: number } };
const empty = { name: "", client: "", description: "", priority: "MEDIUM", dueDate: "" };

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load projects");
      setProjects(data.projects);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load projects"); }
    finally { setLoading(false); }
  }
  useEffect(() => { const timer = window.setTimeout(load, 180); return () => window.clearTimeout(timer); }, [query]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const response = await fetch(editing ? `/api/projects/${editing}` : "/api/projects", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save project");
      setForm(empty); setEditing(null); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save project"); }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this project permanently?")) return;
    const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (response.ok) await load(); else setError("Unable to delete project");
  }

  async function archive(id: string) {
    const response = await fetch(`/api/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "ARCHIVED" }) });
    if (response.ok) await load(); else setError("Unable to archive project");
  }

  async function duplicate(id: string) {
    const response = await fetch(`/api/projects/${id}`, { method: "POST" });
    if (response.ok) await load(); else setError("Unable to duplicate project");
  }

  return <section className="py-7">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-xs font-medium uppercase tracking-[0.17em] text-[#e3b341]">Workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Projects</h1><p className="mt-2 text-sm text-[#8b949e]">Manage delivery scope, ownership, and requirement quality.</p></div>
      <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#e3b341] px-4 text-xs font-semibold text-[#171006]"><Plus size={16} /> New project</button>
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.025]">
        <div className="border-b border-white/[0.08] p-4"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737b85]" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects..." className="h-10 w-full rounded-lg border border-white/[0.09] bg-black/30 pl-9 pr-3 text-sm outline-none focus:border-[#e3b341]/60" /></div></div>
        {error && <p className="p-4 text-sm text-red-400">{error}</p>}
        {loading ? <div className="space-y-3 p-4">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-white/[0.05]" />)}</div> : projects.length === 0 ? <div className="p-12 text-center text-sm text-[#8b949e]">No projects yet. Create your first project to get started.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="sticky top-0 bg-[#111] text-xs uppercase tracking-wider text-[#737b85]"><tr><th className="p-4">Project</th><th className="p-4">Status</th><th className="p-4">Priority</th><th className="p-4">Analyses</th><th className="p-4">Actions</th></tr></thead><tbody>{projects.map(project => <tr key={project.id} className="border-t border-white/[0.06]"><td className="p-4"><Link href={`/projects/${project.id}`} className="font-medium text-white hover:text-[#e3b341]">{project.name}</Link><p className="text-xs text-[#737b85]">{project.client || "No client"}</p></td><td className="p-4 text-xs text-[#d8dee4]">{project.status}</td><td className="p-4 text-xs text-[#e3b341]">{project.priority}</td><td className="p-4 text-xs text-[#8b949e]">{project._count?.analyses || 0}</td><td className="p-4"><div className="flex gap-1"><button type="button" onClick={() => { setEditing(project.id); setForm({ name: project.name, client: project.client || "", description: project.description || "", priority: project.priority, dueDate: project.dueDate?.slice(0,10) || "" }); }} className="rounded p-2 text-[#8b949e] hover:bg-white/[0.06] hover:text-white" aria-label="Edit project"><Pencil size={15} /></button><button type="button" onClick={() => void duplicate(project.id)} className="rounded p-2 text-[#8b949e] hover:bg-white/[0.06] hover:text-white" aria-label="Duplicate project">+</button><button type="button" onClick={() => void archive(project.id)} className="rounded p-2 text-[#8b949e] hover:bg-white/[0.06] hover:text-white" aria-label="Archive project">A</button><button type="button" onClick={() => remove(project.id)} className="rounded p-2 text-[#8b949e] hover:bg-red-950 hover:text-red-300" aria-label="Delete project"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}
      </div>
      <form onSubmit={submit} className="h-fit rounded-xl border border-white/[0.08] bg-white/[0.025] p-5"><h2 className="font-medium">{editing ? "Edit project" : "Create project"}</h2><div className="mt-5 space-y-4">{(["name","client","description","dueDate"] as const).map(field => <label key={field} className="block text-xs text-[#8b949e]">{field === "dueDate" ? "Due date" : field[0].toUpperCase() + field.slice(1)}<input type={field === "dueDate" ? "date" : "text"} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required={field === "name"} className="mt-2 h-10 w-full rounded-lg border border-white/[0.09] bg-black/30 px-3 text-sm text-white outline-none focus:border-[#e3b341]/60" /></label>)}<label className="block text-xs text-[#8b949e]">Priority<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="mt-2 h-10 w-full rounded-lg border border-white/[0.09] bg-black/30 px-3 text-sm text-white outline-none"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label></div><button disabled={saving} className="mt-5 h-10 w-full rounded-lg bg-[#e3b341] text-xs font-semibold text-[#171006] disabled:opacity-60">{saving ? "Saving..." : editing ? "Save changes" : "Create project"}</button></form>
    </div>
  </section>;
}
