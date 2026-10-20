# T-003: Promote `ContentImage` to design system

- **Status:** Done
- **Phase:** 4 — Design-system foundation
- **Priority:** P1
- **Dependencies:** T-001, T-002

## Context

`ContentImage` (`apps/main/src/app/ui/ContentImage.tsx`) is a generic image component that supports WebP fallbacks via `<picture>`, handles `StaticImageData` (webpack imports), and SVG passthrough. It is used by `AboutSection`, `AboutHero`, and `ContentCardSection` — across both content and about features. It is not feature-specific.

## Problem

`ContentImage` lives in the app's `ui/` folder alongside feature-specific components. There is no clear shared-UI boundary.

## Desired outcome

`ContentImage` lives in `libs/design-system/src/lib/components/ContentImage/` with colocated tests. All existing imports are updated to use `@academic-portfolio/design-system`.

## Scope

### In scope

- Move `ContentImage.tsx` → `libs/design-system/src/lib/components/ContentImage/ContentImage.tsx`
- Create `libs/design-system/src/lib/components/ContentImage/index.ts` (barrel)
- Move `ContentImage.test.tsx` → colocated in the same directory
- Add tests for: semantic `<img>`/`<picture>` rendering, `alt` attribute, `priority` → `fetchPriority="high"`, WebP `<source>` generation, SVG passthrough, `StaticImageData` passthrough
- Update all imports:
  - `apps/main/src/app/ui/AboutSection.tsx` → `./ContentDetail` import updated (wait — AboutSection imports `./ContentImage` from same ui dir; will need to import from design-system)
  - `apps/main/src/app/ui/AboutHero.tsx` → same
  - `apps/main/src/app/ui/ContentCardSection.tsx` → same
  - `apps/main/src/app/ui/ContentDetail.tsx` → same
- Export `ContentImage` from `libs/design-system/src/index.ts`

### Out of scope

- Changing `ContentImage`'s behavior or API
- Migrating other components

## Files affected

- `libs/design-system/src/lib/components/ContentImage/ContentImage.tsx` (moved)
- `libs/design-system/src/lib/components/ContentImage/ContentImage.test.tsx` (moved + extended)
- `libs/design-system/src/lib/components/ContentImage/index.ts` (new)
- `libs/design-system/src/index.ts` (add export)
- `apps/main/src/app/ui/AboutSection.tsx` (update import)
- `apps/main/src/app/ui/AboutHero.tsx` (update import)
- `apps/main/src/app/ui/ContentCardSection.tsx` (update import)
- `apps/main/src/app/ui/ContentDetail.tsx` (update import)
- `apps/main/src/app/ui/ContentImage.tsx` (delete — or keep as re-export for backward compat during migration)

## Implementation steps

1. Create `libs/design-system/src/lib/components/ContentImage/` directory.
2. Copy `ContentImage.tsx` to the new location.
3. Move `ContentImage.test.tsx` to the new location.
4. Create `index.ts` barrel file.
5. Add `ContentImage` export to `libs/design-system/src/index.ts`.
6. Update imports in `AboutSection.tsx`, `AboutHero.tsx`, `ContentCardSection.tsx`, `ContentDetail.tsx`.
7. Update the design-system's Vitest config to handle `happy-dom` environment for `StaticImageData` tests.
8. Delete the old `ContentImage.tsx` and `ContentImage.test.tsx` from `apps/main/src/app/ui/`.
9. Add `ContentImage` to the `tw-input.css` `@source` paths (if it uses Tailwind classes — it doesn't, it passes className through; but verify).

## Acceptance criteria

- [ ] `ContentImage` is imported from `@academic-portfolio/design-system` in all consuming components.
- [ ] Old `ui/ContentImage.tsx` is deleted (no duplicate).
- [ ] `npx nx run @academic-portfolio/design-system:test` passes with colocated tests.
- [ ] `npx nx run-many -t lint test typecheck build` passes.
- [ ] ESLint `@nx/enforce-module-boundaries` does not flag the import.
- [ ] Existing `ContentImage` tests still pass (with updated paths).
- [ ] New tests cover: `<picture>` element rendering for WebP, `alt` attribute present, `priority` sets `fetchPriority="high"`.

## Tests and validation commands

```bash
npx nx run @academic-portfolio/design-system:test
npx nx run-many -t lint test typecheck build
```

## Documentation updates

- `docs/architecture/decisions/0008-design-system.md` — add ContentImage to the component inventory.
- `docs/design-system/components.md` — add ContentImage usage docs.

## Risks and rollback

- **Risk:** `StaticImageData` type import from `next/image` may not be available in the library's tsconfig. Mitigation: add `next` to the library's `types` array.
- **Risk:** The test file uses `@vitest-environment happy-dom` — ensure the design-system's vitest config supports per-file environment overrides.
- **Rollback:** Move the file back, remove the export, revert imports.
