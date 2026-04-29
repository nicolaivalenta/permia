# Policies

Permia policies resolve to one of four gates.

- `allow`: execute under current policy
- `warn`: execute but record an audit warning
- `approval_required`: pause until a human approves
- `block`: do not execute

Current profiles:

- `default`: safe reads and drafts are allowed; risky writes warn or require approval
- `strict`: writes require approval
- `enterprise`: unverified manifests warn and sensitive actions are treated conservatively
- `finance`: money movement requires approval
- `production`: deploys, DNS, WAF, migrations, and secret writes require approval

Policy decisions must return a trace. Developers should be able to see which manifest fields, risk findings, and profile rules led to the result.
