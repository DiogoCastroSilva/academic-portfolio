# T-011: CV Link / PDF Support

- **Status:** Done
- **Phase:** Content authoring / Feature
- **Priority:** P1
- **Dependencies:** None

## Context

The About page (`/about`) had no CV link. The profile template contained a
generic `[Curriculum Vitae](DEPLOYMENT_URL)` placeholder link that resolved to
the site homepage — not a PDF. There was no `cvUrl` field in the profile
frontmatter, type system, or validation.

## Problem

Content authors (non-engineers) need a simple, Markdown-only way to add a CV
link that works for both repository-hosted PDFs and externally hosted PDFs.

## Desired outcome

- A single `cvUrl` field in `README.md` frontmatter supports both hosting modes.
- A "View CV (PDF)" link appears on the About page near the contact information.
- No CV link is rendered when `cvUrl` is omitted or empty.
- Local paths resolve correctly under the GitHub Pages base path (`/academic-portfolio`).
- External HTTPS URLs are used as-is with no provider-specific rewriting.
- Invalid URLs cause the build to fail with actionable error messages.

## Scope

### In scope

- Add `cvUrl` field to `ProfileMeta` interface
- Add `validateCvUrl` validation (reject non-HTTPS schemes, protocol-relative
  URLs, absolute local paths, path traversal via `..`)
- Add `parseCvUrl` parsing (local → `withPublicBasePath('/cv.pdf')`, external HTTPS → as-is)
- Add "View CV (PDF)" button to `AboutHero` component
- Create placeholder PDF at `apps/main/public/cv.pdf`
- Update `_profile-template.md` with documented `cvUrl` examples
- Update `docs/product/content-authoring.md` with CV authoring guide
- Add tests for parsing, validation, and rendering

### Out of scope

- No CMS integration
- No URL rewriting for Google Drive sharing links
- No forced download attribute (`download`)
- No changes to the content sync tool (PDFs are placed directly in `public/`)
- No new dependencies

## Files affected

| File                                                        | Change                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `libs/content/src/lib/profile.ts`                           | Add `cvUrl` to `ProfileMeta`, `validateCvUrl`, `parseCvUrl`                         |
| `libs/content/src/lib/profile.test.ts`                      | Add 12 tests for cvUrl parsing and validation                                       |
| `libs/content/src/md/_profile-template.md`                  | Document `cvUrl` with Mode A/B examples; remove misleading `DEPLOYMENT_URL` CV link |
| `libs/content/src/md/README.md`                             | Add `cvUrl: "cv.pdf"` example                                                       |
| `apps/main/public/cv.pdf`                                   | New placeholder PDF                                                                 |
| `apps/main/src/features/about/AboutHero/AboutHero.tsx`      | Add conditional CV link button                                                      |
| `apps/main/src/features/about/AboutHero/AboutHero.test.tsx` | Add CV link rendering tests                                                         |
| `apps/main/src/app/about/page.test.tsx`                     | Add `cvUrl` to mock profile                                                         |
| `apps/main/src/features/about/reduced-motion.test.tsx`      | Add `cvUrl` to mock profile                                                         |
| `docs/product/content-authoring.md`                         | Add CV Link section + quick-reference row                                           |
| `docs/features/cv-link.md`                                  | New feature deep-dive doc                                                           |
| `docs/architecture/overview.md`                             | Update `/about/` route notes                                                        |

## Implementation steps

1. Extend `ProfileMeta` with `cvUrl?: string`
2. Implement `validateCvUrl` and `parseCvUrl` in `profile.ts`
3. Add validation call in `validateProfileFrontmatter`
4. Add parsing in `parseProfile` return object
5. Add "View CV (PDF)" button to `AboutHero` with safe new-tab attributes
6. Create placeholder PDF at `apps/main/public/cv.pdf`
7. Update profile template and sample profile
8. Add tests for all scenarios
9. Update documentation
10. Run full check suite

## Acceptance criteria

- [x] Both hosting modes work through one `cvUrl` field and one UI location
- [x] No CV link shown when `cvUrl` is unconfigured
- [x] Local PDF links work under `/academic-portfolio/cv.pdf` (GitHub Pages base path)
- [x] External HTTPS URLs work without provider-specific rewriting
- [x] PDF opens in new tab; visitor can download from PDF viewer
- [x] Documentation provides Markdown-only workflow for both modes
- [x] Invalid URLs cause build failure with actionable error
- [x] `npx nx run-many -t lint test typecheck build` passes
- [x] Static export output contains `cv.pdf`

## Tests and validation commands

```bash
# Content library tests
npx nx run content:test

# About page + AboutHero tests
npx nx run main:test

# Full suite
npx nx run-many -t lint test typecheck build
```

## Documentation updates

- `docs/product/content-authoring.md` — CV Link section with Mode A/B instructions
- `docs/features/cv-link.md` — feature deep-dive
- `libs/content/src/md/_profile-template.md` — inline `cvUrl` documentation

## Risks and rollback

- **Risk:** The `cvUrl` field might conflict with existing profile parsing.
  Mitigated by following existing optional field parsing patterns.
- **Risk:** Local PDF path resolution might not work with the base path.
  Mitigated by using the existing `withPublicBasePath` utility and verifying
  in the build output.
- **Rollback:** Remove `cvUrl` field from profile, remove `AboutHero` change,
  delete placeholder PDF, revert test additions.
