# T-004: Promote `Pagination` to design system

- **Status:** Done
- **Phase:** 4 — Design-system foundation
- **Priority:** P1
- **Dependencies:** T-001, T-002

## Context

`Pagination` (`apps/main/src/app/ui/Pagination.tsx`) is a `"use client"` component that renders a path-based pager for static-export sites. It is used by `/projects/page/[page]/`, `/publications/page/[page]/`, and `/blog/page/[page]/` — three different content collections. It is not feature-specific.

## Problem

`Pagination` lives in the app's `ui/` folder alongside feature-specific components. There is no clear shared-UI boundary.

## Desired outcome

`Pagination` lives in `libs/design-system/src/lib/components/Pagination/` with colocated tests. All existing imports are updated.

## Scope

### In scope

- Move `Pagination.tsx` → `libs/design-system/src/lib/components/Pagination/Pagination.tsx`
- Move `Pagination.test.tsx` → colocated
- Create `index.ts` barrel
- Export from `libs/design-system/src/index.ts`
- Update imports in:
  - `apps/main/src/app/projects/page.tsx`
  - `apps/main/src/app/projects/page/[page]/page.tsx`
  - `apps/main/src/app/publications/page.tsx`
  - `apps/main/src/app/publications/page/[page]/page.tsx`
  - `apps/main/src/app/blog/page.tsx`
  - `apps/main/src/app/blog/page/[page]/page.tsx`
- `Pagination` imports `generatePageNumbers` from `../lib/pagination` — this helper either stays in the app or moves to the design system or utils library. Decision: `generatePageNumbers` is a pure utility; it should move to `libs/utils/` or stay colocated with `Pagination` in the design system. **Recommendation:** Move it to the design system since it is only used by `Pagination`.

### Out of scope

- Changing `Pagination`'s behavior, API, or URL format
- Migrating other components

## Files affected

- `libs/design-system/src/lib/components/Pagination/Pagination.tsx` (moved)
- `libs/design-system/src/lib/components/Pagination/Pagination.test.tsx` (moved)
- `libs/design-system/src/lib/components/Pagination/index.ts` (new)
- `libs/design-system/src/lib/components/Pagination/generatePageNumbers.ts` (moved from `apps/main/src/app/lib/pagination.ts`, or re-export)
- `libs/design-system/src/index.ts` (add export)
- Route pages listed above (update imports)
- `apps/main/src/app/lib/pagination.ts` — remove `generatePageNumbers`, keep `paginate` and `parsePageParam` (these are used by route pages, not the Pagination component)
- `apps/main/src/app/lib/pagination.test.ts` — update to only test `paginate` and `parsePageParam`

## Implementation steps

1. Decide: Move `generatePageNumbers` + `MAX_VISIBLE_PAGES` to the design system, keep `paginate` + `parsePageParam` + `PAGE_SIZE` + `PaginationResult` in the app.
2. Create `libs/design-system/src/lib/components/Pagination/` directory.
3. Move `Pagination.tsx` and its test to the new location.
4. Create `generatePageNumbers.ts` in the design system directory (moved from app's `pagination.ts`).
5. Create `index.ts` barrel.
6. Add exports to `libs/design-system/src/index.ts`.
7. Update all route page imports.
8. Update `apps/main/src/app/lib/pagination.ts` to remove `generatePageNumbers`.
9. Update `apps/main/src/app/lib/pagination.test.ts` to remove `generatePageNumbers` tests (now in design system).
10. Delete old `Pagination.tsx` and `Pagination.test.tsx` from `ui/`.

## Acceptance criteria

- [ ] `Pagination` is imported from `@academic-portfolio/design-system` in all route pages.
- [ ] `generatePageNumbers` is co-owned by `Pagination` in the design system.
- [ ] `paginate` and `parsePageParam` remain in the app's `lib/pagination.ts`.
- [ ] `npx nx run @academic-portfolio/design-system:test` passes.
- [ ] `npx nx run-many -t lint test typecheck build` passes.
- [ ] Pagination URLs are unchanged (`/blog/`, `/blog/page/2/`).
- [ ] No `@nx/enforce-module-boundaries` violations.

## Tests and validation commands

```bash
npx nx run @academic-portfolio/design-system:test
npx nx run-many -t lint test typecheck build
```

## Documentation updates

- ADR-0008: add Pagination to component inventory.
- `docs/design-system/components.md`: add Pagination usage.

## Risks and rollback

- **Risk:** Moving `generatePageNumbers` out of `pagination.ts` breaks `pagination.test.ts` (27 tests). Mitigation: carefully split tests — move Pagination-specific tests to the design system, keep `paginate`/`parsePageParam` tests in the app.
- **Risk:** `Pagination` is a `"use client"` component. The design system's tsconfig must support `jsx: react-jsx` (check `tsconfig.lib.json`).
- **Rollback:** Move files back, restore exports, revert imports.
