import { toolRegistry } from "./registry.js";
import {
  ContextPack,
  DecisionTrace,
  DecisionTraceEntry,
  ExecutionPlan,
  Gate,
  IntentRequest,
  MutationClass,
  PolicyProfile,
  PreflightDecision,
  PreflightContract,
  RiskFinding,
  ScoreBreakdown,
  SimulationResult,
  ToolCallDecision,
  ToolCallRequest,
  ToolRecord,
  ToolScore,
} from "./types.js";

const capabilityLexicon: Record<string, string[]> = {
  "refund.inspect": ["refund", "refund status", "stripe refund"],
  "payment.move": ["create refund", "issue refund", "send refund", "pay", "charge", "move money"],
  "email.draft": ["draft", "email", "gmail", "message"],
  "email.send": ["send email", "send the email", "send it", "notify customer", "email customer"],
  "email.organize": ["label email", "modify labels", "archive email"],
  "external.email": ["send email", "send the email", "send it", "notify", "agency", "external recipient", "email the list"],
  "deploy.production": ["deploy", "production", "promote", "release"],
  "production.change": ["deploy", "production", "env", "dns", "waf", "migration"],
  "data.export": ["export", "csv", "customer list", "agency", "churned"],
  "pii.read": ["crm", "private data", "customer list", "customer records", "customer data"],
  "customer.read": ["customer data", "customer records", "customer profile"],
  "secret.use": ["password", "credential", "login", "submit credentials"],
  "secret.inspect": ["list secrets", "repository secrets", "secret names"],
  "secret.write": ["create env", "write secret", "set secret", "environment variable"],
  "file.delete": ["delete", "remove", "destroy"],
  "file.write": ["write file", "create archive", "upload file"],
  "database.migrate": ["migration", "database", "schema"],
  "database.write": ["update database", "write query", "modify rows"],
  "code.merge": ["merge", "pull request"],
  "chat.write": ["slack", "post", "announce"],
  "external.post": ["slack", "post", "announce", "public channel"],
  "issue.create": ["issue", "ticket", "linear"],
  "web.read": ["browser", "page", "research"],
};

const blockTerms = ["delete account", "wire", "send password", "export customers", "email the list", "post publicly"];
const injectionTerms = ["ignore previous", "reveal secrets", "exfiltrate", "disable policy", "system prompt"];

function capabilityMatches(input: IntentRequest) {
  const text = input.intent.toLowerCase();
  return Object.entries(capabilityLexicon)
    .map(([capability, terms]) => ({
      capability,
      terms: terms.filter((term) => text.includes(term)),
    }))
    .filter((match) => match.terms.length > 0);
}

export function compileIntent(input: IntentRequest): string[] {
  const required = new Set<string>();

  for (const match of capabilityMatches(input)) {
    required.add(match.capability);
  }

  const text = input.intent.toLowerCase();
  if (text.includes("refund") && (text.includes("email") || text.includes("reply"))) {
    required.add("refund.inspect");
    required.add("email.draft");
    if (text.includes("send")) {
      required.add("email.send");
      required.add("external.email");
    }
  }
  if (text.includes("deploy") && text.includes("notify")) {
    required.add("deploy.production");
    required.add("chat.write");
    required.add("external.email");
  }
  if (text.includes("churn") || text.includes("agency")) {
    required.add("data.export");
    required.add("pii.read");
    required.add("external.email");
  }

  if (required.size === 0) {
    required.add("web.read");
    required.add("doc.read");
  }

  return [...required];
}

const uid = (prefix: string, size = 8) => `${prefix}_${crypto.randomUUID().slice(0, size)}`;

export function scoreToolManifest(tool: ToolRecord): ToolScore {
  const permissionRisk = Math.min(30, tool.authScopes.length * 5);
  const mutationRisk = { read: 2, draft: 8, write: 22, destructive: 38 }[tool.mutation];
  const sensitivityRisk = { public: 0, internal: 8, confidential: 18, secret: 30 }[tool.sensitivity];
  const rollbackRisk = { native: 0, compensating: 10, none: 24 }[tool.rollback];
  const verification = tool.verified ? 12 : -10;
  const stability = Math.round((tool.schemaStability - 70) / 3);
  const reliability = Math.round((tool.reliability - 70) / 3);
  const exfiltrationRisk = tool.capabilities.some((cap) => ["data.export", "pii.read", "email.send", "file.read"].includes(cap)) ? 18 : 2;
  const raw = 100 - permissionRisk - mutationRisk - sensitivityRisk - rollbackRisk - exfiltrationRisk + verification + stability + reliability;
  const score = Math.max(1, Math.min(99, raw));

  return {
    score,
    breakdown: { permissionRisk, mutationRisk, sensitivityRisk, rollbackRisk, stability, reliability, verification, exfiltrationRisk },
    rationale: [
      `${tool.mutation} mutation class`,
      `${tool.sensitivity} data sensitivity`,
      `${tool.rollback} rollback posture`,
      tool.verified ? "vendor manifest is verified" : "vendor manifest is not verified",
    ],
  };
}

export const scoreTool = scoreToolManifest;

function gateFor(tool: ToolRecord, profile: PolicyProfile, mutationAllowance?: string): Gate {
  if (mutationAllowance === "read_only" && tool.mutation !== "read") return "block";
  if (mutationAllowance === "draft_only" && !["read", "draft"].includes(tool.mutation)) return "block";
  if (tool.sensitivity === "secret") return "block";
  if (profile === "finance" && tool.capabilities.some((cap) => cap.includes("payment.move"))) return "approval_required";
  if (profile === "production" && tool.capabilities.some((cap) => cap.includes("production.change"))) return "approval_required";
  if (profile === "strict" && tool.mutation === "write") return "approval_required";
  if (tool.mutation === "destructive") return "approval_required";
  if (tool.capabilities.includes("external.email") || tool.capabilities.includes("external.post")) return "approval_required";
  if (tool.sensitivity === "confidential" && tool.capabilities.includes("data.export")) return "block";
  if (tool.mutation === "write") return "warn";
  return "allow";
}

function reasonForGate(gate: Gate): string {
  if (gate === "block") return "Tool call violates policy and must not execute.";
  if (gate === "approval_required") return "Tool call is risky enough to require human approval before execution.";
  if (gate === "warn") return "Tool call can execute with an audit warning.";
  return "Tool call is inside current policy.";
}

function makeFindings(input: IntentRequest, tools: ToolRecord[], profile: PolicyProfile): RiskFinding[] {
  const text = input.intent.toLowerCase();
  const findings: RiskFinding[] = [];
  const destructive = tools.filter((tool) => tool.mutation === "destructive");
  const external = tools.filter((tool) => tool.capabilities.some((cap) => cap.startsWith("external.")));
  const exportTool = tools.find((tool) => tool.capabilities.includes("data.export"));
  const piiTool = tools.find((tool) => tool.capabilities.includes("pii.read"));
  const secretTool = tools.find((tool) => tool.sensitivity === "secret" || tool.capabilities.some((cap) => cap.startsWith("secret.")));
  const databaseMutation = tools.filter((tool) => tool.capabilities.includes("database.migrate") || tool.capabilities.includes("database.write"));
  const fileDelete = tools.find((tool) => tool.capabilities.includes("file.delete"));

  if (destructive.length > 0) {
    findings.push({
      id: "rf-destructive",
      gate: "approval_required",
      title: "Irreversible or production mutation",
      detail: "One or more selected tools can change money, production, DNS, secrets, or persistent records.",
      evidence: destructive.map((tool) => tool.id),
      mitigation: "Require a preflight contract, human approval, and rollback or compensation plan.",
    });
  }
  if (external.length > 0) {
    findings.push({
      id: "rf-external",
      gate: "approval_required",
      title: "External communication",
      detail: "The plan reaches outside the organization through email, chat, invites, or public posts.",
      evidence: external.map((tool) => tool.id),
      mitigation: "Allow drafts and previews, block sending until a human approves the final payload.",
    });
  }
  if (exportTool && piiTool) {
    findings.push({
      id: "rf-cross-tool-exfiltration",
      gate: "block",
      title: "Cross-tool exfiltration chain",
      detail: "Read customer data plus export or external messaging can leak private information even if each tool looks safe alone.",
      evidence: [exportTool.id, piiTool.id],
      mitigation: "Return aggregate counts or anonymized segments; prohibit raw customer export to external recipients.",
    });
  }
  if (piiTool && external.length > 0) {
    findings.push({
      id: "rf-private-data-external-post",
      gate: "block",
      title: "Private data leaves the trust boundary",
      detail: "Private customer data combined with an external post or message creates an exfiltration path.",
      evidence: [piiTool.id, ...external.map((tool) => tool.id)],
      mitigation: "Summarize without identifiers or require a human-approved sanitized payload.",
    });
  }
  if (secretTool) {
    findings.push({
      id: "rf-secret-access",
      gate: "block",
      title: "Secret access",
      detail: "The selected tool can expose or submit credentials, secrets, or sensitive auth material.",
      evidence: [secretTool.id],
      mitigation: "Require a narrow secret broker flow that never reveals raw values to the agent.",
    });
  }
  if (databaseMutation.length > 0) {
    findings.push({
      id: "rf-database-mutation",
      gate: "approval_required",
      title: "Database mutation",
      detail: "The plan can change database state or schema and needs an explicit review point.",
      evidence: databaseMutation.map((tool) => tool.id),
      mitigation: "Run read-only inspection and dry-run migration output before human approval.",
    });
  }
  if (fileDelete) {
    findings.push({
      id: "rf-file-deletion",
      gate: "approval_required",
      title: "Local file deletion",
      detail: "The plan can delete local files and should pause before irreversible local data loss.",
      evidence: [fileDelete.id],
      mitigation: "Create an explicit deletion list and require confirmation before execution.",
    });
  }
  if (blockTerms.some((term) => text.includes(term))) {
    findings.push({
      id: "rf-policy-keyword",
      gate: "block",
      title: "High-risk intent phrase",
      detail: "The intent contains language associated with account deletion, customer export, public posting, or money movement.",
      evidence: blockTerms.filter((term) => text.includes(term)),
      mitigation: "Decompose into read-only inspection plus an approval-gated mutation.",
    });
  }
  if (injectionTerms.some((term) => text.includes(term))) {
    findings.push({
      id: "rf-prompt-injection",
      gate: "block",
      title: "Prompt injection pattern",
      detail: "The request contains instructions that try to override policy or reveal hidden context.",
      evidence: injectionTerms.filter((term) => text.includes(term)),
      mitigation: "Treat as hostile input and require a clean restatement of the goal.",
    });
  }
  if (profile === "enterprise" && tools.some((tool) => !tool.verified)) {
    findings.push({
      id: "rf-unverified-enterprise",
      gate: "warn",
      title: "Unverified tool in enterprise profile",
      detail: "Enterprise policies prefer signed or verified manifests.",
      evidence: tools.filter((tool) => !tool.verified).map((tool) => tool.id),
      mitigation: "Use verified alternatives where available or quarantine pending vendor attestation.",
    });
  }

  return findings;
}

function worstGate(gates: Gate[]): Gate {
  if (gates.includes("block")) return "block";
  if (gates.includes("approval_required")) return "approval_required";
  if (gates.includes("warn")) return "warn";
  return "allow";
}

function createContextPack(tools: ToolRecord[], input: IntentRequest): ContextPack {
  const budget = input.constraints?.contextBudget ?? 1200;
  const naive = tools.length * 760 + 4200;
  const compressed = Math.min(budget, 260 + tools.length * 145);
  return {
    id: `ctx_${crypto.randomUUID().slice(0, 8)}`,
    tokenBudget: budget,
    estimatedNaiveTokens: naive,
    estimatedCompressedTokens: compressed,
    savingsPercent: Math.round((1 - compressed / naive) * 100),
    instructions: [
      "Use only the selected tools and schema excerpts.",
      "Run read-only inspection before any mutation.",
      "Stop if a response shape differs from the preflight contract.",
      "Never send external messages or move money without approval.",
    ],
    schemas: tools.map((tool) => ({ toolId: tool.id, toolName: tool.name, excerpt: tool.schemaExcerpt })),
    excluded: toolRegistry.filter((tool) => !tools.includes(tool)).slice(0, 14).map((tool) => tool.id),
  };
}

function simulate(steps: { gate: Gate; toolName: string; label: string }[]): SimulationResult {
  const blocked = steps.filter((step) => step.gate === "block" || step.gate === "approval_required");
  return {
    id: `sim_${crypto.randomUUID().slice(0, 8)}`,
    summary: blocked.length
      ? `${blocked.length} action(s) stopped before real-world mutation.`
      : "All actions can run under current policy.",
    transcript: steps.map((step, index) => `${index + 1}. ${step.label} via ${step.toolName}: ${step.gate}`),
    blockedActions: blocked.map((step) => step.label),
    allowedActions: steps.filter((step) => step.gate === "allow" || step.gate === "warn").map((step) => step.label),
    driftChecks: ["schema hash matches seed manifest", "auth scope within declared policy", "dry_run required before mutation"],
  };
}

function createContract(status: Gate, profile: PolicyProfile): PreflightContract {
  return {
    id: uid("pfc"),
    allowedMutations: status === "allow" ? ["read", "draft"] : ["read"],
    forbiddenSideEffects: ["unapproved money movement", "raw customer export", "public posting", "secret exfiltration"],
    maxSpendUsd: profile === "finance" ? 0 : 5,
    approvalRequired: status === "approval_required" || status === "block",
    rollbackExpectation: status === "block" ? "No execution allowed" : "Native rollback or compensation plan required for every write.",
  };
}

function createTrace(entries: DecisionTraceEntry[]): DecisionTrace {
  return {
    id: uid("trace"),
    entries,
  };
}

export function evaluateIntent(input: IntentRequest): PreflightDecision {
  const policyProfile = input.policyProfile ?? "default";
  const capabilities = compileIntent(input);
  const matches = capabilityMatches(input);
  const allowlist = input.availableTools;
  const registry = input.tools?.length ? input.tools : toolRegistry;
  const traceEntries: DecisionTraceEntry[] = [
    {
      stage: "intent",
      code: "intent.compiled",
      message: "Intent was compiled into normalized capabilities.",
      evidence: matches.length
        ? matches.map((match) => `${match.capability} <= ${match.terms.join(", ")}`)
        : capabilities,
    },
  ];
  const candidates = registry.filter((tool) =>
    (!allowlist || allowlist.includes(tool.id)) &&
    tool.capabilities.some((cap) => capabilities.includes(cap))
  );
  const selected = capabilities
    .map((capability) =>
      candidates
        .filter((tool) => tool.capabilities.includes(capability))
        .sort((a, b) => scoreTool(b).score - scoreTool(a).score)[0]
    )
    .filter(Boolean)
    .filter((tool, index, list) => list.findIndex((candidate) => candidate.id === tool.id) === index) as ToolRecord[];
  const selectedTools = selected.length ? selected : registry.slice(0, 3);
  traceEntries.push({
    stage: "selection",
    code: "tools.selected",
    message: "Candidate tool manifests were ranked by capability fit and risk score.",
    evidence: selectedTools.map((tool) => {
      const matched = tool.capabilities.filter((capability) => capabilities.includes(capability));
      return `${tool.id} matched ${matched.join(", ") || tool.capabilities[0]}`;
    }),
  });
  const gates = selectedTools.map((tool) => gateFor(tool, policyProfile, input.constraints?.mutationAllowance));
  const findings = makeFindings(input, selectedTools, policyProfile);
  const status = worstGate([...gates, ...findings.map((finding) => finding.gate)]);
  const scored = selectedTools.map(scoreTool);
  const avgScore = Math.round(scored.reduce((sum, next) => sum + next.score, 0) / scored.length);
  const breakdown = scored[0]?.breakdown ?? scoreTool(registry[0]).breakdown;
  const planId = uid("plan", 10);
  const steps = selectedTools.map((tool, index) => ({
    id: `step_${index + 1}`,
    label: tool.description,
    toolId: tool.id,
    toolName: `${tool.vendor} ${tool.name}`,
    capability: tool.capabilities.find((cap) => capabilities.includes(cap)) ?? tool.capabilities[0],
    mutation: tool.mutation as MutationClass,
    gate: gates[index],
    reason: scoreTool(tool).rationale.join("; "),
  }));
  const contextPack = createContextPack(selectedTools, input);
  const simulation = simulate(steps);
  traceEntries.push(
    {
      stage: "scoring",
      code: "tools.scored",
      message: "Selected tool manifests were scored for permissions, mutation risk, sensitivity, rollback, verification, stability, and reliability.",
      evidence: selectedTools.map((tool, index) => `${tool.id}:${scored[index].score}`),
    },
    {
      stage: "policy",
      code: `policy.${status}`,
      message: `Worst policy gate resolved to ${status}.`,
      evidence: steps.map((step) => `${step.toolId}:${step.gate}:${step.reason}`),
    }
  );
  for (const finding of findings) {
    traceEntries.push({
      stage: "finding",
      code: finding.id,
      message: finding.title,
      evidence: finding.evidence,
    });
  }
  traceEntries.push({
    stage: "contract",
    code: "contract.created",
    message: "A preflight contract was generated for the agent runtime.",
    evidence: [status],
  });

  return {
    id: planId,
    intent: input.intent,
    actor: {
      agent: input.actor?.agent ?? "local-agent",
      user: input.actor?.user ?? "local-user",
      org: input.actor?.org ?? "local-org",
      environment: input.actor?.environment ?? "local",
    },
    policyProfile,
    confidence: Math.max(0.47, Math.min(0.96, avgScore / 100)),
    status,
    requiredCapabilities: capabilities,
    selectedTools,
    blockedTools: selectedTools.filter((tool, index) => gates[index] === "block"),
    steps,
    alternatives: candidates
      .filter((tool) => !selectedTools.some((selectedTool) => selectedTool.id === tool.id))
      .slice(0, 6)
      .map((tool) => ({ toolId: tool.id, name: `${tool.vendor} ${tool.name}`, reason: tool.description, score: scoreTool(tool).score })),
    score: avgScore,
    scoreBreakdown: breakdown,
    riskFindings: findings,
    contextPack,
    simulation,
    approvalRequirement:
      status === "block"
        ? "Execution blocked. Return a safer plan."
        : status === "approval_required"
          ? "Human approval required before mutation or external send."
          : status === "warn"
            ? "Allowed with warning and audit record."
            : "Allowed under current policy.",
    preflightContract: createContract(status, policyProfile),
    auditReplayUrl: `/audits/${planId}`,
    trace: createTrace(traceEntries),
  };
}

export const buildPlan = evaluateIntent;

export function compressContext(intent: string, toolIds: string[], budget = 1200): ContextPack {
  const tools = toolRegistry.filter((tool) => toolIds.includes(tool.id));
  return createContextPack(tools.length ? tools : toolRegistry.slice(0, 4), { intent, constraints: { contextBudget: budget } });
}

export function simulatePlan(plan: { steps?: Array<{ gate: Gate; toolName: string; label: string }> }): SimulationResult {
  return simulate(plan.steps ?? []);
}

export function evaluateToolCall(input: ToolCallRequest): ToolCallDecision {
  const registry = input.tools?.length ? input.tools : toolRegistry;
  const tool = registry.find((entry) => entry.id === input.toolId) ?? registry[0];
  const score = scoreToolManifest(tool);
  const gate = gateFor(tool, input.policyProfile ?? "default", input.mutationAllowance);
  return {
    id: uid("call"),
    gate,
    toolId: tool.id,
    score: score.score,
    reason: reasonForGate(gate),
    trace: createTrace([
      {
        stage: "selection",
        code: "tool.selected",
        message: "Tool manifest was selected for outbound call evaluation.",
        evidence: [tool.id],
      },
      {
        stage: "scoring",
        code: "tool.scored",
        message: "Tool manifest was scored before execution.",
        evidence: [`${tool.id}:${score.score}`],
      },
      {
        stage: "policy",
        code: `policy.${gate}`,
        message: reasonForGate(gate),
        evidence: [tool.mutation, tool.sensitivity, tool.rollback],
      },
    ]),
  };
}
