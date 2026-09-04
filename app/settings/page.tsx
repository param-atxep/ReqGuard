import DashboardShell from "../../components/dashboard/DashboardShell";
import SettingsClient from "../../components/settings/SettingsClient";
import { requirePageAuth } from "../../lib/session";
export default async function SettingsPage() { const session = await requirePageAuth(); return <DashboardShell user={session.user as { name?: string; role?: string; image?: string }}><SettingsClient /></DashboardShell>; }
