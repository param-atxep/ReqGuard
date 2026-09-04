import DashboardShell from "../../components/dashboard/DashboardShell";
import ProjectsClient from "../../components/projects/ProjectsClient";
import { requirePageAuth } from "../../lib/session";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await requirePageAuth();
  const user = session?.user as { name?: string; role?: string; image?: string } | undefined;
  return (
    <DashboardShell user={user}>
      <ProjectsClient />
    </DashboardShell>
  );
}
