# T-010: Add regression tests for promoted and moved components

- **Status:** Done
- **Phase:** 5 — Feature-driven UI organization
- **Priority:** P1
- **Dependencies:** T-003, T-004, T-005, T-007, T-008

## Context

Several components are being moved from `apps/main/src/app/ui/` to either `libs/design-system/` or `apps/main/src/features/`. Some of these components currently lack dedicated tests (e.g., `EducationTimeline`, `ResearchInterests`). The brief requires "Tests for meaningful behavior" for all components.

## Problem

Moving components without ensuring test coverage risks regressions. Components that currently lack tests will have no safety net after the move.

## Desired outcome

All promoted and moved components have colocated tests covering meaningful behavior:

- Semantic element + accessible name
- Variants/sizes (where applicable)
- Disabled/interactive behavior (where applicable)
- Keyboard/focus behavior
- Typography semantics (where applicable)
- Reduced-motion compliance (where applicable)

## Scope

### In scope

- **Design system components:**
  - `ContentImage.test.tsx` — extend with: `<picture>` rendering for WebP, `alt` attribute, `priority` → `fetchPriority="high"`, SVG passthrough, `StaticImageData` passthrough
  - `Pagination.test.tsx` — already has 3 test file? Check current test coverage. (Current: `apps/main/src/app/ui/Pagination.test.tsx` exists with tests)
  - `Breadcrumb.test.tsx` — already exists (current: `apps/main/src/app/ui/Breadcrumb.test.tsx`)

- **Feature components (new tests needed):**
  - `EducationTimeline` — add `EducationTimeline.test.tsx` (a11y, reduced-motion, renders all items)
  - `ResearchInterests` — add `ResearchInterests.test.tsx` (a11y, renders all items, icon handling)

- **Content feature components:**
  - `AboutSection.test.tsx` — already exists
  - `ContentCardSection.test.tsx` — already exists
  - `ContentDetail.test.tsx` — already exists

### Out of scope

- Adding tests for `Footer` or `CloudflareAnalytics` (no current tests; not required for this ticket — can be T-010b or future work)
- Rewriting existing tests to change assertions
- Adding Storybook (see T-010b)

## Files affected

- `libs/design-system/src/lib/components/ContentImage/ContentImage.test.tsx` (extended)
- `libs/design-system/src/lib/components/Pagination/Pagination.test.tsx` (moved)
- `libs/design-system/src/lib/components/Breadcrumb/Breadcrumb.test.tsx` (moved)
- `apps/main/src/features/about/EducationTimeline/EducationTimeline.test.tsx` (new)
- `apps/main/src/features/about/ResearchInterests/ResearchInterests.test.tsx` (new)

## Implementation steps

1. Verify existing test files are moved with their components (T-003–T-008 handle this).
2. Extend `ContentImage` tests with new cases.
3. Add new test files for `EducationTimeline` and `ResearchInterests`.
4. Run `npx nx run @academic-portfolio/design-system:test` and `npx nx run @academic-portfolio/main:test`.
5. Verify a11y tests pass using `expectNoA11yViolations`.

## Acceptance criteria

- [x] All moved components have passing colocated tests.
- [x] `ContentImage` tests cover WebP `<picture>` rendering, `fetchPriority`, SVG passthrough.
- [x] `EducationTimeline` has a new test file with a11y + reduced-motion checks (see `reduced-motion.test.tsx`).
- [x] `ResearchInterests` has a new test file with a11y + rendering checks.
- [x] `npx nx run-many -t lint test typecheck build` passes.
- [x] No existing tests were weakened or deleted.

## Tests and validation commands

```bash
npx nx run @academic-portfolio/design-system:test
npx nx run @academic-portfolio/main:test
npx nx run-many -t lint test typecheck build
```

## Documentation updates

- `docs/architecture/decisions/0005-testing-strategy.md` — update test count.
- `docs/architecture/decisions/0008-design-system.md` — update test expectations.

## Risks and rollback

- **Risk:** New test files for `EducationTimeline` and `ResearchInterests` use `motion/react` — need to mock or handle the `useReducedMotion` hook in tests. Mitigation: follow the pattern in `reduced-motion.test.tsx` which tests CSS animation compliance.
- **Rollback:** Delete new test files, revert extended assertions.
