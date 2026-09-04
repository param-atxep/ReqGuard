"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronDown, Menu, Search, SlidersHorizontal, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { signOutCurrentSession } from "../auth/credentials-session";

type TopNavUser = {
  id?: string | null;
  name?: string | null;
  fullName?: string | null;
  image?: string | null;
};

export default function TopNav({
  user,
  onMenuToggle,
}: {
  user?: TopNavUser;
  onMenuToggle?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; category: string; name: string; href?: string; context?: string | null }>>([]);
  const [filters, setFilters] = useState({ severity: "", status: "", date: "" });
  const [recent, setRecent] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message?: string | null; readAt?: string | null }>>([]);
  const displayName = user?.name || user?.fullName || "Account";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const grouped = useMemo(() => results.reduce<Record<string, typeof results>>((groups, result) => { (groups[result.category] ||= []).push(result); return groups; }, {}), [results]);
  useEffect(() => { setRecent(JSON.parse(window.localStorage.getItem("reqguard-search-history") || "[]")); }, []);
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.trim() });
        Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
        const response = await fetch(`/api/search?${params}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json();
        setResults(data.results || []);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, filters]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[aria-label="Search workspace"]');
        input?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    fetch("/api/notifications").then(async response => {
      if (response.ok) setNotifications((await response.json()).notifications || []);
    }).catch(() => undefined);
  }, []);

  async function markRead(id?: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id } : { all: true }) });
    setNotifications(items => items.map(item => id && item.id !== id ? item : { ...item, readAt: new Date().toISOString() }));
  }

  async function removeNotification(id: string) {
    const response = await fetch("/api/notifications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (response.ok) setNotifications(items => items.filter(item => item.id !== id));
  }

  function saveSearch(value: string) {
    const next = [value, ...recent.filter((item) => item !== value)].slice(0, 6);
    setRecent(next);
    window.localStorage.setItem("reqguard-search-history", JSON.stringify(next));
  }

  function highlight(value: string) {
    const parts = value.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
    return parts.map((part, index) => part.toLowerCase() === query.toLowerCase() ? <mark key={index} className="bg-[#e3b341]/30 text-white">{part}</mark> : part);
  }

  return (
    <header className="sticky top-0 z-20 h-[72px] border-b border-white/[0.07] bg-[#050505]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full max-w-[1540px] items-center justify-between gap-4">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-[#8b949e] hover:bg-white/[0.06] hover:text-white lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="hidden min-w-0 md:block">
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-[#6f7780]">Workspace overview</p>
          <p className="mt-0.5 text-sm font-medium text-white">Requirement intelligence at a glance</p>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="relative hidden w-[min(34vw,330px)] sm:block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#737b85]" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              placeholder="Search workspace..."
              aria-label="Search workspace"
              className="h-10 w-full rounded-lg border border-white/[0.09] bg-white/[0.035] pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#626a73] focus:border-[#e3b341]/60 focus:ring-2 focus:ring-[#e3b341]/10"
            />
            {searchOpen && (
              <div
                className="absolute right-0 top-12 z-30 w-full overflow-hidden rounded-xl border border-white/[0.1] bg-[#111] p-1 shadow-2xl"
                onMouseDown={(event) => event.preventDefault()}
              >
                <div className="flex gap-1 border-b border-white/[0.08] p-1"><select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })} className="bg-transparent px-2 py-1 text-[10px] text-[#8b949e]"><option value="">Severity</option><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select><select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="bg-transparent px-2 py-1 text-[10px] text-[#8b949e]"><option value="">Status</option><option>OPEN</option><option>RESOLVED</option><option>COMPLETED</option></select><select value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} className="bg-transparent px-2 py-1 text-[10px] text-[#8b949e]"><option value="">Date</option><option value={new Date(Date.now() - 86400000 * 7).toISOString()}>Last 7 days</option><option value={new Date(Date.now() - 86400000 * 30).toISOString()}>Last 30 days</option></select></div>
                {query ? Object.entries(grouped).map(([group, items]) => <div key={group}><p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[#e3b341]">{group}</p>{items.map((result) => <Link key={`${result.category}-${result.id}`} href={result.href || "/dashboard"} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[#d8dee4] hover:bg-white/[0.06]" onClick={() => { saveSearch(query); setSearchOpen(false); }}><span className="truncate">{highlight(result.name)}</span></Link>)}</div>) : recent.length > 0 && <div><p className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-wider text-[#68717d]">Recent searches</p>{recent.map((item) => <button key={item} onClick={() => setQuery(item)} className="block w-full px-3 py-2 text-left text-xs text-[#8b949e] hover:bg-white/[0.06]">{item}</button>)}</div>}
                {query && results.length === 0 && <p className="p-4 text-center text-xs text-[#737b85]">No matching workspace records.</p>}
              </div>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg border border-white/[0.09] bg-white/[0.035] p-2.5 text-[#8b949e] hover:border-white/[0.16] hover:text-white sm:hidden"
            aria-label="Open search"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search size={17} />
          </button>
          <button
            type="button"
            className="hidden rounded-lg border border-white/[0.09] bg-white/[0.035] p-2.5 text-[#8b949e] hover:border-white/[0.16] hover:text-white sm:block"
            aria-label="Workspace filters"
          >
            <SlidersHorizontal size={17} />
          </button>
          <button
            type="button"
            className="relative rounded-lg border border-white/[0.09] bg-white/[0.035] p-2.5 text-[#8b949e] hover:border-white/[0.16] hover:text-white"
            aria-label="View notifications"
            onClick={() => setNotificationsOpen(value => !value)}
          >
            <Bell size={17} />
            {notifications.some(item => !item.readAt) && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e3b341]" aria-label="Unread notifications" />}
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.035] py-1.5 pl-1.5 pr-2 text-left hover:border-white/[0.16]"
            aria-label={`Open profile for ${displayName}`}
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((value) => !value)}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1b1b1b] text-[10px] font-semibold text-[#e3b341]">{initials}</span>
            <span className="hidden max-w-24 truncate text-xs font-medium text-[#d8dee4] lg:block">{displayName}</span>
            <ChevronDown size={14} className="text-[#737b85]" aria-hidden="true" />
          </button>
          {accountOpen && (
            <div className="absolute right-4 top-[60px] z-30 w-48 rounded-xl border border-white/[0.1] bg-[#111] p-1 shadow-2xl sm:right-8">
              <Link href="/settings" onClick={() => setAccountOpen(false)} className="block rounded-lg px-3 py-2 text-xs text-[#d8dee4] hover:bg-white/[0.06]">Settings</Link>
              <Link href="/help" onClick={() => setAccountOpen(false)} className="block rounded-lg px-3 py-2 text-xs text-[#d8dee4] hover:bg-white/[0.06]">Help & support</Link>
              <button type="button" onClick={() => void signOutCurrentSession()} className="w-full rounded-lg px-3 py-2 text-left text-xs text-red-300 hover:bg-red-950/40">Log out</button>
            </div>
          )}
        </div>
      </div>
      {notificationsOpen && <div className="absolute right-4 top-[64px] z-30 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-white/[0.1] bg-[#111] p-3 shadow-2xl sm:right-8"><div className="flex items-center justify-between border-b border-white/[0.08] pb-3"><p className="text-sm font-medium text-white">Notifications</p><button type="button" onClick={() => markRead()} className="text-xs text-[#e3b341]">Mark all read</button></div>{notifications.length === 0 ? <p className="py-8 text-center text-xs text-[#737b85]">You are all caught up.</p> : <div className="max-h-80 overflow-y-auto">{notifications.map(item => <div key={item.id} className="flex gap-3 border-b border-white/[0.05] px-2 py-3 hover:bg-white/[0.04]"><button type="button" onClick={() => markRead(item.id)} className="flex min-w-0 flex-1 gap-3 text-left"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.readAt ? "bg-[#3b3b3b]" : "bg-[#e3b341]"}`} /><span className="min-w-0"><span className="block text-xs font-medium text-[#d8dee4]">{item.title}</span><span className="mt-1 block text-[11px] text-[#737b85]">{item.message || "Workspace notification"} {item.readAt && <Check size={12} className="ml-1 inline" />}</span></span></button><button type="button" onClick={() => void removeNotification(item.id)} className="shrink-0 text-[#737b85] hover:text-red-300" aria-label={`Delete ${item.title}`}><Trash2 size={14} /></button></div>)}</div>}</div>}
      {searchOpen && (
        <div className="absolute left-4 right-4 top-[64px] sm:hidden">
          <div className="rounded-xl border border-white/[0.1] bg-[#111] p-2 shadow-2xl">
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.035] px-3">
              <Search size={16} className="text-[#737b85]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search workspace..."
                aria-label="Search workspace"
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#626a73]"
              />
            </div>
            {results.map((result) => (
              <div key={`${result.category}-${result.id}`} className="px-2 py-2 text-xs text-[#d8dee4]">{result.name}</div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
