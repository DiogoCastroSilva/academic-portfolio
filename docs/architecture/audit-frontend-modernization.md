# Audit: Frontend Architecture, Design System & Repository Organization

> **Audit date:** 2026-10-20
> **Auditor:** AI coding assistant (planning phase)
> **Repository:** `DiogoCastroSilva/academic-portfolio` @ `cd885153`
> **Branch:** `main` (working tree clean)

## 1. Baseline Status

### Baseline checks (all passing)

```text
npx nx run-many -t lint test typecheck build  # 7 projects, 284 tests, 0 lint errors
npx prettier --check .                        # All files pass formatting
```

- **Projects:** 7 (1 app + 6 libraries)
- **Tests:** 284 passing across 26 test files
- **Lint:** 0 errors, 5 warnings (pre-existing, acceptable)
- **Build:** `nx build main` succeeds
- **TypeScript:** all 7 project references type-check cleanly

### Workspace structure (as of audit)

```text
apps/main/
  src/
    app/
      layout.tsx, page.tsx, about/page.tsx
      projects/  (page.tsx, [slug]/page.tsx, page/[page]/page.tsx)
      publications/  (same structure as projects)
      blog/  (same structure as projects)
      ui/  ALL reusable + feature-specific UI components live here
        AboutHero.tsx        (Client)  about hero with motion
        AboutSection.tsx      (Server)  homepage about preview
        ContentCardSection.tsx (Server)  generic card grid for collections
        ContentDetail.tsx     (Server)  detail page content renderer
        ContentImage.tsx      (Server)  WebP-aware image component
        Footer.tsx            (Server)  site footer
        Breadcrumb.tsx        (Server)  breadcrumb navigation
        Pagination.tsx        (Client)  path-based pager
        JsonLd.tsx            (Server)  JSON-LD script injection
        CloudflareAnalytics.tsx (Client)  analytics script
        EducationTimeline.tsx  (Client)  about timeline with motion

### Nx module-boundary tags (current)

Defined in each library's `project.json` and enforced in `eslint.config.mjs`:

| Tag             | Libraries                          | Depends on                    |
| --------------- | ---------------------------------- | ----------------------------- |
| `app`           | `apps/main`                        | `content-layer`, `foundation` |
| `content-layer` | `projects`, `publications`, `blog` | `foundation`                  |
| `foundation`    | `content`, `navigation`, `utils`   | nothing (external only)       |

This enforces the dependency layers: app → content-layer → foundation → external.

### CSS architecture (current)

```

apps/main/tw-input.css
├── @import "tailwindcss";
├── @source "./src/**/\*.{js,ts,jsx,tsx,md,mdx,html}";
├── @source "../../libs/navigation/src/**/_.{js,ts,jsx,tsx,md,mdx,html}";
├── @source "../../libs/projects/src/\*\*/_.md";
├── @source "../../libs/publications/src/\*_/_.md";

apps/main/src/app/global.css
├── @import "../../tw-input.css";

## 2. Issues Found in the Implementation Brief

After auditing the implementation brief against the actual repository, the following issues are identified:

### Issue 1: Documentation contradiction — "no design-system package" (CRITICAL)

The brief proposes creating `libs/design-system/` as the canonical home for shared design tokens, typography, and UI primitives. However, three existing documentation sources explicitly prohibit this:

1. ADR-0006 §CSS architecture (line 27): "There is no standalone design-system package — tokens are intentionally lightweight."
2. frontend-design-principles.md §11 (line 108): "No separate design-system package — shared UI lives in `apps/main/src/app/ui/`."
3. goals-and-requirements.md Phase 3 (last bullet): "Keep the UI system compact; do not create a separate design-system package without a concrete need."

**Resolution:** A new ADR (ADR-0008) documents the concrete need justifying a design-system package, superseding the conflicting statements. The audit identifies the concrete need: the codebase has 14 UI components in a flat `ui/` folder, and promoting only the 4 genuinely generic components requires a clear boundary and ownership model.

### Issue 2: Missing Nx tag for the new design-system library

The brief specifies dependency-boundary rules but does not define the Nx tag for `libs/design-system/`. The current tag system is `app` → `content-layer` → `foundation`. A new `design-system` tag and updated `depConstraints` are required (detailed in T-006).

### Issue 3: CSS `@source` paths and import chain not addressed

The `tw-input.css` file declares `@source` paths that include `../../libs/navigation/src/**/*` and `../../libs/projects/src/**/*.md`. If design-system components are moved to `libs/design-system/src/`, these `@source` paths will not cover them, and Tailwind's JIT compiler will strip their utility classes in production. The brief does not explicitly flag this requirement.

### Issue 4: Component analysis missing — current components are mostly domain-specific

The brief's "candidate initial components" (Button, Badge, Card, Container, Heading, Text, Prose) do not exist in the current codebase. Only 4 of 14 current UI components are generic enough for a design system (see §3). Creating new generic components "because they appear in a list" violates the hard constraint against speculative abstractions.

### Issue 5: Proposed `features/` directory lacks concrete ownership plan

The brief proposes creating `apps/main/src/features/{home,about,content,seo}/` but does not define Nx boundary tags for features, specify import update strategy, or address test file relocation.

### Issue 6: Storybook evaluation lacks context from existing devDependency

`eslint-plugin-storybook` (^10.0.0) is already in `devDependencies` (required by the shared ESLint config). The brief's evaluation ticket should note this — Storybook was partially anticipated but is not configured. T-010b provides a documented deferral with rationale.

## 3. Component Classification Matrix

### Current components and their target ownership

| Component             | Current     | Target                            | Rationale                                         |
| --------------------- | ----------- | --------------------------------- | ------------------------------------------------- |
| `ContentImage`        | `ui/`       | `libs/design-system`              | Generic WebP-aware image; used across features    |
| `Pagination`          | `ui/`       | `libs/design-system`              | Generic path-based pager; used by all collections |
| `Breadcrumb`          | `ui/`       | `libs/design-system`              | Generic navigation; used by all detail pages      |
| `ChevronIcon`         | `ui/icons/` | `libs/design-system/icons/`       | Generic icon, used by Breadcrumb                  |
| `AboutHero`           | `ui/`       | `features/about/`                 | About-feature-specific; uses profile data         |
| `EducationTimeline`   | `ui/`       | `features/about/`                 | About-feature-specific; uses EducationEntry       |
| `ResearchInterests`   | `ui/`       | `features/about/`                 | About-feature-specific; uses ResearchInterest     |
| `SkillsGrid`          | `ui/`       | `features/about/`                 | About-feature-specific; uses SkillCategory        |
| `AboutSection`        | `ui/`       | `features/content/`               | Homepage content composition                      |
| `ContentCardSection`  | `ui/`       | `features/content/`               | Content-collection-specific; uses ContentMeta     |
| `ContentDetail`       | `ui/`       | `features/content/`               | Content-detail-specific; uses ContentItemMeta     |
| `Footer`              | `ui/`       | `components/Footer/`              | App-global; config-driven                         |
| `JsonLd`              | `ui/`       | `lib/JsonLd.tsx`                  | Utility component, not UI primitive               |
| `CloudflareAnalytics` | `ui/`       | `components/CloudflareAnalytics/` | App-global; not a UI primitive                    |

### Tokens and typography (current → target)

| Asset | Current | Target |

## 4. Updated Plan

The original implementation brief is structurally sound but requires adjustments to align with the existing repository's conventions, documentation, and tag system. See:

- **Roadmap:** [`docs/roadmap/frontend-modernization.md`](roadmap/frontend-modernization.md) — updated, phased implementation plan
- **Tickets:** [`docs/tickets/`](tickets/) — implementation-ready work items (T-001 through T-010b)
- **ADR-0008:** New decision record for the design-system library, superseding conflicting statements in ADR-0006 §CSS architecture, frontend-design-principles.md §11, and goals-and-requirements.md Phase 3

### Reconciliation of phases

| Brief phase                     | Existing goal phase              | Reconciliation                                                      |
| ------------------------------- | -------------------------------- | ------------------------------------------------------------------- |
| Brief Phase 1 (Audit)           | Existing Phase 1-3 (in-progress) | This audit document completes Brief Phase 1.                        |
| Brief Phase 2 (Design-system)   | New work                         | New Phase 4 in the updated roadmap.                                 |
| Brief Phase 3 (App org)         | Existing Phase 3                 | Updated roadmap keeps app reorg as Phase 5, conditional on Phase 4. |
| Brief Phase 4 (Validation)      | Existing Phase 6                 | Existing Phase 6 is renamed Phase 6 (Validation & handoff).         |
| ---                             | ---                              | ---                                                                 |
| Semantic color tokens (`:root`) | `global.css`                     | `libs/design-system/src/styles/tokens.css`                          |
| Dark-mode token overrides       | `global.css`                     | `libs/design-system/src/styles/themes.css`                          |
| Prose typography styles         | `global.css`                     | `libs/design-system/src/styles/typography.css`                      |
| `.profile-name` typography      | `global.css`                     | `libs/design-system/src/styles/typography.css`                      |
| `.animate-fadeInUp` keyframes   | `global.css`                     | `libs/design-system/src/styles/animations.css`                      |
| Reduced-motion global reset     | `global.css`                     | `libs/design-system/src/styles/tokens.css`                          |
| Tailwind `@import` + `@source`  | `tw-input.css`                   | Stay in `apps/main/tw-input.css`                                    |

### CSS import flow (proposed)

```
apps/main/tw-input.css          → @import "tailwindcss" + @source paths (updated)
  ↑ (imported by)
apps/main/src/app/global.css    → @import design-system CSS, then app-specific overrides
  ↑ (imported by)
apps/main/src/app/layout.tsx    → @import "./global.css"
```

Design-system CSS entry: `libs/design-system/src/styles/index.css` aggregates tokens, themes, typography, and animations.

### Issue 7: `next.config.mjs transpilePackages` and `tsconfig.base.json` paths not addressed

Adding a new library requires updating `transpilePackages`, `tsconfig.base.json` paths, `apps/main/tsconfig.json` paths, and workspace `tsconfig.json` references. T-006 covers these.

### Issue 8: Phase structure conflicts with existing `goals-and-requirements.md`

The brief defines its own 4-phase structure. The existing `docs/product/goals-and-requirements.md` defines 6 phases with status tracking. The updated roadmap reconciles these (see §4).
├── :root { semantic CSS custom properties (tokens) }
├── @media (prefers-color-scheme: dark) { :root { ... } }
├── @media (prefers-reduced-motion: reduce) { _ { ... } }
├── @layer base { p, _, ::after, ... { box-sizing, border } }
├── .profile-name { ... }
├── .prose a { ... } (prose link styles)
├── .animate-fadeInUp { ... } (CSS keyframe animation)

```

### Documentation structure (current)

No `docs/design-system/`, `docs/roadmap/`, or `docs/tickets/` directories exist. Documentation lives in `docs/architecture/`, `docs/operations/`, `docs/performance/`, and `docs/product/`.
        ResearchInterests.tsx  (Client)  about interests grid with motion
        SkillsGrid.tsx        (Client)  about skills grid with motion
        icons/ChevronIcon.tsx
      lib/
        pagination.ts          pure pagination helpers
        structured-data.ts     JSON-LD schema builders
        og-image.ts            SVG OG image generation helpers
      configs/
        site-config.ts         site configuration (loads README.md)
  tw-input.css                 Tailwind import + @source directives
  test-setup.ts               Vitest setup (mocks next/link, server-only)
  vitest.config.mts
  next.config.mjs
  project.json                 tag: "app"
  tsconfig.json

libs/
  content/     tag: "foundation"  Markdown loading, frontmatter parsing, URL helpers
  navigation/  tag: "foundation"  NavBar component and route configuration
  projects/    tag: "content-layer" Project content (markdown) + library accessor
  publications/ tag: "content-layer" Publication content + library accessor
  blog/        tag: "content-layer" Blog content + library accessor
  utils/       tag: "foundation"  Shared utilities (date formatting, test helpers)
```
