"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bug,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileBarChart2,
  FolderKanban,
  History,
  LayoutDashboard,
  ScanSearch,
  Settings2,
  ShieldCheck,
  UploadCloud,
  Users,
  X,
} from "lucide-react";

const navigation = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "projects", label: "Projects", href: "/projects", icon: FolderKanban },
  { key: "upload", label: "New analysis", href: "/upload", icon: UploadCloud },
  { key: "analysis", label: "Analysis", href: "/analysis", icon: ScanSearch },
  { key: "issues", label: "Issues", href: "/issues", icon: Bug },
  { key: "reports", label: "Reports", href: "/reports", icon: FileBarChart2 },
  { key: "history", label: "History", href: "/history", icon: History },
];

const administration = [
  { key: "users", label: "Team", href: "/users", icon: Users },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings2 },
  { key: "help", label: "Help & support", href: "/help", icon: CircleHelp },
];

type SidebarUser = {
  name?: string | null;
  fullName?: string | null;
  role?: string | null;
  image?: string | null;
};

type SidebarProps = {
  user?: SidebarUser;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onToggle?: () => void;
  onMobileClose?: () => void;
};

export default function Sidebar({
  user,
  collapsed = false,
  mobileOpen = false,
  onToggle,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const displayName = user?.name || user?.fullName || "Account";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const renderLink = (item: (typeof navigation)[number]) => {
    const Icon = item.icon;
    const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

    return (
      <Link
        key={item.key}
        href={item.href}
        title={collapsed ? item.label : undefined}
        onClick={onMobileClose}
        className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
          active
            ? "bg-[#e3b341]/10 text-[#f7d774]"
            : "text-[#8b949e] hover:bg-white/[0.045] hover:text-white"
        } ${collapsed ? "justify-center px-0" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        {active && <span className="absolute left-0 h-6 w-0.5 rounded-full bg-[#e3b341]" />}
        <Icon size={18} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/70 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        aria-label="Primary navigation"
        className={`fixed inset-y-0 left-0 z-40 flex h-[100dvh] w-[260px] flex-col overflow-y-auto border-r border-white/[0.08] bg-[#070707] px-3 py-5 transition-transform duration-200 lg:sticky lg:top-0 lg:h-[100dvh] lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[80px]" : ""}`}
      >
        <div className={`mb-8 flex items-center ${collapsed ? "justify-center" : "justify-between px-2"}`}>
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onMobileClose}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e3b341]/25 bg-[#e3b341]/10 text-[#e3b341]">
              <ShieldCheck size={21} strokeWidth={2.2} aria-hidden="true" />
            </span>
            {!collapsed && (
              <span>
                <span className="block text-[15px] font-semibold tracking-tight text-white">ReqGuard</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6f7780]">
                  Intelligence
                </span>
              </span>
            )}
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-[#8b949e] hover:bg-white/[0.06] hover:text-white lg:hidden"
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1" aria-label="Workspace">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#59616a]">
              Workspace
            </p>
          )}
          {navigation.map(renderLink)}
          {!collapsed && (
            <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#59616a]">
              Administration
            </p>
          )}
          {administration.map(renderLink)}
        </nav>

        <div className="mt-5 space-y-3">
          <div className={`rounded-xl border border-white/[0.08] bg-white/[0.025] p-2 ${collapsed ? "flex justify-center" : ""}`}>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1b1b1b] text-xs font-semibold text-[#e3b341]">
                {initials}
              </span>
              {!collapsed && (
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-white">{displayName}</span>
                  <span className="block truncate text-[11px] capitalize text-[#717984]">
                    {(user?.role || "Administrator").toLowerCase().replace("_", " ")}
                  </span>
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="hidden h-9 w-full items-center justify-center rounded-lg border border-white/[0.08] text-[#737b85] transition-colors hover:bg-white/[0.05] hover:text-white lg:flex"
            onClick={onToggle}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="ml-2 text-xs">Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
