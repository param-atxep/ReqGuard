"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Check, ChevronRight, Mail, MoreHorizontal, Plus, Search, Shield, UserRound, X } from "lucide-react";

type Role = "OWNER" | "ADMIN" | "DEVELOPER" | "REVIEWER" | "VIEWER";
type Member = {
  id: string; membershipId: string; fullName: string; username: string; email: string | null; image: string | null;
  jobTitle: string | null; department: string | null; location: string | null; phone: string | null; bio: string | null; timezone: string; language: string; organization: string | null; role: Role;
  joinedAt: string; lastActiveAt: string; projects: Array<{ id: string; name: string }>; activity: Array<{ id: string; title: string; createdAt: string }>;
};
type Invitation = { id: string; email: string; role: Role; message?: string | null; status: string; expiresAt: string; invitedBy?: { fullName: string } };
type Profile = Pick<Member, "id" | "fullName" | "username" | "email" | "image" | "jobTitle" | "department" | "location" | "phone" | "bio" | "timezone" | "language" | "organization">;
type Notice = { id: string; title: string; message?: string | null; readAt?: string | null; createdAt: string };

const roles: Role[] = ["ADMIN", "DEVELOPER", "REVIEWER", "VIEWER"];
const roleLabel = (role: string) => role[0] + role.slice(1).toLowerCase();
const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export default function TeamClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [workspace, setWorkspace] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>("VIEWER");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [received, setReceived] = useState<Array<Invitation & { workspace: { id: string; name: string }; invitedBy?: { fullName: string } }>>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);
  const [selected, setSelected] = useState<Member | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("DEVELOPER");
  const [inviteMessage, setInviteMessage] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [teamResponse, invitationResponse, profileResponse, noticeResponse] = await Promise.all([
      fetch("/api/team/members"), fetch("/api/team/invitations"), fetch("/api/team/profile"), fetch("/api/notifications"),
    ]);
    if (teamResponse.ok) { const data = await teamResponse.json(); setMembers(data.members || []); setWorkspace(data.workspace); setCurrentRole(data.currentRole); }
    if (invitationResponse.ok) { const data = await invitationResponse.json(); setInvitations(data.invitations || []); setReceived(data.received || []); }
    if (profileResponse.ok) setProfile((await profileResponse.json()).profile);
    if (noticeResponse.ok) { const data = await noticeResponse.json(); setNotifications(data.notifications || []); setUnread(data.unreadCount || 0); }
  }

  useEffect(() => {
    void load().catch(() => setStatus("Unable to load collaboration data."));
    const token = new URLSearchParams(window.location.search).get("invite");
    if (token) setStatus("Review the invitation below to join this workspace.");
  }, []);

  const visibleMembers = useMemo(() => members.filter((member) => `${member.fullName} ${member.username} ${member.email || ""}`.toLowerCase().includes(search.toLowerCase())), [members, search]);
  const canManage = currentRole === "OWNER" || currentRole === "ADMIN";

  async function invite() {
    setBusy(true); setStatus("");
    const response = await fetch("/api/team/invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role, message: inviteMessage, workspaceId: workspace?.id }) });
    const data = await response.json();
    setStatus(response.ok ? `Invitation sent to ${email}.` : data.error || "Unable to send invitation.");
    if (response.ok) { setEmail(""); setInviteMessage(""); setInviteOpen(false); void load(); }
    setBusy(false);
  }

  async function respond(id: string, action: "accept" | "decline") {
    const token = new URLSearchParams(window.location.search).get("invite");
    if (!token) { setStatus("Open the invitation link from your email to respond."); return; }
    const response = await fetch(`/api/team/invitations/${encodeURIComponent(token)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    setStatus(response.ok ? (action === "accept" ? "You joined the workspace." : "Invitation declined.") : (await response.json()).error || "Unable to respond.");
    if (response.ok) void load();
    void id;
  }

  async function updateRole(member: Member, nextRole: Role) {
    const response = await fetch(`/api/team/members/${member.membershipId}?workspaceId=${workspace?.id || ""}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: nextRole }) });
    if (response.ok) { setMembers((items) => items.map((item) => item.membershipId === member.membershipId ? { ...item, role: nextRole } : item)); setStatus("Role updated."); } else setStatus((await response.json()).error || "Unable to update role.");
  }

  async function removeMember(member: Member) {
    if (!window.confirm(`Remove ${member.fullName} from this workspace?`)) return;
    const response = await fetch(`/api/team/members/${member.membershipId}?workspaceId=${workspace?.id || ""}`, { method: "DELETE" });
    if (response.ok) { setMembers((items) => items.filter((item) => item.membershipId !== member.membershipId)); setSelected(null); } else setStatus((await response.json()).error || "Unable to remove member.");
  }

  async function transferOwnership(member: Member) {
    if (!window.confirm(`Transfer workspace ownership to ${member.fullName}? You will become an admin.`)) return;
    const response = await fetch(`/api/team/members/${member.membershipId}?workspaceId=${workspace?.id || ""}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "OWNER" }) });
    if (response.ok) { setStatus("Ownership transferred."); setSelected(null); void load(); } else setStatus((await response.json()).error || "Unable to transfer ownership.");
  }

  async function markRead(id?: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id } : { all: true }) });
    setNotifications((items) => items.map((item) => id && item.id !== id ? item : { ...item, readAt: new Date().toISOString() }));
    setUnread(id ? Math.max(0, unread - 1) : 0);
  }

  return (
    <section className="relative py-7">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-medium uppercase tracking-[0.17em] text-[#e3b341]">Administration · collaboration</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Team</h1><p className="mt-2 text-sm text-[#8b949e]">Build a focused workspace for requirement intelligence.</p></div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setNotificationsOpen((value) => !value)} className="relative rounded-lg border border-white/[0.09] bg-white/[0.035] p-2.5 text-[#aeb6bf] hover:text-white" aria-label="Notifications"><Bell size={17} />{unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e3b341] px-1 text-[9px] font-bold text-black">{unread}</span>}</button>
          {canManage && <button type="button" onClick={() => setInviteOpen(true)} className="flex h-10 items-center gap-2 rounded-lg bg-[#e3b341] px-4 text-xs font-semibold text-[#171006]"><Plus size={15} /> Invite member</button>}
        </div>
      </div>
      {notificationsOpen && <div className="absolute right-0 top-20 z-20 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-white/[0.1] bg-[#111] p-3 shadow-2xl"><div className="flex items-center justify-between border-b border-white/[0.08] pb-3"><p className="text-sm font-medium">Notification center</p><button type="button" onClick={() => void markRead()} className="text-xs text-[#e3b341]">Mark all read</button></div>{notifications.length ? notifications.map((item) => <button key={item.id} type="button" onClick={() => void markRead(item.id)} className="flex w-full gap-3 border-b border-white/[0.05] px-2 py-3 text-left hover:bg-white/[0.04]"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.readAt ? "bg-[#3b3b3b]" : "bg-[#e3b341]"}`} /><span><span className="block text-xs font-medium">{item.title}</span><span className="mt-1 block text-[11px] text-[#737b85]">{item.message || "Workspace update"}</span></span></button>) : <p className="py-8 text-center text-xs text-[#737b85]">You are all caught up.</p>}</div>}
      {status && <div className="mb-4 rounded-lg border border-[#e3b341]/20 bg-[#e3b341]/[0.06] px-4 py-3 text-xs text-[#e3b341]">{status}</div>}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e3b341]/10 text-[#e3b341]"><Shield size={18} /></div><div><p className="text-sm font-medium">{workspace?.name || "Your workspace"}</p><p className="text-xs text-[#737b85]">{members.length} members · Your role: {roleLabel(currentRole)}</p></div></div><div className="relative w-full sm:w-64"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#737b85]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members" className="h-9 w-full rounded-lg border border-white/[0.09] bg-black/20 pl-9 pr-3 text-xs outline-none focus:border-[#e3b341]/50" /></div></div>
      {received.length > 0 && <div className="mb-5 rounded-xl border border-[#e3b341]/25 bg-[#e3b341]/[0.06] p-4"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#e3b341]">Pending invitations</p>{received.map((invitation) => <div key={invitation.id} className="mt-3 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium">Join {invitation.workspace.name}</p><p className="text-xs text-[#8b949e]">Invited by {invitation.invitedBy?.fullName || "a teammate"} as {roleLabel(invitation.role)}</p></div><div className="flex gap-2"><button type="button" onClick={() => void respond(invitation.id, "decline")} className="rounded-lg border border-white/[0.1] px-3 py-2 text-xs text-[#aeb6bf]">Decline</button><button type="button" onClick={() => void respond(invitation.id, "accept")} className="rounded-lg bg-[#e3b341] px-3 py-2 text-xs font-semibold text-black">Accept</button></div></div>)}</div>}
      <div className="grid gap-3 md:grid-cols-2">{visibleMembers.map((member) => <article key={member.membershipId} className="group rounded-xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/[0.16]"><div className="flex items-start gap-3"><button type="button" onClick={() => setSelected(member)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e3b341]/10 text-sm font-semibold text-[#e3b341]">{member.image ? <img src={member.image} alt="" className="h-full w-full rounded-full object-cover" /> : initials(member.fullName)}</span><span className="min-w-0"><span className="block truncate text-sm font-medium text-white">{member.fullName}</span><span className="mt-1 block truncate text-xs text-[#737b85]">{member.jobTitle || `@${member.username}`} · {roleLabel(member.role)}</span></span></button><button type="button" onClick={() => setSelected(member)} className="rounded-md p-1.5 text-[#737b85] hover:bg-white/[0.06] hover:text-white" aria-label={`View ${member.fullName}`}><MoreHorizontal size={16} /></button></div><div className="mt-5 flex items-center justify-between text-xs"><span className="text-[#8b949e]">{member.projects.length} project{member.projects.length === 1 ? "" : "s"}</span><span className="text-[#737b85]">Active {new Date(member.lastActiveAt).toLocaleDateString()}</span></div>{canManage && member.role !== "OWNER" && <select value={member.role} onChange={(event) => void updateRole(member, event.target.value as Role)} className="mt-3 h-8 w-full rounded-md border border-white/[0.08] bg-black/20 px-2 text-xs text-[#aeb6bf]"><option value="ADMIN">Admin</option><option value="DEVELOPER">Developer</option><option value="REVIEWER">Reviewer</option><option value="VIEWER">Viewer</option></select>}</article>)}{!visibleMembers.length && <div className="col-span-full rounded-xl border border-dashed border-white/[0.12] p-12 text-center"><UserRound className="mx-auto text-[#737b85]" size={24} /><p className="mt-3 text-sm text-[#8b949e]">No members match your search.</p></div>}</div>
      {invitations.length > 0 && <div className="mt-7 rounded-xl border border-white/[0.08] bg-white/[0.025] p-5"><div className="flex items-center justify-between"><h2 className="text-sm font-medium">Invitation history</h2><Mail size={16} className="text-[#737b85]" /></div><div className="mt-3 divide-y divide-white/[0.06]">{invitations.map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"><span className="text-[#c9d1d9]">{invitation.email}</span><span className="text-[#737b85]">{roleLabel(invitation.role)}</span><span className={invitation.status === "PENDING" ? "text-[#e3b341]" : "text-[#737b85]"}>{roleLabel(invitation.status)}</span></div>)}</div></div>}

      {inviteOpen && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setInviteOpen(false); }}><div className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#111] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-[0.15em] text-[#e3b341]">New collaborator</p><h2 className="mt-2 text-xl font-semibold">Invite to {workspace?.name || "workspace"}</h2></div><button type="button" onClick={() => setInviteOpen(false)} className="text-[#737b85] hover:text-white" aria-label="Close"><X size={18} /></button></div><label className="mt-6 block text-xs text-[#8b949e]">Email address<input autoFocus type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="colleague@company.com" className="mt-2 h-10 w-full rounded-lg border border-white/[0.1] bg-black/30 px-3 text-sm text-white outline-none focus:border-[#e3b341]/60" /></label><label className="mt-4 block text-xs text-[#8b949e]">Workspace role<select value={role} onChange={(event) => setRole(event.target.value as Role)} className="mt-2 h-10 w-full rounded-lg border border-white/[0.1] bg-black/30 px-3 text-sm text-white outline-none focus:border-[#e3b341]/60">{roles.map((item) => <option key={item} value={item}>{roleLabel(item)}</option>)}</select></label><label className="mt-4 block text-xs text-[#8b949e]">Personal message <textarea value={inviteMessage} onChange={(event) => setInviteMessage(event.target.value)} placeholder="Introduce the workspace..." className="mt-2 min-h-20 w-full resize-none rounded-lg border border-white/[0.1] bg-black/30 p-3 text-sm text-white outline-none focus:border-[#e3b341]/60" /></label><button type="button" onClick={() => void invite()} disabled={busy || !email} className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#e3b341] text-xs font-semibold text-black disabled:opacity-50">{busy ? "Sending..." : "Send invitation"}<ChevronRight size={15} /></button></div></div>}
      {selected && <div className="fixed inset-0 z-30" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><aside className="absolute bottom-0 right-0 top-0 w-full max-w-md overflow-y-auto border-l border-white/[0.1] bg-[#0d0d0d] p-6 shadow-2xl"><button type="button" onClick={() => setSelected(null)} className="float-right text-[#737b85] hover:text-white" aria-label="Close profile"><X size={18} /></button><div className="pt-8 text-center"><span className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#e3b341]/10 text-2xl font-semibold text-[#e3b341]">{selected.image ? <img src={selected.image} alt="" className="h-full w-full object-cover" /> : initials(selected.fullName)}</span><h2 className="mt-4 text-xl font-semibold">{selected.fullName}</h2><p className="mt-1 text-sm text-[#8b949e]">@{selected.username} · {selected.email || "No email"}</p><span className="mt-3 inline-flex rounded-full border border-[#e3b341]/30 bg-[#e3b341]/10 px-3 py-1 text-[11px] text-[#e3b341]">{roleLabel(selected.role)}</span></div><div className="mt-8 grid grid-cols-2 gap-3 text-xs"><div className="rounded-lg border border-white/[0.08] p-3"><p className="text-[#737b85]">Organization</p><p className="mt-1 text-[#d8dee4]">{selected.organization || "Not set"}</p></div><div className="rounded-lg border border-white/[0.08] p-3"><p className="text-[#737b85]">Department</p><p className="mt-1 text-[#d8dee4]">{selected.department || "Not set"}</p></div><div className="rounded-lg border border-white/[0.08] p-3"><p className="text-[#737b85]">Timezone</p><p className="mt-1 text-[#d8dee4]">{selected.timezone}</p></div><div className="rounded-lg border border-white/[0.08] p-3"><p className="text-[#737b85]">Language</p><p className="mt-1 text-[#d8dee4]">{selected.language}</p></div></div>{selected.bio && <p className="mt-5 rounded-lg border border-white/[0.08] p-3 text-sm leading-6 text-[#aeb6bf]">{selected.bio}</p>}<div className="mt-4 rounded-lg border border-white/[0.08] p-3 text-xs text-[#d8dee4]">Location: {selected.location || "Not set"}{selected.phone && <span className="block mt-2">Phone: {selected.phone}</span>}</div><div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#737b85]">Projects</p>{selected.projects.length ? selected.projects.map((project) => <div key={project.id} className="mt-2 flex items-center justify-between rounded-lg border border-white/[0.07] px-3 py-3 text-xs"><span>{project.name}</span><ChevronRight size={14} className="text-[#737b85]" /></div>) : <p className="mt-3 text-xs text-[#737b85]">No projects yet.</p>}</div><div className="mt-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#737b85]">Recent activity</p>{selected.activity.length ? selected.activity.map((item) => <p key={item.id} className="mt-2 text-xs text-[#8b949e]">{item.title} <span className="text-[#4f565e]">· {new Date(item.createdAt).toLocaleDateString()}</span></p>) : <p className="mt-3 text-xs text-[#737b85]">No recent activity.</p>}</div><div className="mt-6 border-t border-white/[0.08] pt-5 text-xs text-[#737b85]"><p>Joined {new Date(selected.joinedAt).toLocaleDateString()}</p><p className="mt-2">Last active {new Date(selected.lastActiveAt).toLocaleString()}</p></div>{canManage && selected.role !== "OWNER" && <button type="button" onClick={() => void removeMember(selected)} className="mt-8 w-full rounded-lg border border-red-400/20 px-3 py-2.5 text-xs text-red-300 hover:bg-red-400/10">Remove from workspace            </button>}{currentRole === "OWNER" && <button type="button" onClick={() => void transferOwnership(selected)} className="mt-2 w-full rounded-lg border border-[#e3b341]/30 px-3 py-2.5 text-xs text-[#e3b341] hover:bg-[#e3b341]/10">Transfer ownership      </button>}</aside></div>}
      {profile && <p className="mt-6 text-center text-[11px] text-[#4f565e]">Your profile: {profile.jobTitle || profile.email || profile.username} · Manage details in Settings</p>}
    </section>
  );
}
