import { json } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return json({
    id: `pfc_${crypto.randomUUID().slice(0, 8)}`,
    planId: body.planId ?? "draft_plan",
    status: "draft",
    allowedMutations: body.allowedMutations ?? ["read", "draft"],
    forbiddenSideEffects: ["unapproved money movement", "raw private-data export", "public posting", "secret access"],
    maxSpendUsd: body.maxSpendUsd ?? 0,
    approvalRequired: true,
    rollbackExpectation: "Every write must declare native rollback or compensation.",
  });
}
