# Permia QA Issue Log

This file tracks autonomous QA loops and fixes.

## Loop 1 - Foundation QA

- Fixed: Prisma 7 schema engine failed silently on SQLite `db push`; pinned Prisma to 6.19, regenerated client, and created the local SQLite schema directly.
- Passed: production build completed with all routes generated.
- Fixed: first browser inspection showed horizontal overflow risk on the command center surface; added global overflow protection and `min-w-0` to dense panels.

## Loop 2 - Product QA

- Fixed: refund-draft scenario was over-selecting refund creation and email-send tools. Intent compiler now separates read/draft from send/money movement.
- Passed: refund-draft scenario selects `stripe.refunds.retrieve` + `gmail.drafts.create`, returns `allow`, and saves 90% context.
- Passed: private-data export to agency returns `block`, cross-tool exfiltration finding, policy keyword finding, and no execution contract.
- Passed: `/llms.txt`, `/.well-known/agent.json`, `/api/v1/benchmarks`, and `/audits` respond locally.

## Loop 3 - Polish And Trust QA

- Passed: Computer Use rendered inspection confirms the command center, scenario buttons, allow/block badges, execution graph, findings, context pack, simulation transcript, and preflight contract render in Chrome.
- Remaining: Browser Use plugin did not expose a navigation/screenshot tool in this session, so browser verification used Chrome plus Computer Use as the fallback.
