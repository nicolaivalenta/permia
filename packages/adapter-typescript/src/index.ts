import {
  evaluateToolCall,
  type IntentRequest,
  type PolicyProfile,
  type ToolCallDecision,
  type ToolManifest,
} from "@permia/core";

export type TypeScriptTool<Input, Output> = {
  id: string;
  execute(input: Input): Promise<Output> | Output;
};

export type TypeScriptGuardOptions = {
  intent?: string;
  policyProfile?: PolicyProfile;
  mutationAllowance?: NonNullable<IntentRequest["constraints"]>["mutationAllowance"];
  tools?: ToolManifest[];
  onApprovalRequired?: (decision: ToolCallDecision) => Promise<void> | void;
  onDecision?: (decision: ToolCallDecision) => Promise<void> | void;
};

export class PermiaTypeScriptBlockedError extends Error {
  constructor(public readonly decision: ToolCallDecision) {
    super(`Permia blocked ${decision.toolId}`);
    this.name = "PermiaTypeScriptBlockedError";
  }
}

export class PermiaTypeScriptApprovalRequiredError extends Error {
  constructor(public readonly decision: ToolCallDecision) {
    super(`Permia approval required for ${decision.toolId}`);
    this.name = "PermiaTypeScriptApprovalRequiredError";
  }
}

export function guardTypeScriptTool<Input, Output>(
  tool: TypeScriptTool<Input, Output>,
  options: TypeScriptGuardOptions = {}
): TypeScriptTool<Input, Output> {
  return {
    id: tool.id,
    async execute(input: Input) {
      const decision = evaluateToolCall({
        toolId: tool.id,
        intent: options.intent,
        policyProfile: options.policyProfile,
        mutationAllowance: options.mutationAllowance,
        tools: options.tools,
      });
      await options.onDecision?.(decision);
      if (decision.gate === "block") {
        throw new PermiaTypeScriptBlockedError(decision);
      }
      if (decision.gate === "approval_required") {
        await options.onApprovalRequired?.(decision);
        throw new PermiaTypeScriptApprovalRequiredError(decision);
      }
      return tool.execute(input);
    },
  };
}
