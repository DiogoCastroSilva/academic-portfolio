# ADR-0008: Design-system library

- **Status:** Proposed → Accepted
- **Adopts:** Contradicts and supersedes conflicting statements in ADR-0006 §CSS architecture ("There is no standalone design-system package"), `frontend-design-principles.md` §11 ("No separate design-system package"), and `goals-and-requirements.md` Phase 3 last bullet ("do not create a separate design-system package without a concrete need").
- **Conflicts with:** None after this ADR is accepted — this document is the authoritative source for the design-system decision.

## Context

The application has grown to 14 UI components in `apps/main/src/app/ui/`, mixing genuinely generic UI primitives with feature-specific presentation. Tokens live in `global.css` as semantic CSS custom properties but have no single library-level owner. Contributors cannot easily distinguish where a new shared component belongs, what is feature-specific, and what is application-global.

The previous decision (ADR-0006, frontend-design-principles.md §11) was "no separate design-system package" because the component count was small and the CSS token set was minimal. Since then:

- The `ui/` folder has doubled in size (from ~7 to 14 components).
- Five components — `ContentImage`, `Pagination`, `Breadcrumb`, `ChevronIcon`, and `Tag` — are used across multiple feature routes and are not feature-specific.
- The semantic token system is stable with ~15 custom properties, dark-mode overrides, and prose typography rules that are currently scattered in `global.css`.
- Fork owners who want to customize the template would benefit from a clear "shared UI / change carefully" boundary.

## Decision

Create `libs/design-system/` as a single Nx library (one package — no splitting of tokens, typography, and UI into separate libraries). It will be the canonical owner of:

1. **Semantic CSS custom properties** (design tokens): surface, text, link, border, focus, status, typography roles, radius, shadow, motion.
2. **Typography foundation**: prose styles, heading scales, the `.profile-name` rule, caption/metadata styles.
3. **Shared UI primitives**: only components that are genuinely feature-agnostic and used across multiple feature routes. Initial set: `ContentImage`, `Pagination`, `Breadcrumb`, the `ChevronIcon` icon, and `Tag`. **No speculative Button, Badge, Card, Heading, or Text components** unless evidence of duplication arises. The set grew from 4 to 5 components with the T-012 Tag promotion.
4. **Animation utilities**: `.animate-fadeInUp` keyframes and reduced-motion fallbacks.

### Dependency direction (Nx module boundaries)

| Caller | Can depend on |
| ------ | ------------- |

### CSS integration

- `libs/design-system/src/styles/index.css` is the single CSS entry point, importing tokens, themes, typography, and animations.
- `apps/main/src/app/global.css` imports the design-system CSS **once** via a relative path, then retains only truly app-specific overrides (if any).
- `apps/main/tw-input.css` `@source` paths are extended to include `../../libs/design-system/src/**/*.{js,ts,jsx,tsx,html}`.
- No CSS file is imported twice; no circular CSS imports.

### Public API

Only stable, intended exports are exposed through `libs/design-system/src/index.ts`. Internal implementation files (test helpers, private utilities) are not re-exported. CSS is imported by path, not via the JS entry point.

### Testing

- Colocated `*.test.tsx` files alongside each component.
- Tests cover: semantic element + accessible name, variants/sizes, disabled behavior, keyboard/focus behavior, and reduced-motion compliance.
- The shared `expectNoA11yViolations` helper from `@academic-portfolio/utils/test-helpers/a11y` is used where feasible.
- A Vitest config is created for the library (following the `libs/utils` pattern).

## Alternatives considered

- **Keep tokens in `global.css`, no design-system library:** Simpler short-term, but provides no clear boundary between generic UI and feature-specific UI. New contributors cannot easily identify reusable primitives. Fork owners have no "shared UI" marker.
- **Multiple design-system libraries (tokens, typography, ui):** Adds Nx project complexity and circular-dependency risk for unclear benefit at this scale. Single library is the documented starting point.
- **Storybook for component examples:** Evaluated in Ticket T-010b. `eslint-plugin-storybook` is already in `devDependencies` (required by the shared ESLint config). Storybook is deferred — see T-010b for the full evaluation and decision rationale.

## Consequences and trade-offs

- Adds one Nx project + one path alias + one entry in `transpilePackages` and `tsconfig.base.json`.
- CSS import chain: `tw-input.css` → `global.css` (imports design-system CSS) → `layout.tsx`. Static-export-safe.
- Component extraction to the design system is **incremental** — one component at a time with full regression tests.
- The `foundation` layer remains the lowest dependency tier; design system sits between `foundation` and `content-layer`/`app`.
- No new runtime dependencies introduced.

## Evidence or validation

- Baseline: `npx nx run-many -t lint test typecheck build` passes (8 projects, 679 tests).
- After each component promotion, the full check suite must still pass.
- ESLint `@nx/enforce-module-boundaries` enforces that `design-system` cannot import `app` or `content-layer` code.
- Visual regression: production CSS output must include all design-system token declarations.

## Conditions for revisiting

If the component count in the design system remains small (< 3 generic components) for more than 2 major cycles, or if the CSS token system remains unused by any component for 3 months, reconsider consolidating back into `global.css`.
| `app` (`apps/main`) | `design-system`, `content-layer`, `foundation` |
| `content-layer` (projects, publications, blog) | `design-system`, `foundation` |
| `design-system` | `foundation` only |
| `foundation` (content, navigation, utils) | nothing (external only) |

A new Nx tag `design-system` is added. `depConstraints` in `eslint.config.mjs` are updated accordingly.
These are concrete, evidence-based reasons for a design-system library, satisfying the "concrete need" threshold from `goals-and-requirements.md`.
