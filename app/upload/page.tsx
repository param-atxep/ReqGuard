import DashboardShell from "../../components/dashboard/DashboardShell";
import UploadClient from "../../components/upload/UploadClient";
import { requirePageAuth } from "../../lib/session";

export const dynamic = "force-dynamic";
export default async function UploadPage() {
  const session = await requirePageAuth();
  return <DashboardShell user={session.user as { id?: string; name?: string; role?: string; image?: string }}><UploadClient /></DashboardShell>;
}
