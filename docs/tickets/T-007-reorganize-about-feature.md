# T-007: Reorganize About-feature UI into `features/about/`

- **Status:** Done
- **Phase:** 5 — Feature-driven UI organization
- **Priority:** P1
- **Dependencies:** T-001–T-006 (design system created and integrated)

## Context

The `apps/main/src/app/ui/` folder currently mixes feature-specific components with shared primitives. The About page uses four feature-specific components: `AboutHero`, `EducationTimeline`, `ResearchInterests`, `SkillsGrid`. These all:

- Are `"use client"` components (use `motion/react`)
- Import domain types from `@academic-portfolio/content` (`ProfileData`, `EducationEntry`, `ResearchInterest`, `SkillCategory`)
- Are only used by `apps/main/src/app/about/page.tsx`

## Problem

There is no `features/` directory. About-specific components live alongside shared UI primitives, making it hard for contributors to understand what is reusable vs. page-specific.

## Desired outcome

About-specific components are organized under `apps/main/src/features/about/` with colocated tests. Route pages import from the new location. The `ui/` folder shrinks.

## Scope

### In scope

- Create `apps/main/src/features/` directory
- Create `apps/main/src/features/about/` directory
- Move:
  - `AboutHero.tsx` + `AboutHero.test.tsx` → `features/about/AboutHero/`
  - `EducationTimeline.tsx` → `features/about/EducationTimeline/` (has no test currently)
  - `ResearchInterests.tsx` → `features/about/ResearchInterests/` (has no test currently)
  - `SkillsGrid.tsx` + `SkillsGrid.test.tsx` → `features/about/SkillsGrid/`
- Create colocated `index.ts` barrel files
- Update imports in `apps/main/src/app/about/page.tsx`

### Out of scope

- Changing component behavior or visual output
- Moving `ContentDetail`, `ContentCardSection`, `AboutSection` (covered by T-008)
- Adding tests for components that don't have them (out of scope for this ticket; see T-010 or separate work)

## Files affected

- `apps/main/src/features/about/AboutHero/AboutHero.tsx` (moved)
- `apps/main/src/features/about/AboutHero/AboutHero.test.tsx` (moved)
- `apps/main/src/features/about/AboutHero/index.ts` (new)
- `apps/main/src/features/about/EducationTimeline/EducationTimeline.tsx` (moved)
- `apps/main/src/features/about/EducationTimeline/index.ts` (new)
- `apps/main/src/features/about/ResearchInterests/ResearchInterests.tsx` (moved)
- `apps/main/src/features/about/ResearchInterests/index.ts` (new)
- `apps/main/src/features/about/SkillsGrid/SkillsGrid.tsx` (moved)
- `apps/main/src/features/about/SkillsGrid/SkillsGrid.test.tsx` (moved)
- `apps/main/src/features/about/SkillsGrid/index.ts` (new)
- `apps/main/src/app/about/page.tsx` (update imports)
- Old files in `apps/main/src/app/ui/` (deleted)

## Implementation steps

1. Create `apps/main/src/features/about/` directory structure.
2. Move each component + its test into a subdirectory with an `index.ts` barrel.
3. Update imports in `apps/main/src/app/about/page.tsx` to use `../../features/about/...`.
4. Delete old files from `ui/`.
5. Run `npx nx run-many -t lint test typecheck build` to verify no regressions.

## Acceptance criteria

- [ ] `AboutHero`, `EducationTimeline`, `ResearchInterests`, `SkillsGrid` are in `features/about/`.
- [ ] `apps/main/src/app/about/page.tsx` imports from `features/about/`.
- [ ] Old `ui/AboutHero.tsx`, `ui/EducationTimeline.tsx`, `ui/ResearchInterests.tsx`, `ui/SkillsGrid.tsx` are deleted.
- [ ] All existing tests pass (including moved tests).
- [ ] `npx nx run-many -t lint test typecheck build` passes.
- [ ] About page renders identically in dev mode and production build.

## Tests and validation commands

```bash
npx nx run-many -t lint test typecheck build
npx nx run main:dev  # manual: verify /about/ renders correctly
```

## Documentation updates

- `docs/architecture/overview.md`: add `features/` to app structure.
- `AGENTS.md`: update library/component structure description.

## Risks and rollback

- **Risk:** The `reduced-motion.test.tsx` test in `ui/` may reference `AboutHero` or related components. Check before deleting.
- **Risk:** Test file paths change; vitest config uses `src/**/*.test.{ts,tsx}` glob, so moved tests should be picked up automatically.
- **Rollback:** Move files back, revert imports.
