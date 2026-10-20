# T-001: Create the `libs/design-system/` Nx library

- **Status:** Done
- **Phase:** 4 — Design-system foundation
- **Priority:** P0
- **Dependencies:** ADR-0008 accepted

## Context

The application has 14 UI components in a flat `apps/main/src/app/ui/` folder. Four are generic enough to be shared across features. ADR-0008 establishes `libs/design-system/` as the canonical owner. We need to create the library scaffolding before promoting any components.

## Problem

No Nx library exists for shared design primitives. Tokens, typography, and reusable components have no single owner. Contributors cannot distinguish shared vs. feature-specific UI.

## Desired outcome

A fully configured Nx library at `libs/design-system/` that can host CSS stylesheets, React components, and TypeScript utilities, with its own test target, types, and lint rules.

## Scope

### In scope

- `libs/design-system/project.json` with tag `["design-system"]`
- `libs/design-system/package.json` with name `@academic-portfolio/design-system`
- `libs/design-system/tsconfig.json` (root project reference)
- `libs/design-system/tsconfig.lib.json` (library build config)
- `libs/design-system/tsconfig.spec.json` (test config)
- `libs/design-system/vitest.config.mts` (following `libs/navigation` pattern)
- `libs/design-system/test-setup.ts` (if needed for shared mocks)
- `libs/design-system/src/index.ts` (public exports)
- `libs/design-system/src/styles/index.css` (CSS entry point stub)
- `libs/design-system/src/styles/tokens.css` (placeholder)
- `libs/design-system/src/styles/typography.css` (placeholder)
- `libs/design-system/src/styles/themes.css` (placeholder)
- `libs/design-system/src/styles/animations.css` (placeholder)
- `.gitignore` in the library root (if needed)

### Out of scope

- Proming actual components (T-003, T-004, T-005)
- Migrating tokens from `global.css` (T-002)
- Updating ESLint depConstraints (T-006)
- Adding Storybook (T-008b)

## Files affected

- `libs/design-system/` (new directory)
- `tsconfig.json` (workspace root — add reference)
- `tsconfig.base.json` (add path alias — see T-006)
- `apps/main/next.config.mjs` (add to transpilePackages — see T-006)
- `eslint.config.mjs` (add depConstraint — see T-006)

## Implementation steps

1. Create `libs/design-system/project.json` with tag `["design-system"]`.
2. Create `libs/design-system/package.json` (private, type: "module").
3. Create `libs/design-system/tsconfig.json` extending `tsconfig.base.json` with `composite: true`.
4. Create `libs/design-system/tsconfig.lib.json` (emits declarations, excludes tests).
5. Create `libs/design-system/tsconfig.spec.json` (test environment config).
6. Create `libs/design-system/vitest.config.mts` (following `libs/utils` pattern).
7. Create `libs/design-system/src/index.ts` with placeholder exports.
8. Create `libs/design-system/src/styles/` directory with placeholder CSS files.
9. Create `libs/design-system/src/styles/index.css` that imports the sub-sheets.
10. Add `libs/design-system` to workspace `tsconfig.json` references (but don't add path alias yet — T-006 will do this).
11. Run `npx nx show project @academic-portfolio/design-system` to verify Nx recognizes it.

## Acceptance criteria

- [ ] `npx nx show project @academic-portfolio/design-system` succeeds and shows the `design-system` tag.
- [ ] `npx nx run @academic-portfolio/design-system:typecheck` passes (or the target exists).
- [ ] `npx nx run @academic-portfolio/design-system:lint` passes.
- [ ] `npx nx run @academic-portfolio/design-system:test` passes (even with no tests yet — use `passWithNoTests` if Nx requires tests).
- [ ] The library's `tsconfig.lib.json` include/exclude patterns match the existing library pattern.
- [ ] `npx nx graph` shows `@academic-portfolio/design-system` as a separate project node.

## Tests and validation commands

```bash
npx nx show project @academic-portfolio/design-system
npx nx run @academic-portfolio/design-system:lint
npx nx run @academic-portfolio/design-system:test
npx nx graph
```

## Documentation updates

- `docs/architecture/decisions/0008-design-system.md` — references this ticket.
- `docs/architecture/overview.md` — add design-system to the library table.
- `AGENTS.md` — add design-system to the library list.

## Risks and rollback

- **Risk:** The library's tsconfig may conflict with the workspace's `customConditions` (`@academic-portfolio/source`). Mitigation: follow the exact pattern of `libs/utils`.
- **Risk:** Nx may not recognize the test target without a `vitest.config.mts`. Mitigation: follow `libs/navigation/vitest.config.mts` pattern.
- **Rollback:** Delete `libs/design-system/` directory. No other files are modified in this ticket.
