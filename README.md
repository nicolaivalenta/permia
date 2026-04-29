# Permia

Permia is the open-source preflight layer for agent tool calls.

Agents are starting to send emails, move money, deploy code, query production data, and operate browsers. Prompt instructions are not a security boundary. Permia gives developers a deterministic policy layer that runs before tools execute and returns `allow`, `warn`, `approval_required`, or `block` with an auditable trace.

Run the engine locally. Pay later only if you want hosted approvals, retained audits, private registries, team policy management, and compliance workflows.

## Five-minute local use

```bash
npm install
npm run build
npm test
npm run verify:fresh
```

Use the SDK without a Permia account:

```ts
import { PermiaClient } from "@permia/sdk";

const permia = new PermiaClient({ policyProfile: "finance" });

const decision = await permia.preflight({
  intent: "Check Stripe refund status, draft a Gmail reply, and send it to the customer",
});

console.log(decision.status);
console.log(decision.trace.entries);
```

Guard a tool before it runs:

```ts
import { withPermiaToolGuard } from "@permia/sdk";

const sendEmail = withPermiaToolGuard(
  {
    id: "gmail.messages.send",
    execute: async (input: { to: string; body: string }) => ({ sent: true, ...input }),
  },
  { policyProfile: "finance" }
);

await sendEmail.execute({ to: "customer@example.com", body: "Refund update" });
```

If policy requires approval or blocks the call, the wrapped tool does not execute.

## Dangerous-agent demo

Run the local fixture replay without cloud credentials:

```bash
npx tsx examples/dangerous-agent/index.ts --all
```

Or replay one fixture:

```bash
npx tsx examples/dangerous-agent/index.ts refund-email-send
```

The CLI uses `@permia/core` dangerous workflow fixtures and prints the returned gate, reason, timeline, and trace id. It is a demo of preflight behavior only; no email, payment, browser, or deploy tool is called.

The current local fixtures cover refunds, external customer messages, private-data export, production deploys, browser credential submission, repository secrets, database migrations, Slack posting, Gmail label writes, and local file deletion.

## Packages

- `packages/core`: deterministic policy engine, tool manifests, scoring, simulation, and decision traces.
- `packages/sdk`: TypeScript client, local preflight API, guarded tool wrapper, and audit hooks.
- adapter packages, when present: runtime-specific wrappers that should keep Permia's gate before any framework tool execution.
- `apps/web`: local server, docs, playground, audits, and future cloud dashboard shell.
- `examples`: runnable local examples for SDK, agent-style tools, and MCP proxy-style evaluation.

## Local server

```bash
npm run dev
```

Then call:

```bash
curl http://localhost:3000/api/v1/intent \
  -H "Content-Type: application/json" \
  -d '{"intent":"Deploy to production and notify customers","policyProfile":"production"}'
```

Useful routes:

- `POST /api/v1/intent`
- `POST /api/v1/tool-call/evaluate`
- `POST /api/v1/simulate`
- `POST /api/v1/audits`
- `GET /openapi.json`
- `GET /llms.txt`
- `GET /mcp`

## Open-source boundary

The engine, SDK, local server surface, examples, and manifest format are open. The commercial product is operational infrastructure around the open engine:

- hosted approval queues
- audit retention and replay
- team workspaces
- private tool registries
- policy versioning
- compliance exports
- SSO/RBAC and private deployments

The free core should remain useful enough that a developer can self-host or fork it.

Local-to-cloud forwarding is optional. Local decisions and audit events can stay on disk or in a self-hosted service; forwarding to Permia Cloud should only send the audit event and trace data that the developer explicitly chooses to retain remotely.

Signed manifests and audit chains are part of the trust boundary. Manifests describe tool capability, mutation, sensitivity, rollback, and verification posture before a tool runs. Audit events should be hash-chained so a retained replay can show what policy saw and why it returned its gate.

## Development

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:smoke
```

`npm run test:smoke` imports built `dist` artifacts for `@permia/core`, `@permia/sdk`, and adapter packages if present. Run it after `npm run build` and before publishing.

For database-backed audit pages:

```bash
cp .env.example apps/web/.env
npm run db:push
```

## Roadmap

- richer policy DSL and signed tool manifests
- more runtime adapters and copy-paste examples
- local approval handoff before hosted approval queues
- private registries and cloud audit retention after real team demand
- continuous drift checks and enterprise policy packs

## Launch checklist

- A new developer can run `npm run verify:fresh` without cloud credentials.
- The homepage leads with local OSS value, not paid infrastructure.
- Every dangerous workflow fixture has a deterministic expected gate.
- Public APIs explain why a gate was chosen, not just what gate was returned.
- Browser QA passes on homepage, docs, playground, replay, registry, status, security, and roadmap.

## License

Apache-2.0.
