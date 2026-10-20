# T-008: Reorganize content-feature UI into `features/content/`

- **Status:** Done
- **Phase:** 5 — Feature-driven UI organization
- **Priority:** P1
- **Dependencies:** T-001–T-007

## Context

Three content-presentation components currently live in `apps/main/src/app/ui/`:

- `AboutSection` — homepage About preview (composition of `ContentImage` + profile data)
- `ContentCardSection` — collection card grid used by homepage + all collection listing pages
- `ContentDetail` — detail page content renderer (Markdown body + image + metadata)

These are content-presentation components: not generic primitives (so not design-system), but also not feature-specific to "about" (unlike the components in T-007). They represent the "content" feature — the presentation layer for portfolio content.

## Problem

All UI components are in one flat `ui/` folder. There is no separation between generic primitives, content-presentation components, feature-specific components, and app-global components.

## Desired outcome

Content-presentation components are organized under `apps/main/src/features/content/` with colocated tests. Route pages and the homepage import from the new location.

## Scope

### In scope

- Create `apps/main/src/features/content/` directory
- Move:
  - `AboutSection.tsx` + `AboutSection.test.tsx` → `features/content/AboutSection/`
  - `ContentCardSection.tsx` + `ContentCardSection.test.tsx` → `features/content/ContentCardSection/`
  - `ContentDetail.tsx` + `ContentDetail.test.tsx` → `features/content/ContentDetail/`
- Create colocated `index.ts` barrel files
- Update imports in:
  - `apps/main/src/app/page.tsx` (imports `AboutSection`, `ContentCardSection`)
  - `apps/main/src/app/about/page.tsx` (imports `AboutSection` — wait, this imports from `AboutHero` which is about-feature. Check if AboutSection is used by about page... NO, AboutSection is only on the homepage)
  - `apps/main/src/app/projects/page.tsx` (imports `ContentCardSection`)
  - `apps/main/src/app/projects/[slug]/page.tsx` (imports `ContentDetail`)
  - `apps/main/src/app/publications/page.tsx` (imports `ContentCardSection`)
  - `apps/main/src/app/publications/[slug]/page.tsx` (imports `ContentDetail`)
  - `apps/main/src/app/blog/page.tsx` (imports `ContentCardSection`)
  - `apps/main/src/app/blog/[slug]/page.tsx` (imports `ContentDetail`)

### Out of scope

- Moving `ContentImage`, `Pagination`, `Breadcrumb` (already promoted to design system in T-003–T-005)
- Moving about-feature components (T-007)
- Changing component behavior or visual output

## Files affected

- `apps/main/src/features/content/AboutSection/AboutSection.tsx` (moved)
- `apps/main/src/features/content/AboutSection/AboutSection.test.tsx` (moved)
- `apps/main/src/features/content/AboutSection/index.ts` (new)
- `apps/main/src/features/content/ContentCardSection/ContentCardSection.tsx` (moved)
- `apps/main/src/features/content/ContentCardSection/ContentCardSection.test.tsx` (moved)
- `apps/main/src/features/content/ContentCardSection/index.ts` (new)
- `apps/main/src/features/content/ContentDetail/ContentDetail.tsx` (moved)
- `apps/main/src/features/content/ContentDetail/ContentDetail.test.tsx` (moved)
- `apps/main/src/features/content/ContentDetail/index.ts` (new)
- All route pages listed above (update imports)
- Old files in `apps/main/src/app/ui/` (deleted)

## Implementation steps

1. Create `apps/main/src/features/content/` directory structure.
2. Move each component + its test into a subdirectory with an `index.ts` barrel.
3. Update imports in all consuming route pages and the homepage.
4. Delete old files from `ui/`.
5. Run `npx nx run-many -t lint test typecheck build` to verify no regressions.

## Acceptance criteria

- [ ] `AboutSection`, `ContentCardSection`, `ContentDetail` are in `features/content/`.
- [ ] All route pages and homepage import from `features/content/`.
- [ ] Old `ui/AboutSection.tsx`, `ui/ContentCardSection.tsx`, `ui/ContentDetail.tsx` are deleted.
- [ ] All existing tests pass (including colocated tests).
- [ ] `npx nx run-many -t lint test typecheck build` passes.
- [ ] All routes render identically in dev mode and production build.

## Tests and validation commands

```bash
npx nx run-many -t lint test typecheck build
npx nx run main:dev  # manual: verify all collection pages and detail pages
```

## Documentation updates

- `docs/architecture/overview.md`: add `features/` to app structure.
- `AGENTS.md`: update library/component structure description.

## Risks and rollback

- **Risk:** High number of import paths to update across 7+ files. Mitigation: use a script or careful search-and-replace, verify with lint.
- **Risk:** The `reduced-motion.test.tsx` test in `ui/` may reference `ContentCardSection`. Check before deleting.
- **Rollback:** Move files back, revert imports.
