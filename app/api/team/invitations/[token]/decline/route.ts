import { POST as respond } from "../route";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return respond(new Request(req.url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "decline" }) }), { params: Promise.resolve({ token }) });
}
