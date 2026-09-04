"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import SupportAssistant from "./SupportAssistant";

type DashboardUser = {
  name?: string | null;
  fullName?: string | null;
  role?: string | null;
  image?: string | null;
};

export default function DashboardShell({
  user,
  children,
}: {
  user?: DashboardUser;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] overflow-hidden bg-[#050505] text-white lg:h-[100dvh] lg:flex">
      <Sidebar
        user={user}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((value) => !value)}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-0">
        <TopNav user={user} onMenuToggle={() => setMobileOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto"><div className="mx-auto w-full max-w-[1540px] min-w-0 px-4 pb-10 sm:px-6 lg:px-8">{children}</div></main>
        <SupportAssistant />
      </div>
    </div>
  );
}
