# Contributing

Permia is intended to be useful as open infrastructure, not just a demo.

## Good contributions

- safer policy decisions with clear traces
- new tool manifests with realistic scopes and failure modes
- tests for risky agent workflows
- documentation that helps developers wire Permia before real tool calls
- small SDK adapters for common agent runtimes

## Development

```bash
npm install
npm test
npm run lint
npm run build
```

Keep the core deterministic. If a decision changes, add or update a test that explains why.

## Pull requests

Include:

- the behavior change
- the policy or manifest impact
- tests for the risky path
- any compatibility notes for the SDK or local API
