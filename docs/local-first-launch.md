# Local-First Launch Checklist

Permia should be able to earn developer trust before anyone pays for hosted infrastructure.

## Required Before Public OSS Launch

- `npm install`, `npm run build`, `npm test`, and `npm run verify:fresh` pass from a clean clone.
- No quickstart step requires `PERMIA_TOKEN`, paid hosting, Stripe, OpenAI, or any external account.
- The homepage points developers to local install, replay fixtures, docs, and playground.
- Dangerous workflow fixtures cover money movement, customer data, external messaging, production deploys, browser credentials, secrets, database mutation, and local deletion.
- Every replay returns a trace with capability matches, selected tools, policy gates, findings, and contract evidence.
- The README states the open-source boundary and paid boundary without making the free core feel crippled.

## Good GitHub Launch Signals

- First code block runs locally.
- First demo shows a risky agent workflow being stopped before side effects.
- Tests prove all fixtures match expected gates.
- The repo has license, contributing, security, code of conduct, architecture docs, and launch docs.
- Cloud features are positioned as optional operations for teams, not required developer value.
