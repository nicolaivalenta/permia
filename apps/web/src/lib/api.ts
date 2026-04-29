import { NextResponse } from "next/server";
import { z } from "zod";

export const intentSchema = z.object({
  intent: z.string().min(1).max(3000),
  actor: z
    .object({
      agent: z.string().optional(),
      user: z.string().optional(),
      org: z.string().optional(),
      environment: z.string().optional(),
    })
    .optional(),
  constraints: z
    .object({
      maxRisk: z.number().min(0).max(100).optional(),
      approvalPolicy: z.enum(["none", "risky", "all_mutations"]).optional(),
      contextBudget: z.number().min(200).max(10000).optional(),
      authMode: z.enum(["none", "user_oauth", "service_account", "scoped_wallet"]).optional(),
      mutationAllowance: z.enum(["read_only", "draft_only", "approved_writes", "all"]).optional(),
    })
    .optional(),
  availableTools: z.array(z.string()).optional(),
  policyProfile: z.enum(["default", "strict", "enterprise", "finance", "production"]).optional(),
});

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Permia": "intent-firewall",
    },
  });
}

export function validationError(error: z.ZodError) {
  return json(
    {
      error: "validation_error",
      issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    },
    400
  );
}
