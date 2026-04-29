# Security

Permia is a policy and audit layer for agent tool calls. It is not a replacement for least-privilege credentials, sandboxing, network controls, or human review of high-risk production actions.

Report security issues privately through GitHub Security Advisories once the public repository is live. Do not open public issues for vulnerabilities that could help bypass policy checks, leak secrets, or execute blocked tool calls.

When using Permia:

- keep tool credentials scoped outside the model context
- treat `approval_required` as a hard stop
- treat `block` as final
- audit every decision near production, money, customer data, public posting, and secrets
- run destructive tools with dry-run support where possible
