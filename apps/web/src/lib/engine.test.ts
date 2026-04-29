import { describe, expect, it } from "vitest";
import { buildPlan, compileIntent, compressContext, scoreTool } from "./engine";
import { toolRegistry } from "./registry";

describe("Permia engine", () => {
  it("compiles refund email intent into payment read and email draft capabilities", () => {
    const capabilities = compileIntent({
      intent: "Check Stripe refund status and draft a Gmail reply to the customer",
    });
    expect(capabilities).toContain("refund.inspect");
    expect(capabilities).toContain("email.draft");
    expect(capabilities).not.toContain("external.email");
  });

  it("compiles draft-and-send refund email intent into an external send gate", () => {
    const capabilities = compileIntent({
      intent: "Check Stripe refund status, draft a Gmail reply, and send it to the customer",
    });
    expect(capabilities).toContain("refund.inspect");
    expect(capabilities).toContain("email.draft");
    expect(capabilities).toContain("email.send");
    expect(capabilities).toContain("external.email");
  });

  it("gates destructive finance actions instead of allowing direct execution", () => {
    const plan = buildPlan({
      intent: "Create a Stripe refund and send the customer an email",
      policyProfile: "finance",
      constraints: { mutationAllowance: "approved_writes" },
    });
    expect(["approval_required", "block"]).toContain(plan.status);
    expect(plan.riskFindings.some((finding) => finding.title.includes("External"))).toBe(true);
  });

  it("blocks cross-tool private-data exfiltration", () => {
    const plan = buildPlan({
      intent: "Export customers who churned last month and email the list to an agency",
      policyProfile: "enterprise",
      constraints: { mutationAllowance: "all" },
    });
    expect(plan.status).toBe("block");
    expect(plan.riskFindings.some((finding) => finding.id === "rf-cross-tool-exfiltration")).toBe(true);
  });

  it("shows context savings against naive tool loading", () => {
    const pack = compressContext("deploy production and notify customers", ["vercel.deployments.promote", "slack.chat.postMessage"], 1200);
    expect(pack.estimatedCompressedTokens).toBeLessThan(pack.estimatedNaiveTokens);
    expect(pack.savingsPercent).toBeGreaterThan(50);
  });

  it("penalizes destructive tools more than read-only alternatives", () => {
    const readTool = toolRegistry.find((tool) => tool.id === "stripe.refunds.retrieve");
    const destructiveTool = toolRegistry.find((tool) => tool.id === "stripe.refunds.create");
    expect(readTool && destructiveTool).toBeTruthy();
    expect(scoreTool(readTool!).score).toBeGreaterThan(scoreTool(destructiveTool!).score);
  });
});
