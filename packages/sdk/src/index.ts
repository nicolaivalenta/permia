import {
  createAuditEvent,
  evaluateIntent,
  evaluateToolCall,
  type AuditChainEvent,
  type Gate,
  type IntentRequest,
  type PolicyProfile,
  type PreflightDecision,
  type ToolCallDecision,
  type ToolCallRequest,
  type ToolManifest,
} from "@permia/core";
export {
  createForwardedEvent,
  createHttpForwarder,
  PermiaForwardAuthError,
  PermiaForwardRateLimitError,
  PermiaForwardRetryError,
  type ForwardedEvent,
  type Forwarder,
} from "./forwarding.js";

export type AuditSink = (event: {
  kind: "preflight" | "tool_call";
  decision: PreflightDecision | ToolCallDecision;
  auditEvent?: AuditChainEvent;
}) => void | Promise<void>;

export type PermiaClientOptions = {
  baseUrl?: string;
  apiKey?: string;
  policyProfile?: PolicyProfile;
  tools?: ToolManifest[];
  auditSink?: AuditSink;
};

export type GuardedTool<Input, Output> = {
  id: string;
  execute(input: Input): Promise<Output> | Output;
};

export class PermiaApprovalRequiredError extends Error {
  constructor(public readonly decision: ToolCallDecision) {
    super(`Permia approval required for ${decision.toolId}`);
    this.name = "PermiaApprovalRequiredError";
  }
}

export class PermiaBlockedError extends Error {
  constructor(public readonly decision: ToolCallDecision) {
    super(`Permia blocked ${decision.toolId}`);
    this.name = "PermiaBlockedError";
  }
}

export class PermiaClient {
  private auditSequence = 0;

  constructor(private readonly options: PermiaClientOptions = {}) {}

  async preflight(input: IntentRequest): Promise<PreflightDecision> {
    const request = {
      ...input,
      policyProfile: input.policyProfile ?? this.options.policyProfile,
      tools: input.tools ?? this.options.tools,
    };
    const decision = this.options.baseUrl
      ? await this.post<PreflightDecision>("/api/v1/intent", request)
      : evaluateIntent(request);
    await this.emitAudit("preflight", decision);
    return decision;
  }

  async evaluateToolCall(input: ToolCallRequest): Promise<ToolCallDecision> {
    const request = {
      ...input,
      policyProfile: input.policyProfile ?? this.options.policyProfile,
      tools: input.tools ?? this.options.tools,
    };
    const decision = this.options.baseUrl
      ? await this.post<ToolCallDecision>("/api/v1/tool-call/evaluate", request)
      : evaluateToolCall(request);
    await this.emitAudit("tool_call", decision);
    return decision;
  }

  private async emitAudit(kind: "preflight" | "tool_call", decision: PreflightDecision | ToolCallDecision) {
    this.auditSequence += 1;
    const auditEvent = await createAuditEvent({
      chainId: "local",
      sequence: this.auditSequence,
      kind,
      gate: "status" in decision ? decision.status : decision.gate,
      subjectId: "intent" in decision ? decision.id : decision.toolId,
      policyProfile: "policyProfile" in decision ? decision.policyProfile : "default",
      trace: decision.trace,
      payload: decision,
    });
    await this.options.auditSink?.({ kind, decision, auditEvent });
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.options.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.options.apiKey ? { Authorization: `Bearer ${this.options.apiKey}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Permia request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }
}

export function createLocalPolicy(profile: PolicyProfile = "default") {
  return { policyProfile: profile };
}

export function shouldExecute(gate: Gate) {
  return gate === "allow" || gate === "warn";
}

export function withPermiaToolGuard<Input, Output>(
  tool: GuardedTool<Input, Output>,
  options: PermiaClientOptions & { intent?: string; onApprovalRequired?: (decision: ToolCallDecision) => void | Promise<void> } = {}
): GuardedTool<Input, Output> {
  const client = new PermiaClient(options);
  return {
    id: tool.id,
    async execute(input: Input) {
      const decision = await client.evaluateToolCall({
        toolId: tool.id,
        intent: options.intent,
        policyProfile: options.policyProfile,
        tools: options.tools,
      });
      if (decision.gate === "block") throw new PermiaBlockedError(decision);
      if (decision.gate === "approval_required") {
        await options.onApprovalRequired?.(decision);
        throw new PermiaApprovalRequiredError(decision);
      }
      return tool.execute(input);
    },
  };
}
