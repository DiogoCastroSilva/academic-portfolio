# Troubleshooting

## Build fails with "Cannot find module"

**Symptom:** `Error: Cannot find module 'next/constants'` when running `next.config.mjs`.

**Cause:** In ESM mode, Node.js requires the `.js` extension for subpath imports of packages without an `exports` field.

**Fix:** Use `next/constants.js` instead of `next/constants` in `next.config.mjs`:

```js
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
```

## Images 404 on production

**Symptom:** Images load in development but return 404 on the deployed site.

**Cause:** Content images must be synced to `apps/main/public/` before building.

**Fix:**

```bash
npx nx run main:sync-content-assets
npx nx build main
```

The `main:build` target runs `sync-content-assets` automatically, but if it's skipped:

- Check that images exist in `libs/{projects|publications}/src/md/`
- Ensure the `image` field in frontmatter matches the filename exactly
- Check for case sensitivity issues (Linux is case-sensitive)

## Invalid frontmatter error in build

**Symptom:** Build fails with `Invalid frontmatter in "my-project.md": \`title\` is required`.

**Cause:** A required frontmatter field is missing or has an invalid type.

**Fix:** Add the missing field with the correct type and format:

```yaml
---
title: "Correct Title"
date: "2025-11-01"
---
```

Use `YYYY-MM-DD` format for date. Do not use ISO datetime strings.

## Stale publish branch on GitHub Pages

**Symptom:** Old content remains deployed after a new build.

**Cause:** The `peaceiris/actions-gh-pages` action might be using a cached version or the `gh-pages` branch was not properly updated.

**Fix:**

1. Check the workflow run status in GitHub Actions
2. Clear the cache if using `next/image` with `Cache-Control` headers
3. Manually delete the `gh-pages` branch and re-trigger deployment

## Base path not applied

**Symptom:** Links work in development but 404 on the deployed site.

**Cause:** `NEXT_PUBLIC_BASE_PATH` is not set or is incorrect.

**Fix:**

- In CI, the workflow sets this automatically from the repository name
- For local testing: `NEXT_PUBLIC_BASE_PATH="/your-repo" npx nx run main:dev`
- Verify the path in the built `public/` directory: `grep -r "base-path" .next/`

## Nx Cloud connection errors

**Symptom:** `NX   Nx Cloud encountered some problems` warning in command output.

**Cause:** The workspace is not connected to Nx Cloud. This is a warning, not an error. Local caching still works.

**Fix:** Run `npx nx connect` to connect the workspace, or run with `NX_NO_CLOUD=true` to suppress warnings:

```bash
NX_NO_CLOUD=true npx nx run-many -t test
```

## Lint errors after shared config adoption

**Symptom:** `prettier/prettier` errors for single vs. double quotes, or `@typescript-eslint/no-require-imports` errors.

**Cause:** The shared config uses double quotes. All source must be reformatted with `npx nx format:write`.

**Fix:**

```bash
npx nx format:write
npx nx run-many -t lint
```

For `no-require-imports` in config files, convert to ESM:

- `next.config.js` → `next.config.mjs`
- `postcss.config.js` → `postcss.config.mjs`
- `tailwind.config.js` → `tailwind.config.mjs`

## Test suite fails with "No test files found"

**Symptom:** `Error: No test files found` for a project that has tests.

**Cause:** The Vitest `include` pattern doesn't match the test file location.

**Fix:** Check the `include` pattern in `vitest.config.mts`:

```typescript
include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
```

Ensure test files are in `src/` or `tests/` and match the extension pattern.

## Empty test suite fails

**Symptom:** A project with a `test` target but no test files fails with `No test files found`.

**Cause:** Vitest exits with a non-zero code when no test files are found.

**Fix:** Add a test file to that project, or remove the `vitest.config.*` file if tests are not needed (this removes the `test` target).
