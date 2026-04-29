import { buildPlan } from "@/lib/engine";
import { intentSchema, json, validationError } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = intentSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const plan = buildPlan(parsed.data);

  await prisma.auditEvent.upsert({
    where: { id: plan.id },
    create: {
      id: plan.id,
      intent: plan.intent,
      actor: plan.actor.agent,
      risk: plan.status,
      status: plan.status,
      summary: plan.approvalRequirement,
      payload: JSON.stringify(plan),
    },
    update: {
      risk: plan.status,
      status: plan.status,
      summary: plan.approvalRequirement,
      payload: JSON.stringify(plan),
    },
  });

  return json(plan);
}
