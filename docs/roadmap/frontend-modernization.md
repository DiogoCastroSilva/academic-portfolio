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
- Hero balance and portrait sizing at short desktop heights and narrow mobile widths (see `frontend-design-principles.md §12` for full list of browser-only QA items).
- Featured-project composition and image proportions across all breakpoints.
- Scroll-triggered reveal behavior: verify `viewport: { once: true }` replay prevention in a real browser.
- No-JavaScript state: verify content visibility when `data-js` is absent from `<html>`.
- Static asset URL verification under `/academic-portfolio` base path in deployed output.
- Browser console errors and network failures at `/academic-portfolio/` routes.

**Phase 3 fixes (completed in this pass — see `frontend-design-principles.md §12` for details):**

- [x] Reduced `MOTION_OFFSET` from `20px` to `12px` (within handoff's `8–14px` range) in both `motion-config.ts` and `tokens.css`.
- [x] Fixed `AboutHero` portrait `scale` animation: added `.motion-portrait-initial` CSS class with `scale(0.9) translateY(var(--motion-offset))`, applied alongside `.motion-item-initial` on the portrait wrapper.
- [x] Added `initial: false` to child Motion elements (`MotionHeading`, `MotionArticle`) in `ContentCardSection` and `PublicationRowSection` via the shared `motionProps` object.
- [x] Fixed `AboutSection` and `AboutHero` image `sizes` to match actual class-based rendered dimensions.
- [x] Extracted shared `MOTION_VIEWPORT` constant (with `once: true`) from `motion-config.ts` and used it across all Motion components.
- [x] Added no-JS integration tests in `AboutSection.test.tsx`.
- [x] Added replay-prevention test in `motion-config.test.ts` verifying `MOTION_VIEWPORT.once === true`.
- Updated Motion system consistency test range from `16–20px` to `8–14px`.

**Remaining known limitations (see `frontend-design-principles.md §12` for full details):**

- Section duration has been fixed: `MOTION_DURATION_SECTION = 0.45s` is now within the handoff's `350–450ms` range.
- `AboutHero` uses mount-triggered `animate: "visible"` rather than scroll — single-frame flash window before React/Motion hydrates (warrants browser verification).
- Markdown-to-HTML rendering has **no HTML sanitizer** applied (Phase 6 security priority — requires new dependency).
- `ContentDetail` not listed in handoff's "Relevant files" section.
