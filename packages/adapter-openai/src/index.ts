import {
  evaluateToolCall,
  type Gate,
  type IntentRequest,
  type PolicyProfile,
  type ToolCallDecision,
  type ToolManifest,
} from "@permia/core";

export type OpenAIToolDefinition = {
  type?: "function";
  name?: string;
  description?: string;
  parameters?: Record<string, unknown>;
  function?: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type OpenAIAdapterOptions = {
  toolId?: string;
  intent?: string;
  policyProfile?: PolicyProfile;
  mutationAllowance?: NonNullable<IntentRequest["constraints"]>["mutationAllowance"];
  tools?: ToolManifest[];
};

export type GuardedOpenAITool<TDefinition extends OpenAIToolDefinition> = {
  definition: TDefinition;
  metadata: {
    guardedBy: "permia";
    toolId: string;
    policyProfile: PolicyProfile;
  };
  evaluate(input?: { intent?: string }): ToolCallDecision;
  shouldExecute(input?: { intent?: string }): boolean;
};

function toolName(definition: OpenAIToolDefinition): string | undefined {
  return definition.function?.name ?? definition.name;
}

export function guardOpenAITool<TDefinition extends OpenAIToolDefinition>(
  definition: TDefinition,
  options: OpenAIAdapterOptions = {}
): GuardedOpenAITool<TDefinition> {
  const toolId = options.toolId ?? toolName(definition);
  if (!toolId) {
    throw new TypeError("OpenAI-style tool definition requires function.name, name, or options.toolId.");
  }

  const policyProfile = options.policyProfile ?? "default";
  const evaluate = (input?: { intent?: string }) =>
    evaluateToolCall({
      toolId,
      intent: input?.intent ?? options.intent,
      policyProfile,
      mutationAllowance: options.mutationAllowance,
      tools: options.tools,
    });

  return {
    definition,
    metadata: {
      guardedBy: "permia",
      toolId,
      policyProfile,
    },
    evaluate,
    shouldExecute(input) {
      const gate: Gate = evaluate(input).gate;
      return gate === "allow" || gate === "warn";
    },
  };
}
