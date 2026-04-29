import {
  evaluateIntent,
  evaluateToolCall,
  type Gate,
  type IntentRequest,
  type PolicyProfile,
  type PreflightDecision,
  type ToolCallDecision,
  type ToolManifest,
} from "@permia/core";

export type McpToolCall = {
  name?: string;
  toolId?: string;
  arguments?: unknown;
  input?: unknown;
  intent?: string;
};

export type McpAdapterOptions = {
  policyProfile?: PolicyProfile;
  mutationAllowance?: NonNullable<IntentRequest["constraints"]>["mutationAllowance"];
  tools?: ToolManifest[];
};

export type McpAdapterDecision = {
  gate: Gate;
  trace: ToolCallDecision["trace"] | PreflightDecision["trace"];
  toolCall: ToolCallDecision;
  intent?: PreflightDecision;
  toolId: string;
  input: unknown;
};

const gateRank: Record<Gate, number> = {
  allow: 0,
  warn: 1,
  approval_required: 2,
  block: 3,
};

function worstGate(a: Gate, b: Gate): Gate {
  return gateRank[a] >= gateRank[b] ? a : b;
}

export function evaluateMcpToolCall(call: McpToolCall, options: McpAdapterOptions = {}): McpAdapterDecision {
  const toolId = call.toolId ?? call.name;
  if (!toolId) {
    throw new TypeError("MCP tool call requires name or toolId.");
  }

  const toolCall = evaluateToolCall({
    toolId,
    intent: call.intent,
    policyProfile: options.policyProfile,
    mutationAllowance: options.mutationAllowance,
    tools: options.tools,
  });

  const intent = call.intent
    ? evaluateIntent({
        intent: call.intent,
        policyProfile: options.policyProfile,
        tools: options.tools,
        availableTools: [toolId],
        constraints: {
          mutationAllowance: options.mutationAllowance,
        },
      })
    : undefined;

  const gate = intent ? worstGate(toolCall.gate, intent.status) : toolCall.gate;
  return {
    gate,
    trace: intent && gateRank[intent.status] > gateRank[toolCall.gate] ? intent.trace : toolCall.trace,
    toolCall,
    intent,
    toolId,
    input: call.arguments ?? call.input,
  };
}
