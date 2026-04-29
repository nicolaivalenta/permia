# Architecture

Permia has three layers.

## OSS layer

`@permia/core` is the deterministic engine. It compiles intent into capabilities, selects tool manifests, scores risk, applies policy, simulates consequences, and returns a decision trace.

`@permia/sdk` is the developer-facing wrapper. It can run fully local or call a hosted/local Permia API. It exposes guarded tools so risky calls do not execute before Permia returns a safe gate.

Adapter packages, when present, should stay thin. Their job is to place Permia's preflight gate directly before a specific agent runtime executes a tool, without changing the core policy semantics.

`apps/web` is the local server and product shell. It exposes the API, playground, audit pages, OpenAPI, `llms.txt`, and MCP discovery.

`examples/dangerous-agent` replays exported dangerous workflow fixtures with no cloud credentials. It prints the gate, reason, timeline, and trace id that a runtime should use before allowing a side effect.

## Cloud layer

Permia Cloud should not be required for local use. It exists for hosted approvals, audit retention, team workspaces, private registries, policy history, and compliance exports.

Local-to-cloud forwarding begins after a local decision/audit event exists. The cloud path should receive explicit audit payloads for retention or approval workflows, not direct tool credentials.

## Enterprise layer

Enterprise value belongs around operational risk: private deployments, SSO/RBAC, signed manifests, internal tool connectors, long-retention logs, and support.

Signed manifests and hash-chained audit events form the review trail: what tool was described, what policy saw, which gate was returned, and which trace id explains the decision.
