import DashboardShell from "../../components/dashboard/DashboardShell";
import TeamClient from "../../components/team/TeamClient";
import { requirePageAuth } from "../../lib/session";
export const dynamic = "force-dynamic";
export default async function UsersPage() { const session = await requirePageAuth(); return <DashboardShell user={session.user as { name?: string; role?: string; image?: string }}><TeamClient /></DashboardShell>; }
