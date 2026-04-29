import { canonicalize, sha256Hex } from "./canonical.js";
import { Gate, DecisionTrace } from "./types.js";

export class PermiaAuditWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermiaAuditWriteError";
  }
}

export type AuditChainEvent = {
  id: string;
  chainId: string;
  sequence: number;
  previousHash: string | null;
  hash: string;
  kind: "preflight" | "tool_call" | "forwarding";
  gate: Gate;
  traceId: string;
  subjectId: string;
  policyProfile: string;
  createdAt: string;
  payloadHash: string;
};

export type AuditEventInput = {
  chainId: string;
  sequence: number;
  previousHash?: string | null;
  kind: AuditChainEvent["kind"];
  gate: Gate;
  subjectId: string;
  policyProfile: string;
  trace: DecisionTrace;
  payload: unknown;
  createdAt?: string;
};

export async function createAuditEvent(input: AuditEventInput): Promise<AuditChainEvent> {
  const payloadHash = await sha256Hex(input.payload);
  const base = {
    chainId: input.chainId,
    sequence: input.sequence,
    previousHash: input.previousHash ?? null,
    kind: input.kind,
    gate: input.gate,
    traceId: input.trace.id,
    subjectId: input.subjectId,
    policyProfile: input.policyProfile,
    createdAt: input.createdAt ?? new Date().toISOString(),
    payloadHash,
  };
  const hash = await sha256Hex(base);
  return {
    id: `audit_${hash.slice(0, 16)}`,
    hash,
    ...base,
  };
}

export async function verifyAuditChain(events: AuditChainEvent[]): Promise<{ ok: boolean; error?: string }> {
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    if (event.sequence !== index + 1) return { ok: false, error: `sequence_mismatch:${event.id}` };
    const expectedPrevious = index === 0 ? null : events[index - 1].hash;
    if (event.previousHash !== expectedPrevious) return { ok: false, error: `previous_hash_mismatch:${event.id}` };
    const { id: _id, hash: _hash, ...base } = event;
    const expectedHash = await sha256Hex(base);
    if (event.hash !== expectedHash) return { ok: false, error: `hash_mismatch:${event.id}` };
  }
  return { ok: true };
}

export function auditEventBytes(event: AuditChainEvent): string {
  return canonicalize(event);
}
