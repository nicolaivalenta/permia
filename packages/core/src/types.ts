export type MutationClass = "read" | "draft" | "write" | "destructive";
export type DataSensitivity = "public" | "internal" | "confidential" | "secret";
export type Gate = "allow" | "warn" | "approval_required" | "block";
export type PolicyProfile = "default" | "strict" | "enterprise" | "finance" | "production";

export type ToolSchema = {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
};

export type ToolManifest = {
  id: string;
  vendor: string;
  version: string;
  name: string;
  category: string;
  description: string;
  capabilities: string[];
  authScopes: string[];
  mutation: MutationClass;
  sensitivity: DataSensitivity;
  rollback: "native" | "compensating" | "none";
  verified: boolean;
  schemaStability: number;
  reliability: number;
  schema: ToolSchema;
  source: string;
  schemaExcerpt: string;
  failureModes: string[];
  docsUrl: string;
  docs: string;
};

export type ToolRecord = ToolManifest;

export type IntentRequest = {
  intent: string;
  actor?: {
    agent?: string;
    user?: string;
    org?: string;
    environment?: string;
  };
  constraints?: {
    maxRisk?: number;
    approvalPolicy?: "none" | "risky" | "all_mutations";
    contextBudget?: number;
    authMode?: "none" | "user_oauth" | "service_account" | "scoped_wallet";
    mutationAllowance?: "read_only" | "draft_only" | "approved_writes" | "all";
  };
  availableTools?: string[];
  policyProfile?: PolicyProfile;
  tools?: ToolManifest[];
};

export type ScoreBreakdown = {
  permissionRisk: number;
  mutationRisk: number;
  sensitivityRisk: number;
  rollbackRisk: number;
  stability: number;
  reliability: number;
  verification: number;
  exfiltrationRisk: number;
};

export type RiskFinding = {
  id: string;
  gate: Gate;
  title: string;
  detail: string;
  evidence: string[];
  mitigation: string;
};

export type DecisionTraceEntry = {
  stage: "intent" | "selection" | "scoring" | "policy" | "finding" | "contract";
  code: string;
  message: string;
  evidence: string[];
};

export type DecisionTrace = {
  id: string;
  entries: DecisionTraceEntry[];
};

export type PlanStep = {
  id: string;
  label: string;
  toolId: string;
  toolName: string;
  capability: string;
  mutation: MutationClass;
  gate: Gate;
  reason: string;
};

export type ExecutionPlan = {
  id: string;
  intent: string;
  actor: Required<NonNullable<IntentRequest["actor"]>>;
  policyProfile: PolicyProfile;
  confidence: number;
  status: Gate;
  requiredCapabilities: string[];
  selectedTools: ToolRecord[];
  blockedTools: ToolRecord[];
  steps: PlanStep[];
  alternatives: Array<{ toolId: string; name: string; reason: string; score: number }>;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  riskFindings: RiskFinding[];
  contextPack: ContextPack;
  simulation: SimulationResult;
  approvalRequirement: string;
  preflightContract: PreflightContract;
  auditReplayUrl: string;
  trace: DecisionTrace;
};

export type ContextPack = {
  id: string;
  tokenBudget: number;
  estimatedNaiveTokens: number;
  estimatedCompressedTokens: number;
  savingsPercent: number;
  instructions: string[];
  schemas: Array<{ toolId: string; toolName: string; excerpt: string }>;
  excluded: string[];
};

export type SimulationResult = {
  id: string;
  summary: string;
  transcript: string[];
  blockedActions: string[];
  allowedActions: string[];
  driftChecks: string[];
};

export type PreflightContract = {
  id: string;
  allowedMutations: string[];
  forbiddenSideEffects: string[];
  maxSpendUsd: number;
  approvalRequired: boolean;
  rollbackExpectation: string;
};

export type PreflightDecision = ExecutionPlan;

export type ToolCallRequest = {
  toolId: string;
  intent?: string;
  policyProfile?: PolicyProfile;
  mutationAllowance?: IntentRequest["constraints"] extends infer Constraints
    ? Constraints extends { mutationAllowance?: infer MutationAllowance }
      ? MutationAllowance
      : never
    : never;
  tools?: ToolManifest[];
};

export type ToolCallDecision = {
  id: string;
  gate: Gate;
  toolId: string;
  score: number;
  reason: string;
  trace: DecisionTrace;
};

export type ToolScore = {
  score: number;
  breakdown: ScoreBreakdown;
  rationale: string[];
};
