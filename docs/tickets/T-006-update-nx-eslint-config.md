# T-006: Update Nx tags, ESLint depConstraints, and config for design system

- **Status:** Done
- **Phase:** 4 — Design-system foundation
- **Priority:** P0
- **Dependencies:** T-001

## Context

Once `libs/design-system/` exists as an Nx project, the module-boundary enforcement, TypeScript path resolution, and Next.js transpilation must all be updated to recognize it. The current `depConstraints` in `eslint.config.mjs` only knows about `app`, `content-layer`, and `foundation` tags.

## Problem

Without updating these configs:

- `@nx/enforce-module-boundaries` will not enforce that `design-system` only depends on `foundation`.
- TypeScript won't resolve `@academic-portfolio/design-system` imports.
- `next build` won't transpile the design-system package.
- `@source` paths in `tw-input.css` won't include the library's source files.

## Desired outcome

The design-system library is fully integrated into the Nx workspace, TypeScript path mapping, ESLint boundaries, Next.js transpilation, and Tailwind `@source` detection.

## Scope

### In scope

- Add `"design-system"` tag to `libs/design-system/project.json`
- Add `@academic-portfolio/design-system` to `transpilePackages` in `apps/main/next.config.mjs`
- Add `@academic-portfolio/design-system` path alias to `tsconfig.base.json`
- Add `@academic-portfolio/design-system` path alias to `apps/main/tsconfig.json`
- Update `eslint.config.mjs` `depConstraints`:
  ```js
  { sourceTag: "app", onlyDependOnLibsWithTags: ["design-system", "content-layer", "foundation"] },
  { sourceTag: "content-layer", onlyDependOnLibsWithTags: ["design-system", "foundation"] },
  { sourceTag: "design-system", onlyDependOnLibsWithTags: ["foundation"] },
  { sourceTag: "foundation", onlyDependOnLibsWithTags: [] }
  ```
- Add `@source "../../libs/design-system/src/**/*.{js,ts,jsx,tsx,html}";` to `apps/main/tw-input.css`
- Add `libs/design-system` to workspace root `tsconfig.json` references

### Out of scope

- Any changes to library source code (that's T-001–T-005's job)
- Changing existing tag names or `depConstraints` behavior for current libraries

## Files affected

- `libs/design-system/project.json` (add `"design-system"` tag — see T-001)
- `apps/main/next.config.mjs` (add to transpilePackages)
- `tsconfig.base.json` (add path alias)
- `apps/main/tsconfig.json` (add path alias)
- `tsconfig.json` (add workspace reference)
- `eslint.config.mjs` (add depConstraints rule)
- `apps/main/tw-input.css` (add @source path)

## Implementation steps

1. Verify T-001 created `project.json` with `"tags": ["design-system"]`.
2. Add `@academic-portfolio/design-system` to `transpilePackages` in `next.config.mjs` (alphabetical order).
3. Add `"@academic-portfolio/design-system": ["./libs/design-system/src/index.ts"]` to `tsconfig.base.json` paths.
4. Add the same path alias to `apps/main/tsconfig.json` paths.
5. Add `{ "path": "./libs/design-system" }` to `tsconfig.json` references.
6. Update `depConstraints` array in `eslint.config.mjs` to include the new `design-system` tag.
7. Add `@source "../../libs/design-system/src/**/*.{js,ts,jsx,tsx,html}";` to `tw-input.css`.
8. Run `npx nx show project @academic-portfolio/design-system` to verify tag.
9. Run ESLint with a deliberate violation to confirm boundary enforcement works.
10. Run `npx nx run-many -t lint test typecheck build` to verify no regressions.

## Acceptance criteria

- [ ] `npx nx show project @academic-portfolio/design-system` shows tag `["design-system"]`.
- [ ] Importing `@academic-portfolio/design-system` from `apps/main/src/` resolves in TS.
- [ ] Importing `@academic-portfolio/design-system` from a `foundation` library (e.g., `libs/content`) triggers an ESLint `@nx/enforce-module-boundaries` violation.
- [ ] `next build` transpiles `@academic-portfolio/design-system` (no "package not found" or untranspiled JSX errors).
- [ ] `npx nx run-many -t lint test typecheck build` passes for all 8 projects.
- [ ] Tailwind `@source` includes the design-system source.

## Tests and validation commands

```bash
npx nx show project @academic-portfolio/design-system
npx nx run-many -t lint test typecheck build
# Deliberate boundary test:
# In libs/content/src/something.ts, add:
# import { X } from "@academic-portfolio/design-system";
# Then run: npx nx run @academic-portfolio/content:lint  # should fail
```

## Documentation updates

- ADR-0008: reference this ticket for boundary rules.
- `docs/architecture/overview.md`: update module boundary rules table.

## Risks and rollback

- **Risk:** Adding a new `depConstraint` for `design-system` might conflict with existing constraints if the order is wrong. Mitigation: place the `design-system` constraint after `content-layer` and before `foundation`.
- **Risk:** Missing a `@source` path causes Tailwind to strip classes in production builds (silent failure). Mitigation: after any component is promoted, run `npx nx build main` and grep the CSS output for known classes.
- **Rollback:** Revert all config changes. The library still works if imported via relative paths.
