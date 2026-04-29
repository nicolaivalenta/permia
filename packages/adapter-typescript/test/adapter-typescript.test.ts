import { describe, expect, it } from "vitest";
import {
  guardTypeScriptTool,
  PermiaTypeScriptApprovalRequiredError,
  PermiaTypeScriptBlockedError,
} from "../src";

describe("TypeScript adapter", () => {
  it("can be imported locally", async () => {
    const mod = await import("../src");
    expect(mod.guardTypeScriptTool).toBeTypeOf("function");
  });

  it("throws a local block error before execution", async () => {
    let executed = false;
    const guarded = guardTypeScriptTool({
      id: "browser.credentials.submit",
      execute() {
        executed = true;
        return "done";
      },
    });
    await expect(guarded.execute({})).rejects.toBeInstanceOf(PermiaTypeScriptBlockedError);
    expect(executed).toBe(false);
  });

  it("throws a local approval-required error before execution", async () => {
    let executed = false;
    let approvalSeen = false;
    const guarded = guardTypeScriptTool(
      {
        id: "gmail.messages.send",
        execute() {
          executed = true;
          return "sent";
        },
      },
      {
        onApprovalRequired() {
          approvalSeen = true;
        },
      }
    );
    await expect(guarded.execute({})).rejects.toBeInstanceOf(PermiaTypeScriptApprovalRequiredError);
    expect(approvalSeen).toBe(true);
    expect(executed).toBe(false);
  });
});
