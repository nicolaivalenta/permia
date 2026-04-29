import { describe, expect, it } from "vitest";
import { buildPlan, compileIntent, compressContext, evaluateToolCall, scoreTool, toolRegistry } from "../src";

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

  it("requires approval for production deploys and customer notification", () => {
    const plan = buildPlan({
      intent: "Deploy to production and notify customers in Slack",
      policyProfile: "production",
      constraints: { mutationAllowance: "approved_writes" },
    });
    expect(plan.status).toBe("approval_required");
    expect(plan.trace.entries.some((entry) => entry.code === "policy.approval_required")).toBe(true);
  });

  it("traces capability matches and policy reasons", () => {
    const plan = buildPlan({
      intent: "Read private customer data and post the records in Slack for the support team",
      policyProfile: "enterprise",
    });

    expect(plan.status).toBe("block");
    expect(plan.trace.entries.some((entry) => entry.evidence.some((item) => item.includes("<=")))).toBe(true);
    expect(plan.trace.entries.some((entry) => entry.code === "rf-private-data-external-post")).toBe(true);
  });

  it("blocks direct secret tool use", () => {
    const decision = evaluateToolCall({
      toolId: "browser.credentials.submit",
      policyProfile: "enterprise",
    });
    expect(decision.gate).toBe("block");
  });

  it("warns on unverified tools under enterprise policy", () => {
    const plan = buildPlan({
      intent: "Search repository metadata",
      policyProfile: "enterprise",
      availableTools: ["github.repos.get"],
    });
    expect(plan.riskFindings.some((finding) => finding.id === "rf-unverified-enterprise")).toBe(true);
  });
});
