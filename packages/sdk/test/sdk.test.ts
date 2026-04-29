import { describe, expect, it } from "vitest";
import {
  createForwardedEvent,
  createHttpForwarder,
  PermiaApprovalRequiredError,
  PermiaBlockedError,
  PermiaClient,
  PermiaForwardRateLimitError,
  withPermiaToolGuard,
} from "../src";

describe("Permia SDK", () => {
  it("returns a local preflight decision without cloud credentials", async () => {
    const client = new PermiaClient({ policyProfile: "finance" });
    const decision = await client.preflight({ intent: "Create a Stripe refund and send the customer an email" });
    expect(["approval_required", "block"]).toContain(decision.status);
    expect(decision.trace.entries.length).toBeGreaterThan(0);
  });

  it("guarded tool blocks execution when policy blocks", async () => {
    let executed = false;
    const tool = withPermiaToolGuard(
      {
        id: "browser.credentials.submit",
        execute() {
          executed = true;
          return "done";
        },
      },
      { policyProfile: "enterprise" }
    );
    await expect(tool.execute({})).rejects.toBeInstanceOf(PermiaBlockedError);
    expect(executed).toBe(false);
  });

  it("guarded tool pauses execution when approval is required", async () => {
    let executed = false;
    let approvalSeen = false;
    const tool = withPermiaToolGuard(
      {
        id: "gmail.messages.send",
        execute() {
          executed = true;
          return "sent";
        },
      },
      {
        policyProfile: "default",
        onApprovalRequired() {
          approvalSeen = true;
        },
      }
    );
    await expect(tool.execute({})).rejects.toBeInstanceOf(PermiaApprovalRequiredError);
    expect(approvalSeen).toBe(true);
    expect(executed).toBe(false);
  });

  it("audit sink receives decision traces", async () => {
    const traces: string[] = [];
    const audits: string[] = [];
    const client = new PermiaClient({
      auditSink(event) {
        traces.push(event.decision.trace.id);
        if (event.auditEvent) audits.push(event.auditEvent.id);
      },
    });
    await client.preflight({ intent: "Check Stripe refund status and draft a Gmail reply" });
    expect(traces).toHaveLength(1);
    expect(audits).toHaveLength(1);
  });

  it("forwarded events carry stable idempotency keys", async () => {
    let auditEventId = "";
    const client = new PermiaClient({
      auditSink(event) {
        auditEventId = event.auditEvent?.id ?? "";
      },
    });
    const decision = await client.preflight({ intent: "Check Stripe refund status and draft a Gmail reply" });
    const event = await new PermiaClient({
      auditSink(payload) {
        if (!payload.auditEvent) throw new Error("missing audit event");
        const forwarded = createForwardedEvent(payload.auditEvent);
        expect(forwarded.idempotencyKey).toContain(payload.auditEvent.hash);
      },
    }).preflight({ intent: decision.intent });
    expect(event.trace.entries.length).toBeGreaterThan(0);
    expect(auditEventId).toContain("audit_");
  });

  it("HTTP forwarder maps 429 to a named rate limit error", async () => {
    const forwarder = createHttpForwarder({
      endpoint: "https://permia.invalid/audits",
      fetcher: async () => new Response("rate limited", { status: 429 }),
    });
    await expect(
      forwarder.forward({
        idempotencyKey: "test",
        destination: "cloud",
        event: {
          id: "audit_test",
          chainId: "local",
          sequence: 1,
          previousHash: null,
          hash: "hash",
          kind: "preflight",
          gate: "allow",
          traceId: "trace",
          subjectId: "subject",
          policyProfile: "default",
          createdAt: "2026-04-29T00:00:00.000Z",
          payloadHash: "payload",
        },
      })
    ).rejects.toBeInstanceOf(PermiaForwardRateLimitError);
  });
});
