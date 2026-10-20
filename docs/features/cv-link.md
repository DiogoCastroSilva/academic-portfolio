# CV Link Support

## Overview

The CV link feature provides a single `cvUrl` setting in `profile.md` frontmatter that renders a "View CV (PDF)" link on the About page. It supports both repository-hosted and externally hosted PDFs through one configuration field and one UI element.

## Supported Modes

| Mode                  | `cvUrl` value                | Resolved URL                         |
| --------------------- | ---------------------------- | ------------------------------------ |
| **Local (Mode A)**    | `cv.pdf`                     | `/{base_path}/cv.pdf`                |
| **External (Mode B)** | `https://example.com/cv.pdf` | `https://example.com/cv.pdf` (as-is) |

When `cvUrl` is omitted or empty, no CV link is rendered.

## Architecture

### Data Flow

```
libs/content/src/md/profile.md
  → parseProfile (profile.ts)
  → parseCvUrl (profile.ts)
    → if https:// URL → returned as-is
    → if relative path → withPublicBasePath('/' + path) adds GitHub Pages base path
  → ProfileData.cvUrl
  → AboutHero component renders <a> tag with target="_blank" rel="noopener noreferrer"
```

### Files

| File                                                   | Responsibility                                                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `libs/content/src/lib/profile.ts`                      | `parseCvUrl()` — resolves local paths with base path; `validateCvUrl()` — rejects invalid URLs |
| `libs/content/src/md/profile.md`                       | Set `cvUrl: "cv.pdf"` or `cvUrl: "https://..."`                                                |
| `libs/content/src/md/_profile-template.md`             | Template with documented `cvUrl` examples                                                      |
| `apps/main/public/cv.pdf`                              | Placeholder PDF (replace with real CV)                                                         |
| `apps/main/src/features/about/AboutHero/AboutHero.tsx` | Renders CV link next to contact info                                                           |
| `apps/main/src/app/about/page.tsx`                     | Passes `profile.cvUrl` through to AboutHero                                                    |

### URL Resolution

- **Local paths** (e.g. `cv.pdf`) are converted to absolute paths (`/cv.pdf`) and then `withPublicBasePath()` prepends the configured `NEXT_PUBLIC_BASE_PATH` (e.g. `/academic-portfolio`). Result: `/academic-portfolio/cv.pdf`.
- **External HTTPS URLs** (e.g. `https://example.com/cv.pdf`) are used exactly as configured, with no transformations.

### Validation Rules

`validateCvUrl()` enforces:

1. Must be a string or undefined
2. External URLs must use `https://` scheme (rejects `http://`, `ftp://`, `file://`, etc.)
3. Protocol-relative URLs (`//example.com/...`) are rejected
4. Local paths must be relative (no leading `/`)
5. Local paths must not contain `..` (path traversal protection)
6. Empty strings are treated as "not configured"

Invalid values cause the build to fail with an actionable error message.

### Security

- No `download` attribute on the link (allows PDF viewers to handle it natively)
- `rel="noopener noreferrer"` on external links (prevents tab-nabbing)
- `target="_blank"` opens in a new tab
- `aria-label="View CV (PDF)"` for accessibility
- Same styling as the existing "Get in Touch" contact button

## Testing

- `libs/content/src/lib/profile.test.ts` — parsing and validation tests for `cvUrl`
- `apps/main/src/features/about/AboutHero/AboutHero.test.tsx` — rendering, accessible name, and conditional display
- `apps/main/src/app/about/page.test.tsx` — About page integration with mocked cvUrl

## Documentation for Content Authors

See `docs/product/content-authoring.md#cv-link` for step-by-step instructions.
