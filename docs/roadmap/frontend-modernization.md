# Frontend Modernization Roadmap

> **Status:** Active
> **Scope:** Frontend architecture, design system, and repository organization for `academic-portfolio`
> **Baseline:** 679 tests passing, lint/typecheck/build green (8 projects; see `docs/architecture/audit-frontend-modernization.md` for the pre-modernization audit baseline of 284 tests).

## Objective

Establish a scalable, clean, maintainable frontend architecture that clearly separates routes, feature-specific presentation, shared design primitives, and domain/content logic — while preserving all existing behavior, static export, GitHub Pages deployment, and test coverage.

## Compatibility maintenance

### CM-001 — Align the supported Node.js version

**Status: Done** — `package.json` engine range updated to `^22.12.0`, README updated to "Node.js 22.12.0+", `.nvmrc` confirmed on `22`. CI uses `.nvmrc` for version selection. Full `npx nx run-many -t lint test typecheck build` passes.

- [x] Update the root `package.json` `engines.node` range from `>=20.9.0` to `^22.12.0`, matching the current Node 22 baseline supported by Nx 22.
- [x] Keep `.nvmrc` on `22` so local setup and GitHub Actions continue to select the Node 22 release line; verify the resolved version is at least 22.12.0.
- [x] Confirm the README's Node 22 / npm requirements remain accurate and explain the minimum supported Node version if needed.
- [x] Validate with the project's clean-install and full CI commands: `npm ci`, Prettier check, and `npx nx run-many -t lint test typecheck build`; verify static export and GitHub Pages base-path behavior.
- [x] Do not upgrade unrelated packages as part of this task. Evaluate Node 24 support as a separate future compatibility change.

**Acceptance:** `package.json`, `.nvmrc`, README, and CI selection are consistent; all checks pass on the supported Node version. Record any checks not run locally rather than claiming them.

## Phases

### Phase 4 — Design-system foundation (NEW)

Create `libs/design-system/` as the canonical home for shared tokens, typography, and generic UI primitives. This phase is gated by ADR-0008.

- [x] T-001: Create the `libs/design-system/` Nx library (project.json, package.json, tsconfig.lib.json, tsconfig.json)
- [x] T-002: Migrate semantic CSS tokens and typography from `global.css` into `libs/design-system/src/styles/`
- [x] T-003: Promote `ContentImage` to the design system (with tests)
- [x] T-004: Promote `Pagination` to the design system (with tests)
- [x] T-005: Promote `Breadcrumb` + `ChevronIcon` to the design system (with tests)
- [x] T-006: Update Nx tags, ESLint depConstraints, `next.config.mjs`, `tsconfig.base.json`, and `tw-input.css` `@source` paths

**Gate:** Full `npx nx run-many -t lint test typecheck build` passes. ESLint `@nx/enforce-module-boundaries` verified with a deliberate boundary violation test.

### Phase 5 — Feature-driven UI organization

Reorganize feature-specific UI into `apps/main/src/features/` without breaking imports or visuals.

- [x] T-007: Reorganize About-feature UI into `features/about/`
- [x] T-008: Reorganize Content-feature UI into `features/content/`
- [x] T-009: Move `Footer`, `CloudflareAnalytics` → `components/`; `JsonLd` → `lib/`
- [x] T-010: Add regression tests for promoted and moved components

**Gate:** Full check suite passes. All route URLs and visual output unchanged.

### Phase 6 — Validation & handoff

- [x] T-010b: Component documentation tooling evaluation (Storybook)
- [x] T-012: Promote `Tag` component to the design system (component, barrel export, tests)
- [x] Run full lint, typecheck, test, build, and prettier checks (679 tests, 8 projects)
- [x] Verify static export output includes all design-system CSS (inspected built CSS: tokens, themes, typography, and animations all present)
- [x] Verify GitHub Pages base-path handling unchanged (`next.config.mjs` uses `NEXT_PUBLIC_BASE_PATH` env var with `trailingSlash: true`)
- [x] Update `AGENTS.md` with new workspace structure and commands (added `Tag` to design-system component list)
- [x] Update `docs/architecture/overview.md` and `docs/architecture/frontend-design-principles.md` (added `Tag` to component lists)
- [x] Update `docs/README.md` with new ADR and docs links (updated ticket range to T-012)

**Gate:** Owner approval. No regressions.

**Open items (browser-only checks not performed in this audit pass):**

- Visual contrast measurement of inline-code vs. fenced-code in both themes (source-level review only).
- Live `prefers-reduced-motion` behavior verification in a browser (covered by `tokens.css` media query and `motion-reduce:animate-none` utility classes in source).
