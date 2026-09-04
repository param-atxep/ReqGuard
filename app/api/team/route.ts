import { GET as getMembers } from "./members/route";
import { POST as createInvitation } from "./invitations/route";

export async function GET(req: Request) {
  return getMembers(req);
}

export async function POST(req: Request) {
  return createInvitation(req);
}
