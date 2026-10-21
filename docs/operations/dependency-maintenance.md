# Dependency Maintenance

## Overview

Dependencies are managed via `package.json` and `package-lock.json` at the workspace root. Use `npm ci` for reproducible installs.

## Upgrade Workflow

### Minor and patch updates

```bash
npm update
```

This updates patch and minor versions within the ranges specified in `package.json`.

### Major version updates

Major updates may introduce breaking changes. Review release notes before upgrading:

```bash
npm install package@latest
npx nx migrate @nx/workspace@latest   # if upgrading Nx
```

### Nx migrations

When upgrading Nx, use the official migration command:

```bash
npx nx migrate@latest
# Review the generated migrations.json
npx nx migrate --run-migrations
```

After migration, run all checks:

```bash
npx nx run-many -t lint test typecheck build
```

## Dependency Audit

Check for security vulnerabilities:

```bash
npm audit
```

Current status (audited 2026-10-20, 36 vulnerabilities, reduced from 99):

- **0 critical, 0 low, 20 moderate, 16 high** (down from 4 critical, 70 total).
- All 4 critical vulnerabilities (happy-dom, proxy-addr, shell-quote, websocket-driver) eliminated.
  These were in dev-only dependencies (test environment and build tooling), not in production
  dependencies — confirmed via `npm ls --omit=dev`.
- **Production-only audit** (`npm audit --omit=dev`): 4 moderate — all in the
  `gray-matter` → `js-yaml` → `argparse` → `sprintf-js` transitive chain
  (DoS via unbounded precision specifiers). A fix requires `gray-matter` 2.x
  (a breaking major upgrade). No fix without breaking change.
- The remaining 16 high and 20 moderate vulnerabilities are in transitive dependencies of:
  - Nx and Vite/Vitest (build/test tooling)
  - Next.js and webpack-dev-server (dev server)
  - Module Federation (build-time DTS plugin)
- `autoprefixer` was removed from dependencies in 2026-10-20 — it was not referenced
  by `postcss.config.js` (which uses `@tailwindcss/postcss`); Tailwind CSS v4 handles
  vendor prefixing natively via the PostCSS plugin.
- No direct production dependencies have known critical or high vulnerabilities.
- happy-dom upgraded from 15.x to ^20.14.6 to resolve the critical RCE advisory
  (GHSA-37j7-fg3j-429f). Test setup updated to suppress a known harmless
  AbortError from motion-dom animation teardown in happy-dom 20+.

Note: the system `npm` (v10.9.7) has an `edgesOut` bug that prevents
`npm audit fix` and `npm install` from running. Use `npx npm@11` to
apply security-related dependency updates.

## Shared Tooling Updates

The project uses shared configs from the `frontend-tooling` repository:

- `@diogozx-org/prettier-config` — formatting rules
- `@diogozx-org/eslint-config` — ESLint presets and rules

To update:

```bash
npm install @diogozx-org/prettier-config@latest @diogozx-org/eslint-config@latest
npx nx run-many -t lint # verify no new lint errors
```

After updating shared configs, formatting changes may be needed:

```bash
npx nx format:write
```

## Node.js Version

- `.nvmrc` is set to `22`
- `engines` in `package.json` requires `>=20.9.0`
- CI uses `node-version-file: '.nvmrc'`

When upgrading Node.js:

1. Update `.nvmrc`
2. Update `engines` in `package.json`
3. Update CI workflow if needed
4. Run `npm ci` with the new Node version
5. Run all checks

## Removing Unused Dependencies

Before removing a package:

1. Check if it's referenced in any source file, config file, or script
2. Check if it's a dependency of an Nx plugin or build tool
3. Remove from `package.json`
4. Run `npm install`
5. Verify tests, lint, and build still pass

Use `npm ls <package>` to check the dependency tree.
