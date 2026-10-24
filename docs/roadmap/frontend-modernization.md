# Frontend Modernization Roadmap

> **Status:** Active
> **Scope:** Frontend architecture, design system, and repository organization for `academic-portfolio`
> **Baseline:** 284 tests passing, lint/typecheck/build green (see `docs/architecture/audit-frontend-modernization.md`)

## Objective

Establish a scalable, clean, maintainable frontend architecture that clearly separates routes, feature-specific presentation, shared design primitives, and domain/content logic — while preserving all existing behavior, static export, GitHub Pages deployment, and test coverage.

## Compatibility maintenance

### CM-001 — Align the supported Node.js version

**Status: Planned; no repository changes made yet.** Keep this as a small compatibility task, separate from dependency upgrades and visual work.

- [ ] Update the root `package.json` `engines.node` range from `>=20.9.0` to `^22.12.0`, matching the current Node 22 baseline supported by Nx 22.
- [ ] Keep `.nvmrc` on `22` so local setup and GitHub Actions continue to select the Node 22 release line; verify the resolved version is at least 22.12.0.
- [ ] Confirm the README's Node 22 / npm requirements remain accurate and explain the minimum supported Node version if needed.
- [ ] Validate with the project's clean-install and full CI commands: `npm ci`, Prettier check, and `npx nx run-many -t lint test typecheck build`; verify static export and GitHub Pages base-path behavior.
- [ ] Do not upgrade unrelated packages as part of this task. Evaluate Node 24 support as a separate future compatibility change.

**Acceptance:** `package.json`, `.nvmrc`, README, and CI selection are consistent; all checks pass on the supported Node version. Record any checks not run locally rather than claiming them.

## Phases

### Phase 4 — Design-system foundation (NEW)

Create `libs/design-system/` as the canonical home for shared tokens, typography, and generic UI primitives. This phase is gated by ADR-0008.

- [ ] T-001: Create the `libs/design-system/` Nx library (project.json, package.json, tsconfig.lib.json, tsconfig.json)
- [ ] T-002: Migrate semantic CSS tokens and typography from `global.css` into `libs/design-system/src/styles/`
- [ ] T-003: Promote `ContentImage` to the design system (with tests)
- [ ] T-004: Promote `Pagination` to the design system (with tests)
- [ ] T-005: Promote `Breadcrumb` + `ChevronIcon` to the design system (with tests)
- [ ] T-006: Update Nx tags, ESLint depConstraints, `next.config.mjs`, `tsconfig.base.json`, and `tw-input.css` `@source` paths

**Gate:** Full `npx nx run-many -t lint test typecheck build` passes. ESLint `@nx/enforce-module-boundaries` verified with a deliberate boundary violation test.

### Phase 5 — Feature-driven UI organization

Reorganize feature-specific UI into `apps/main/src/features/` without breaking imports or visuals.

- [ ] T-007: Reorganize About-feature UI into `features/about/`
- [ ] T-008: Reorganize Content-feature UI into `features/content/`
- [ ] T-009: Move `Footer`, `CloudflareAnalytics` → `components/`; `JsonLd` → `lib/`
- [ ] T-010: Add regression tests for promoted and moved components

**Gate:** Full check suite passes. All route URLs and visual output unchanged.

### Phase 6 — Validation & handoff

- [ ] T-010b: Component documentation tooling evaluation (Storybook)
- [ ] Run full lint, typecheck, test, build, and prettier checks
- [ ] Verify static export output includes all design-system CSS
- [ ] Verify GitHub Pages base-path handling unchanged
- [ ] Update `AGENTS.md` with new workspace structure and commands
- [ ] Update `docs/architecture/overview.md` and `docs/architecture/frontend-design-principles.md`
- [ ] Update `docs/README.md` with new ADR and docs links

**Gate:** Owner approval. No regressions.
