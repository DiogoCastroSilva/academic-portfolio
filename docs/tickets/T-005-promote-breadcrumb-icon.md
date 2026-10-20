# T-005: Promote `Breadcrumb` + `ChevronIcon` to design system

- **Status:** To do
- **Phase:** 4 — Design-system foundation
- **Priority:** P1
- **Dependencies:** T-001, T-002

## Context

`Breadcrumb` (`apps/main/src/app/ui/Breadcrumb.tsx`) is a generic breadcrumb navigation component using `next/link`. It is used by `/projects/[slug]/page.tsx`, `/publications/[slug]/page.tsx`, and `/blog/[slug]/page.tsx`. It depends on `ChevronIcon` (in `apps/main/src/app/ui/icons/ChevronIcon.tsx`), a generic icon component.

Neither `Breadcrumb` nor `ChevronIcon` is feature-specific — they could be used by any collection detail page.

## Problem

These components live in the app's `ui/` folder, mixed with feature-specific components. The icon is in a separate `icons/` subdirectory with no clear ownership.

## Desired outcome

Both components live in `libs/design-system/` with colocated tests and barrel exports. All imports are updated.

## Scope

### In scope

- Move `ChevronIcon.tsx` → `libs/design-system/src/lib/icons/ChevronIcon.tsx`
- Move `Breadcrumb.tsx` → `libs/design-system/src/lib/components/Breadcrumb/Breadcrumb.tsx`
- Move `Breadcrumb.test.tsx` → colocated
- Create barrel exports: `libs/design-system/src/lib/icons/index.ts`, `.../Breadcrumb/index.ts`
- Export from `libs/design-system/src/index.ts`
- Update imports in:
  - `apps/main/src/app/projects/[slug]/page.tsx`
  - `apps/main/src/app/publications/[slug]/page.tsx`
  - `apps/main/src/app/blog/[slug]/page.tsx`
- Delete old `Breadcrumb.tsx`, `Breadcrumb.test.tsx`, `icons/ChevronIcon.tsx` from `ui/`

### Out of scope

- Creating new generic icons
- Changing the breadcrumb data model or behavior

## Files affected

- `libs/design-system/src/lib/icons/ChevronIcon.tsx` (moved)
- `libs/design-system/src/lib/icons/index.ts` (new)
- `libs/design-system/src/lib/components/Breadcrumb/Breadcrumb.tsx` (moved)
- `libs/design-system/src/lib/components/Breadcrumb/Breadcrumb.test.tsx` (moved)
- `libs/design-system/src/lib/components/Breadcrumb/index.ts` (new)
- `libs/design-system/src/index.ts` (add exports)
- Route pages listed above (update imports)
- `apps/main/src/app/ui/Breadcrumb.tsx` (delete)
- `apps/main/src/app/ui/Breadcrumb.test.tsx` (delete)
- `apps/main/src/app/ui/icons/ChevronIcon.tsx` (delete)

## Implementation steps

1. Create `libs/design-system/src/lib/icons/` directory.
2. Move `ChevronIcon.tsx` to `libs/design-system/src/lib/icons/`.
3. Create `libs/design-system/src/lib/icons/index.ts` barrel.
4. Create `libs/design-system/src/lib/components/Breadcrumb/` directory.
5. Move `Breadcrumb.tsx` and its test to the new location.
6. Create `index.ts` barrel.
7. Add exports to `libs/design-system/src/index.ts`.
8. Update imports in all consuming route pages.
9. Delete old files from `ui/`.

## Acceptance criteria

- [ ] `Breadcrumb` and `ChevronIcon` are imported from `@academic-portfolio/design-system`.
- [ ] Old `ui/Breadcrumb.tsx` and `ui/icons/ChevronIcon.tsx` are deleted.
- [ ] `npx nx run @academic-portfolio/design-system:test` passes (Breadcrumb tests included).
- [ ] `npx nx run-many -t lint test typecheck build` passes.
- [ ] No `@nx/enforce-module-boundaries` violations.
- [ ] Breadcrumb renders correctly with `aria-current="page"` for the last item.

## Tests and validation commands

```bash
npx nx run @academic-portfolio/design-system:test
npx nx run-many -t lint test typecheck build
```

## Documentation updates

- ADR-0008: add Breadcrumb and ChevronIcon to component inventory.
- `docs/design-system/components.md`: add Breadcrumb usage.

## Risks and rollback

- **Risk:** The `ui/icons/` directory may contain other icons in the future. Mitigation: check for other icons before deleting the directory.
- **Risk:** `Breadcrumb` imports from `./icons/ChevronIcon` — update to the design system import path.
- **Rollback:** Move files back, restore exports, revert imports.
