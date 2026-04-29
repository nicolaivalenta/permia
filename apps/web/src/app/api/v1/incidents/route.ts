import { json } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const incident = await prisma.incident.create({
    data: {
      id: `inc_${crypto.randomUUID().slice(0, 8)}`,
      severity: body.severity ?? "high",
      title: body.title ?? "Suspicious agent action",
      timeline: JSON.stringify(body.timeline ?? ["policy gate tripped", "permissions frozen", "audit exported"]),
      remediation: JSON.stringify(body.remediation ?? ["revoke grant", "quarantine tool", "review affected resources"]),
    },
  });
  return json(incident);
}
