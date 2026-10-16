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

Current status after modernization (71 vulnerabilities, reduced from 99):

- Most remaining vulnerabilities are in transitive dependencies of Nx and Vite/Vitest.
- No direct dependencies have known critical vulnerabilities.
- Consider running `npm audit fix` for safe automatic fixes, but review changes before committing.

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
