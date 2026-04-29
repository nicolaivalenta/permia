import { json } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = body.id ?? `audit_${crypto.randomUUID().slice(0, 10)}`;
  const payload = body.decision ?? body;
  const audit = await prisma.auditEvent.create({
    data: {
      id,
      intent: payload.intent ?? body.intent ?? "tool_call",
      actor: payload.actor?.agent ?? body.actor ?? "local-sdk",
      risk: payload.status ?? payload.gate ?? "unknown",
      status: payload.status ?? payload.gate ?? "unknown",
      summary: payload.approvalRequirement ?? payload.reason ?? "SDK audit event",
      payload: JSON.stringify(payload),
    },
  });
  return json(audit, 201);
}
