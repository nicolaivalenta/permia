import { describe, expect, it } from "vitest";
import {
  canonicalize,
  createAuditEvent,
  dangerousWorkflowFixtures,
  fallbackManifestSigner,
  getDangerousWorkflowFixture,
  MemoryContentCache,
  nativeManifestSigner,
  replayCacheKey,
  replayDangerousWorkflow,
  signManifest,
  toolRegistry,
  validateToolManifestResult,
  validateDangerousWorkflowFixture,
  verifyAuditChain,
  verifySignedManifest,
} from "../src";

describe("Permia foundation primitives", () => {
  it("canonicalizes nested objects with stable key order", () => {
    const left = canonicalize({ b: 2, a: { d: true, c: ["x", { z: 1, y: 2 }] } });
    const right = canonicalize({ a: { c: ["x", { y: 2, z: 1 }], d: true }, b: 2 });
    expect(left).toBe(right);
  });

  it("signs and verifies manifests with native and fallback signers using the same vector", async () => {
    const manifest = toolRegistry.find((tool) => tool.id === "postgres.export.csv")!;
    const secret = "test-secret";
    const native = await signManifest(manifest, secret, { keyId: "test", signer: nativeManifestSigner });
    const fallback = await signManifest(manifest, secret, { keyId: "test", signer: fallbackManifestSigner });

    expect(native.canonicalHash).toBe(fallback.canonicalHash);
    await expect(verifySignedManifest(native, secret)).resolves.toEqual({ ok: true, reason: "signature_valid" });
  });

  it("rejects changed manifest signatures", async () => {
    const manifest = toolRegistry.find((tool) => tool.id === "postgres.export.csv")!;
    const signed = await signManifest(manifest, "test-secret");
    const changed = { ...signed, manifest: { ...signed.manifest, description: "changed" } };
    await expect(verifySignedManifest(changed, "test-secret")).resolves.toEqual({ ok: false, reason: "signature_mismatch" });
  });

  it("creates and verifies contiguous audit chains", async () => {
    const replay = replayDangerousWorkflow(getDangerousWorkflowFixture("customer-export-external-email")!);
    const first = await createAuditEvent({
      chainId: "test",
      sequence: 1,
      kind: "preflight",
      gate: replay.decision.status,
      subjectId: replay.decision.id,
      policyProfile: replay.decision.policyProfile,
      trace: replay.decision.trace,
      payload: replay.decision,
    });
    const second = await createAuditEvent({
      chainId: "test",
      sequence: 2,
      previousHash: first.hash,
      kind: "preflight",
      gate: replay.decision.status,
      subjectId: replay.decision.id,
      policyProfile: replay.decision.policyProfile,
      trace: replay.decision.trace,
      payload: replay.decision,
    });
    await expect(verifyAuditChain([first, second])).resolves.toEqual({ ok: true });
    await expect(verifyAuditChain([{ ...second, previousHash: "broken" }])).resolves.toMatchObject({ ok: false });
  });

  it("validates dangerous workflow fixtures and blocks the customer export replay", () => {
    const fixture = validateDangerousWorkflowFixture(getDangerousWorkflowFixture("customer-export-external-email"));
    const replay = replayDangerousWorkflow(fixture);
    expect(replay.decision.status).toBe("block");
    expect(replay.matchedExpectedGate).toBe(true);
    expect(replay.timeline.map((step) => step.id)).toEqual(["intent", "capabilities", "tools", "risk", "gate"]);
  });

  it("covers all expected dangerous fixture gates and replays every fixture", () => {
    expect(new Set(dangerousWorkflowFixtures.map((fixture) => fixture.expectedGate))).toEqual(
      new Set(["allow", "warn", "approval_required", "block"])
    );
    for (const fixture of dangerousWorkflowFixtures) {
      const replay = replayDangerousWorkflow(fixture);
      expect(replay.decision.status, fixture.id).toBe(fixture.expectedGate);
      expect(replay.matchedExpectedGate, fixture.id).toBe(true);
    }
  });

  it("returns useful manifest validation issues", () => {
    const result = validateToolManifestResult({
      ...toolRegistry[0],
      id: "",
      capabilities: [],
      docsUrl: "not-a-url",
      mutation: "teleport",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.map((issue) => issue.path)).toEqual(
        expect.arrayContaining(["id", "capabilities", "docsUrl", "mutation"])
      );
    }
  });

  it("uses content-addressed replay cache keys", async () => {
    const base = {
      fixtureVersion: "2026-04-oss.1",
      fixtureId: "customer-export-external-email",
      manifestHash: "manifest-a",
      policyVersion: "policy-a",
      engineVersion: "engine-a",
    };
    const cache = new MemoryContentCache<string>();
    const key = await replayCacheKey(base);
    cache.set(key, "cached");
    expect(cache.get(key)).toBe("cached");
    await expect(replayCacheKey({ ...base, policyVersion: "policy-b" })).resolves.not.toBe(key);
  });
});
