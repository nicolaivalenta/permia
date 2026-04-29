import { describe, expect, it } from "vitest";
import { guardOpenAITool } from "../src";

describe("OpenAI adapter", () => {
  it("can be imported locally", async () => {
    const mod = await import("../src");
    expect(mod.guardOpenAITool).toBeTypeOf("function");
  });

  it("blocks a policy-blocked tool definition", () => {
    const tool = guardOpenAITool({
      type: "function",
      function: {
        name: "browser.credentials.submit",
        parameters: { type: "object" },
      },
    });
    const decision = tool.evaluate();
    expect(decision.gate).toBe("block");
    expect(tool.shouldExecute()).toBe(false);
  });

  it("reports approval-required metadata without importing an OpenAI SDK", () => {
    const tool = guardOpenAITool({
      type: "function",
      function: {
        name: "gmail.messages.send",
        description: "Send an email",
      },
    });
    expect(tool.metadata).toMatchObject({
      guardedBy: "permia",
      toolId: "gmail.messages.send",
      policyProfile: "default",
    });
    expect(tool.evaluate().gate).toBe("approval_required");
  });
});
