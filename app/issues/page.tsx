import DashboardShell from "../../components/dashboard/DashboardShell";
import IssuesClient from "../../components/issues/IssuesClient";
import { requirePageAuth } from "../../lib/session";
export default async function IssuesPage() { const session = await requirePageAuth(); return <DashboardShell user={session.user as { name?: string; role?: string; image?: string }}><IssuesClient /></DashboardShell>; }
