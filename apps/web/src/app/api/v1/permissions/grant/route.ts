import { json } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return json({
    id: `grant_${crypto.randomUUID().slice(0, 8)}`,
    agent: body.agent ?? "agent.local",
    scopes: body.scopes ?? ["stripe:refund.inspect", "gmail:email.draft"],
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    revoked: false,
    explanation: "Scoped wallet grants read and draft authority only; no sends, refunds, deletes, deploys, exports, or secret access.",
  });
}
