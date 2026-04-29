export {
  buildPlan,
  compileIntent,
  compressContext,
  evaluateIntent,
  evaluateToolCall,
  scoreTool,
  scoreToolManifest,
  simulatePlan,
} from "./engine.js";
export { productStats, toolRegistry } from "./registry.js";
export {
  PermiaManifestValidationError,
  toolManifestSchema,
  validateToolManifest,
  validateToolManifestResult,
  type ManifestValidationIssue,
} from "./manifest.js";
export {
  PermiaCanonicalizationError,
  canonicalize,
  sha256Hex,
  type JsonValue,
} from "./canonical.js";
export {
  createAuditEvent,
  auditEventBytes,
  verifyAuditChain,
  PermiaAuditWriteError,
  type AuditChainEvent,
  type AuditEventInput,
} from "./audit.js";
export {
  dangerousWorkflowFixtureSchema,
  dangerousWorkflowFixtures,
  getDangerousWorkflowFixture,
  replayDangerousWorkflow,
  validateDangerousWorkflowFixture,
  type DangerousWorkflowFixture,
  type ReplayResult,
} from "./fixtures.js";
export {
  fallbackManifestSigner,
  fallbackManifestVerifier,
  nativeManifestSigner,
  nativeManifestVerifier,
  signManifest,
  verifySignedManifest,
  PermiaSignatureError,
  type ManifestSigner,
  type ManifestVerifier,
  type SignedManifest,
} from "./signing.js";
export {
  type AuditSinkPlugin,
  type ManifestTrustContext,
  type ManifestTrustPlugin,
  type ManifestTrustResult,
  type PolicyContext,
  type PolicyPlugin,
  type PolicyPluginResult,
} from "./plugins.js";
export {
  MemoryContentCache,
  replayCacheKey,
  type ReplayCacheKeyInput,
} from "./cache.js";
export type {
  ContextPack,
  DataSensitivity,
  DecisionTrace,
  DecisionTraceEntry,
  ExecutionPlan,
  Gate,
  IntentRequest,
  MutationClass,
  PlanStep,
  PolicyProfile,
  PreflightContract,
  PreflightDecision,
  RiskFinding,
  ScoreBreakdown,
  SimulationResult,
  ToolCallDecision,
  ToolCallRequest,
  ToolManifest,
  ToolRecord,
  ToolSchema,
  ToolScore,
} from "./types.js";
