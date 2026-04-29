# Cloud Boundary

Permia's open-source core should remain useful without a hosted account.

## Open

- policy engine
- SDK
- local decision traces
- local API server
- tool manifest format
- seed manifests
- examples and docs
- local dangerous workflow fixture replay

## Paid

- hosted approval inbox
- retained audit ledger
- team workspaces
- private tool registries
- policy version history
- compliance exports
- SSO/RBAC
- VPC/private deployment
- support and incident workflows

The paid product saves time and reduces operational risk. It should not be required to understand or trust the engine.

## Forwarding boundary

Local-to-cloud forwarding is opt-in. The SDK can create local audit events and forwarded event envelopes, but a developer chooses the destination and credential. The open engine must still return gates and traces without a hosted account.

Forward only the audit event, trace, and metadata needed for hosted retention or approvals. Do not require raw tool credentials or direct customer data in the cloud path.
