# Release Checklist

Permia packages should be published from built `dist` artifacts, not source-only workspaces.

Before release:

- run `npm ci`
- run `npm test`
- run `npm run lint`
- run `npm run typecheck`
- run `npm run build`
- run `npm run test:smoke`

`scripts/package-smoke.ts` imports the built `dist` entrypoints for `@permia/core`, `@permia/sdk`, and any package under `packages/` whose name or folder contains `adapter`. It fails if `dist/index.js`, `dist/index.d.ts`, or required public exports are missing.

For npm release, publish from trusted CI with provenance enabled:

```bash
npm publish --provenance
```

Keep adapter packages honest: the smoke test only validates their public build output exists and imports cleanly. Runtime contract tests should live with each adapter.
