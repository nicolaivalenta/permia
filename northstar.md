# Permia North Star

Permia should become the open-source control plane for agent actions.

The company version of Permia is not "a nice safety wrapper." It is infrastructure for the moment when AI agents stop being chat interfaces and start operating production systems, money movement, customer data, browsers, cloud consoles, and internal tools. The product should make it normal for every serious agent runtime to ask Permia before it acts.

## The YC-Backable Version

YC would not invest in Permia because it has clever code. They would invest if Permia becomes the default trust layer for agent tool use.

The bar is:

- developers adopt the open-source SDK because it solves a real problem in minutes
- teams pay because they cannot safely run agents near production without approvals, audit, policy, and private registries
- the repo becomes a credible developer artifact, not a marketing prototype
- the product sits in the path of a growing, unavoidable workflow: agents taking actions for businesses

The wedge is open source distribution. The company is hosted governance, audit, compliance, policy management, private registries, and enterprise risk ownership.

## The Problem

Agents are being connected to powerful tools faster than companies can govern them.

Prompt instructions are not enough. Static permissions are too broad. Human approval is usually bolted on after the fact. Existing integration platforms help agents reach tools, but they do not decide whether a specific action should happen.

Permia owns the moment before execution:

> Given this actor, intent, tool, context, data sensitivity, mutation type, and policy, should this action run?

## Product Promise

Permia returns one of four answers before an agent acts:

- `allow`: the action can run
- `warn`: the action can run with audit evidence
- `approval_required`: pause until a human approves
- `block`: do not execute

Every decision must include a trace that a developer, security reviewer, or future agent can inspect.

## What Must Be Open

The open-source core must be genuinely useful without a Permia account.

Open:

- policy engine
- TypeScript SDK
- local preflight server
- tool manifest format
- seed manifests
- decision traces
- simulation logic
- examples
- docs

If the open repo feels crippled, developers will not trust it. The OSS project must be good enough to self-host, fork, inspect, and recommend.

## What Becomes Paid

Companies pay for operational burden and risk reduction, not for permission to understand the engine.

Paid:

- hosted approval queues
- retained audit logs
- team workspaces
- private tool registries
- policy versioning
- compliance exports
- SSO/RBAC
- signed manifests
- private/VPC deployments
- incident workflows
- support

This is the open-source company playbook: make the core trusted and widely adopted, then charge for running it safely at team and enterprise scale.

## The First Killer Demo

A developer should clone the repo or install the SDK and see the value in under five minutes.

The demo:

1. An agent is asked to do something useful but risky.
2. Permia decomposes the intent into tool capabilities.
3. Safe reads and drafts are allowed.
4. External communication, production mutation, money movement, or private-data export is paused or blocked.
5. The developer sees the exact decision trace.

The moment should feel obvious:

> "I would put this before my agent's tools."

## Quality Bar

The codebase must look like infrastructure smart developers would trust.

Required bar:

- deterministic core behavior
- strong types
- stable public interfaces
- clear package boundaries
- realistic fixtures
- serious tests for dangerous workflows
- docs that teach implementation, not just positioning
- no hidden SaaS dependency for local use
- no vague AI safety theater

The repo should survive a skeptical senior engineer reading it for ten minutes.

## Strategic Non-Goals

Permia is not:

- an agent framework
- a tool marketplace first
- an integration platform first
- a generic auth provider
- a prompt-injection scanner only
- a compliance dashboard with no runtime enforcement

Permia should integrate with those systems, not become all of them.

## Decision Rules

When choosing what to build, prefer work that makes Permia more likely to become the default preflight layer for agent actions.

Prioritize:

1. Developer adoption of the OSS SDK.
2. Trustworthy policy decisions and traces.
3. Easy integration with real agent runtimes.
4. Hosted approval and audit workflows teams will pay for.
5. Enterprise controls only after the developer wedge is credible.

Avoid:

- broad dashboard work before the core is trusted
- fake enterprise features with no enforcement path
- opaque model-only decisions
- demo heuristics pretending to be infrastructure
- paid boundaries that damage OSS trust

## Success Metrics

Early OSS metrics:

- stars from real developers
- forks with meaningful usage
- example integrations copied into other projects
- issues and PRs from people running agents
- installs of `@permia/sdk`
- developers using local mode without a sales call

Early company metrics:

- teams forwarding audits to Permia Cloud
- approval queues used in real workflows
- private registries configured for internal tools
- production, finance, support, or customer-data policies used repeatedly
- paid teams expanding usage after first integration

## The Standard

Permia should be ambitious enough that YC can believe it could become a category-defining company.

That means the product must attack a large, urgent, expanding problem; the open-source repo must earn developer trust; and the paid product must map to painful business risk.

The north star:

> Every serious agent asks Permia before it acts.
