"use client";

import { ChangeEvent, useEffect, useState } from "react";

type Form = {
  fullName: string; username: string; email: string; firstName: string; lastName: string; displayName: string;
  jobTitle: string; department: string; location: string; phone: string; website: string; bio: string;
  organization: string; timezone: string; language: string; image: string | null; coverImage: string | null;
  emailAlerts: boolean; pushAlerts: boolean; analysisAlerts: boolean; reportAlerts: boolean;
  emailNotifications: boolean; pushNotifications: boolean; inAppNotifications: boolean; emailAnalysisComplete: boolean; emailNewMember: boolean; emailWeeklyReport: boolean; emailSecurityAlerts: boolean; pushMentions: boolean; pushComments: boolean; pushReports: boolean; theme: string;
  accentColor: string; dateFormat: string; weekStartsOn: number; profileVisibility: string; showActivity: boolean;
  workspaceName: string; workspaceSlug: string;
};
type Key = { id: string; name: string; keyPrefix: string; lastUsedAt: string | null; revokedAt: string | null; createdAt: string };
type LoginSession = { id: string; deviceName: string | null; deviceType: string | null; browser: string | null; os: string | null; ip: string | null; ipAddress: string | null; createdAt: string; lastActiveAt: string | null; expires: string; revokedAt: string | null };
type Security = { twoFactor: boolean; recoveryCodes: number; emailVerified: boolean; passwordChangedAt: string | null };

const initial: Form = {
  fullName: "", username: "", email: "", firstName: "", lastName: "", displayName: "", jobTitle: "", department: "",
  location: "", phone: "", website: "", bio: "", organization: "", timezone: "UTC", language: "en", image: null, coverImage: null,
  emailAlerts: true, pushAlerts: true, analysisAlerts: true, reportAlerts: true, emailNotifications: true, pushNotifications: true,
  inAppNotifications: true, emailAnalysisComplete: true, emailNewMember: true, emailWeeklyReport: true, emailSecurityAlerts: true, pushMentions: true, pushComments: true, pushReports: true, theme: "system", accentColor: "#e3b341", dateFormat: "MMM d, yyyy", weekStartsOn: 1,
  profileVisibility: "team", showActivity: true, workspaceName: "", workspaceSlug: "",
};

function Field({ label, value, onChange, type = "text", disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) {
  return <label className="text-xs text-[#8b949e]">{label}<input type={type} disabled={disabled} value={value} onChange={event => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-white/[0.09] bg-black/30 px-3 text-sm text-white outline-none focus:border-[#e3b341]/60 disabled:opacity-60" /></label>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center gap-3 text-sm text-[#d8dee4]"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="accent-[#e3b341]" />{label}</label>;
}
function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5"><h2 className="text-base font-semibold">{title}</h2><p className="mt-1 text-xs text-[#8b949e]">{description}</p><div className="mt-5">{children}</div></section>;
}

export default function SettingsClient() {
  const [form, setForm] = useState<Form>(initial);
  const [security, setSecurity] = useState<Security>({ twoFactor: false, recoveryCodes: 0, emailVerified: false, passwordChangedAt: null });
  const [keys, setKeys] = useState<Key[]>([]);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/settings"), fetch("/api/settings/sessions"), fetch("/api/settings/security")]).then(async ([settingsResponse, sessionsResponse, securityResponse]) => {
      const data = await settingsResponse.json(); const sessionData = await sessionsResponse.json(); const securityData = await securityResponse.json();
      if (settingsResponse.ok) setForm({ ...initial, ...(data.user || {}), ...(data.settings || {}), workspaceName: data.workspace?.name || "", workspaceSlug: data.workspace?.slug || "", email: data.user?.email || "" });
      if (sessionsResponse.ok) setSessions(sessionData.sessions || []);
      if (settingsResponse.ok) setKeys(data.apiKeys || []);
      if (securityResponse.ok) setSecurity(securityData);
    }).finally(() => setLoading(false));
  }, []);
  const update = <K extends keyof Form>(key: K, value: Form[K]) => setForm(current => ({ ...current, [key]: value }));

  async function save() {
    setSaving(true); setMessage("");
    const { email, workspaceName, workspaceSlug, ...payload } = form;
    const response = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, website: form.website.trim() || null, workspaceName: workspaceName.trim() || undefined, workspaceSlug: workspaceSlug.trim() || undefined }) });
    const data = await response.json(); setMessage(response.ok ? "Settings saved" : data.error || "Unable to save settings"); setSaving(false);
  }
  function upload(field: "image" | "coverImage", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file || !file.type.startsWith("image/") || file.size > 2_000_000) { setMessage("Choose an image under 2 MB"); return; }
    const reader = new FileReader(); reader.onload = () => update(field, String(reader.result)); reader.readAsDataURL(file);
  }
  async function securityAction(body: object) {
    const response = await fetch("/api/settings/security", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json(); if (!response.ok) { setMessage(data.error || "Security update failed"); return; }
    if (data.recoveryCodes) setRecoveryCodes(data.recoveryCodes); if (data.secret) setSecret(data.secret);
    setSecurity(current => ({ ...current, twoFactor: data.enabled ?? current.twoFactor, recoveryCodes: data.recoveryCodes?.length ?? current.recoveryCodes }));
    setCurrentPassword(""); setMessage("Security settings updated");
  }
  async function createKey() {
    const name = window.prompt("Name this API key"); if (!name) return;
    const response = await fetch("/api/settings/api-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await response.json(); if (!response.ok) { setMessage(data.error || "Unable to create key"); return; }
    setKeys(current => [data.key, ...current]); setSecret(data.secret); setMessage("Copy this API key now; it will not be shown again.");
  }
  async function revokeKey(id: string) { if (!(await fetch(`/api/settings/api-keys/${id}`, { method: "DELETE" })).ok) return; setKeys(current => current.map(key => key.id === id ? { ...key, revokedAt: new Date().toISOString() } : key)); }
  async function revokeSession(id: string) { if (!(await fetch(`/api/settings/sessions/${id}`, { method: "DELETE" })).ok) return; setSessions(current => current.map(item => item.id === id ? { ...item, revokedAt: new Date().toISOString() } : item)); }
  async function revokeAllSessions() { if (!(await fetch("/api/settings/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) })).ok) return; setSessions(current => current.map(item => ({ ...item, revokedAt: new Date().toISOString() }))); }

  if (loading) return <section className="py-7"><div className="h-96 animate-pulse rounded-xl bg-white/[0.04]" /></section>;
  return <section className="py-7">
    <div className="mb-7"><p className="text-xs font-medium uppercase tracking-[0.17em] text-[#e3b341]">Administration</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Enterprise settings</h1><p className="mt-2 text-sm text-[#8b949e]">Manage your profile, security, workspace, and notification preferences.</p></div>
    <div className="space-y-4">
      <Section title="Profile" description="Your identity and public profile. Images are stored securely as validated URLs or data URLs.">
        <div className="mb-4 flex items-center gap-4">{form.image ? <img src={form.image} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="h-16 w-16 rounded-full bg-white/10" />}<label className="cursor-pointer text-xs text-[#e3b341]">Upload profile image<input type="file" accept="image/*" onChange={event => upload("image", event)} className="hidden" /></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" value={form.fullName} onChange={value => update("fullName", value)} /><Field label="Username" value={form.username} onChange={value => update("username", value)} /><Field label="First name" value={form.firstName} onChange={value => update("firstName", value)} /><Field label="Last name" value={form.lastName} onChange={value => update("lastName", value)} /><Field label="Display name" value={form.displayName} onChange={value => update("displayName", value)} /><Field label="Email" value={form.email} onChange={() => {}} disabled /><Field label="Job title" value={form.jobTitle} onChange={value => update("jobTitle", value)} /><Field label="Department" value={form.department} onChange={value => update("department", value)} /><Field label="Location" value={form.location} onChange={value => update("location", value)} /><Field label="Phone" value={form.phone} onChange={value => update("phone", value)} /><Field label="Website" value={form.website} onChange={value => update("website", value)} /></div>
        <label className="mt-4 block text-xs text-[#8b949e]">Bio<textarea value={form.bio} onChange={event => update("bio", event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-white/[0.09] bg-black/30 p-3 text-sm text-white outline-none focus:border-[#e3b341]/60" /></label>
        <div className="mt-4"><label className="cursor-pointer text-xs text-[#e3b341]">Upload cover image<input type="file" accept="image/*" onChange={event => upload("coverImage", event)} className="hidden" /></label>{form.coverImage && <img src={form.coverImage} alt="" className="mt-2 h-20 w-full rounded-lg object-cover" />}</div>
      </Section>
      <Section title="Account" description="Regional preferences and account verification."><div className="grid gap-4 sm:grid-cols-2"><Field label="Timezone" value={form.timezone} onChange={value => update("timezone", value)} /><Field label="Language" value={form.language} onChange={value => update("language", value)} /><Field label="Organization" value={form.organization} onChange={value => update("organization", value)} /></div><div className="mt-4 flex items-center gap-3 text-sm"><span className={security.emailVerified ? "text-[#3fb950]" : "text-[#f85149]"}>{security.emailVerified ? "Email verified" : "Email not verified"}</span>{!security.emailVerified && <button type="button" className="text-xs text-[#e3b341]" onClick={async () => { const response = await fetch("/api/settings/verification", { method: "POST" }); setMessage(response.ok ? "Verification email sent" : "Unable to send verification email"); }}>Send verification email</button>}</div></Section>
      <Section title="Security" description="Protect your account with a strong password, two-factor authentication, and recovery codes."><div className="grid gap-3 sm:grid-cols-2"><Field label="Current password" type="password" value={currentPassword} onChange={setCurrentPassword} /><Field label="New password" type="password" value={newPassword} onChange={setNewPassword} /></div><button type="button" onClick={() => securityAction({ action: "change-password", currentPassword, newPassword })} className="mt-3 rounded-lg border border-white/10 px-3 py-2 text-xs">Change password</button><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4"><Toggle label={security.twoFactor ? "Two-factor authentication enabled" : "Enable two-factor authentication"} checked={security.twoFactor} onChange={() => securityAction({ action: security.twoFactor ? "disable-2fa" : "enable-2fa", currentPassword })} /><span className="text-xs text-[#8b949e]">{security.recoveryCodes} recovery codes left</span></div>{(secret || recoveryCodes.length > 0) && <div className="mt-4 rounded-lg bg-black/30 p-3 text-xs"><p className="text-[#e3b341]">Save these one-time security values now.</p>{secret && <p className="mt-2 break-all">{secret}</p>}{recoveryCodes.length > 0 && <p className="mt-2 break-words">{recoveryCodes.join("  ")}</p>}</div>}</Section>
      <Section title="Workspace" description="Workspace details can be changed by workspace owners and admins."><div className="grid gap-4 sm:grid-cols-2"><Field label="Workspace name" value={form.workspaceName} onChange={value => update("workspaceName", value)} /><Field label="Workspace slug" value={form.workspaceSlug} onChange={value => update("workspaceSlug", value)} /></div></Section>
      <Section title="Notifications" description="Choose exactly which events reach you through each channel."><div className="grid gap-6 md:grid-cols-3"><div><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#e3b341]">Email</p><div className="space-y-3"><Toggle label="Analysis complete" checked={form.emailAnalysisComplete} onChange={value => update("emailAnalysisComplete", value)} /><Toggle label="New member" checked={form.emailNewMember} onChange={value => update("emailNewMember", value)} /><Toggle label="Weekly report" checked={form.emailWeeklyReport} onChange={value => update("emailWeeklyReport", value)} /><Toggle label="Security alerts" checked={form.emailSecurityAlerts} onChange={value => update("emailSecurityAlerts", value)} /></div></div><div><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#e3b341]">Push</p><div className="space-y-3"><Toggle label="Mentions" checked={form.pushMentions} onChange={value => update("pushMentions", value)} /><Toggle label="Comments" checked={form.pushComments} onChange={value => update("pushComments", value)} /><Toggle label="Reports" checked={form.pushReports} onChange={value => update("pushReports", value)} /></div></div><div><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#e3b341]">In-app</p><Toggle label="Everything" checked={form.inAppNotifications} onChange={value => update("inAppNotifications", value)} /></div></div></Section>
      <Section title="Appearance" description="Personalize the application experience."><div className="grid gap-4 sm:grid-cols-3"><label className="text-xs text-[#8b949e]">Theme<select value={form.theme} onChange={event => update("theme", event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label><Field label="Accent color" value={form.accentColor} onChange={value => update("accentColor", value)} /><Field label="Date format" value={form.dateFormat} onChange={value => update("dateFormat", value)} /></div></Section>
      <Section title="API Keys" description="API keys are hashed at rest. The full value is revealed only once when created."><button type="button" onClick={createKey} className="rounded-lg bg-[#e3b341] px-3 py-2 text-xs font-semibold text-[#171006]">Create API key</button>{secret && <p className="mt-3 break-all rounded-lg bg-black/30 p-3 text-xs">{secret}</p>}<div className="mt-4 space-y-2">{keys.map(key => <div key={key.id} className="flex items-center justify-between rounded-lg border border-white/10 p-3 text-xs"><span>{key.name} <span className="text-[#8b949e]">{key.keyPrefix} · {key.revokedAt ? "revoked" : "active"}</span></span>{!key.revokedAt && <button type="button" onClick={() => revokeKey(key.id)} className="text-[#f85149]">Revoke</button>}</div>)}</div></Section>
      <Section title="Sessions" description="Review sign-ins and remotely revoke devices."><button type="button" onClick={revokeAllSessions} className="text-xs text-[#f85149]">Sign out all sessions</button><div className="mt-4 space-y-2">{sessions.map(item => <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 p-3 text-xs"><span>{item.browser || item.deviceName || "Unknown browser"} · {item.os || "Unknown OS"}<span className="block text-[#8b949e]">IP {item.ipAddress || item.ip || "Unknown"} · Login {new Date(item.createdAt).toLocaleString()} · Last active {item.lastActiveAt ? new Date(item.lastActiveAt).toLocaleString() : "Unknown"}{item.revokedAt && " · revoked"}</span></span>{!item.revokedAt && <button type="button" onClick={() => revokeSession(item.id)} className="shrink-0 text-[#f85149]">Revoke</button>}</div>)}</div></Section>
      <Section title="Privacy" description="Control who can see your profile and activity."><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs text-[#8b949e]">Profile visibility<select value={form.profileVisibility} onChange={event => update("profileVisibility", event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm"><option value="public">Public</option><option value="team">Team</option><option value="private">Private</option></select></label></div><div className="mt-4"><Toggle label="Show my activity to workspace members" checked={form.showActivity} onChange={value => update("showActivity", value)} /></div></Section>
      <div className="sticky bottom-3 flex items-center justify-between rounded-lg border border-white/10 bg-[#111]/95 p-3"><span className="text-xs text-[#3fb950]">{message}</span><button type="button" onClick={save} disabled={saving} className="h-10 rounded-lg bg-[#e3b341] px-4 text-xs font-semibold text-[#171006] disabled:opacity-60">{saving ? "Saving..." : "Save settings"}</button></div>
    </div>
  </section>;
}
