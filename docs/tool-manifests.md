# Tool Manifests

Tool manifests describe what an agent tool can do before the model tries to use it.

Minimum fields:

- `id`: stable tool identifier, such as `gmail.messages.send`
- `vendor`: tool provider
- `version`: manifest version
- `capabilities`: normalized capabilities such as `email.send` or `production.change`
- `authScopes`: scopes needed to call the tool
- `mutation`: `read`, `draft`, `write`, or `destructive`
- `sensitivity`: `public`, `internal`, `confidential`, or `secret`
- `rollback`: `native`, `compensating`, or `none`
- `schema`: input and output shape
- `failureModes`: known operational or security failures
- `docsUrl`: source documentation

Manifests should be conservative. If a tool can mutate production state, move money, expose customer data, or send external communication, the manifest should say so explicitly.

## Signed Manifests

Signed manifests let Permia distinguish vendor-attested tool behavior from local or unverified descriptions. The signature should cover the canonical manifest bytes so policy can reason over exactly the capability, scope, mutation, sensitivity, rollback, schema, and version that were approved.

Unsigned manifests can still run locally, but conservative profiles should warn or require approval when the action is sensitive.

## Audit Chain

Policy decisions should be written as hash-chained audit events. A replay needs the gate, trace id, manifest inputs, policy profile, and decision payload so a reviewer can verify what Permia saw before the tool call executed or was stopped.
