import { describe, expect, it } from "vitest";
import { evaluateMcpToolCall } from "../src";

describe("MCP adapter", () => {
  it("can be imported locally", async () => {
    const mod = await import("../src");
    expect(mod.evaluateMcpToolCall).toBeTypeOf("function");
  });

  it("blocks a policy-blocked tool call", () => {
    const decision = evaluateMcpToolCall({
      name: "browser.credentials.submit",
      arguments: { actor: "agent" },
    });
    expect(decision.gate).toBe("block");
    expect(decision.toolCall.gate).toBe("block");
    expect(decision.input).toEqual({ actor: "agent" });
    expect(decision.trace.entries.length).toBeGreaterThan(0);
  });

  it("requires approval when intent evaluation is riskier than the direct call", () => {
    const decision = evaluateMcpToolCall({
      toolId: "gmail.messages.send",
      input: { to: "customer@example.com" },
      intent: "Send the email to the customer",
    });
    expect(decision.gate).toBe("approval_required");
    expect(decision.intent?.status).toBe("approval_required");
  });
});
