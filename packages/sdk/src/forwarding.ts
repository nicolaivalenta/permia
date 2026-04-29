import { AuditChainEvent } from "@permia/core";

export class PermiaForwardAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermiaForwardAuthError";
  }
}

export class PermiaForwardRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermiaForwardRateLimitError";
  }
}

export class PermiaForwardRetryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermiaForwardRetryError";
  }
}

export type ForwardedEvent = {
  idempotencyKey: string;
  event: AuditChainEvent;
  destination: "cloud" | "local";
};

export type Forwarder = {
  forward(event: ForwardedEvent): Promise<{ ok: true }>;
};

export function createForwardedEvent(event: AuditChainEvent, destination: ForwardedEvent["destination"] = "cloud"): ForwardedEvent {
  return {
    idempotencyKey: `${event.chainId}:${event.sequence}:${event.hash}`,
    event,
    destination,
  };
}

export function createHttpForwarder(options: { endpoint: string; apiKey?: string; fetcher?: typeof fetch }): Forwarder {
  const fetcher = options.fetcher ?? fetch;
  return {
    async forward(event) {
      const response = await fetcher(options.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": event.idempotencyKey,
          ...(options.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : {}),
        },
        body: JSON.stringify(event),
      }).catch((error: unknown) => {
        throw new PermiaForwardRetryError(error instanceof Error ? error.message : "Forwarding request failed");
      });
      if (response.status === 401 || response.status === 403) {
        throw new PermiaForwardAuthError(`Forwarding unauthorized: ${response.status}`);
      }
      if (response.status === 429) {
        throw new PermiaForwardRateLimitError("Forwarding rate limited");
      }
      if (!response.ok) {
        throw new PermiaForwardRetryError(`Forwarding failed: ${response.status}`);
      }
      return { ok: true };
    },
  };
}
