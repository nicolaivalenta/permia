import { Gate, IntentRequest, ToolManifest, ToolRecord } from "./types.js";

export type PolicyContext = {
  profile: string;
  intent: IntentRequest;
  tool: ToolRecord;
  currentGate: Gate;
};

export type PolicyPluginResult = {
  gate?: Gate;
  reason?: string;
  evidence?: string[];
};

export type PolicyPlugin = {
  id: string;
  evaluate(context: PolicyContext): PolicyPluginResult;
};

export type ManifestTrustContext = {
  manifest: ToolManifest;
  profile: string;
  hardline?: boolean;
};

export type ManifestTrustResult = {
  trusted: boolean;
  gate?: Gate;
  reason: string;
  evidence: string[];
};

export type ManifestTrustPlugin = {
  id: string;
  evaluate(context: ManifestTrustContext): ManifestTrustResult;
};

export type AuditSinkPlugin<Event> = {
  id: string;
  write(event: Event): Promise<void> | void;
};
