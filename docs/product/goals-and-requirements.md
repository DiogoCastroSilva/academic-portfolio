# Product Requirements

## Project Purpose

Katie Portfolio is Kathleen Miller's academic portfolio website. It presents her research projects, publications, biography, and relevant links in a clean, professional format. Content is authored in Markdown so routine updates require no frontend-code changes.

**Primary user:** Kathleen Miller (content maintainer)
**Secondary users:** Hiring managers, academic collaborators, recruiters

## Goal A — Deliver a professional academic portfolio

The website must:

- Present academic projects, publications, biography, and relevant links professionally.
- Render varied academic content consistently and responsively.
- Handle optional fields, long titles, author lists, links, and images gracefully.
- Validate content before invalid information reaches production.
- Provide useful page metadata, search-engine discoverability, and social-sharing previews.
- Remain fast, accessible, and reliable on desktop and mobile.
- Deploy through a documented, reproducible process.
- Require no frontend-code changes for routine content updates.

## Goal B — Demonstrate senior-level engineering judgment

The repository should demonstrate:

- Architecture appropriate to the actual project scope.
- Clear module boundaries and understandable code.
- Sound, evidence-based dependency and framework decisions.
- Meaningful automated tests and reliable CI.
- Safe content processing and robust failure handling.
- Accessibility, SEO, responsive design, and performance awareness.
- Reproducible builds and maintainable deployment automation.
- Useful documentation and honest architecture decision records.
- Pragmatic trade-offs, including deliberate decisions _not_ to introduce unnecessary technology.

**Core principle:** The best result is the simplest well-engineered system that satisfies the real requirements.

## Acceptance Criteria — Content

| Criterion                                                                  | Status                                   |
| -------------------------------------------------------------------------- | ---------------------------------------- |
| Frontmatter validation has positive and negative tests                     | Done (44 tests)                          |
| Deployment URL substitution works                                          | Verified                                 |
| Relative links and images work with GitHub Pages base path                 | Verified                                 |
| Missing images have deliberate fallback behavior                           | Done (placeholder)                       |
| Invalid metadata fails with actionable messages                            | Done                                     |
| Empty collections and unknown slugs have deliberate tested behavior        | Done (NON-EXISTENT-SLUG pattern, tested) |
| Placeholder content (`second-project.md`) is flagged, not silently removed | Flagged for owner review                 |
| Markdown rendering and raw HTML behavior are deliberate and tested         | See ADR-0003, ADR-0004                   |
| Production static build succeeds                                           | Verified                                 |

## Acceptance Criteria — Engineering

| Criterion                                                         | Status                               |
| ----------------------------------------------------------------- | ------------------------------------ |
| Internal namespace rename to `@katie-portfolio/*` complete        | Done                                 |
| Nx retained with documented justification                         | See ADR-0002                         |
| Vitest is the single unit-test framework                          | Done                                 |
| No empty test suite passes silently                               | Done                                 |
| Shared lint and formatting configs work                           | See ADR-0006                         |
| Module-boundary rules effective (`@nx/enforce-module-boundaries`) | Done                                 |
| Lockfile supports reproducible clean install                      | Verified (`npm ci`)                  |
| Security updates addressed or specifically deferred               | Reduced from 99 → 71 vulnerabilities |
| TypeScript strictness and useful lint rules not weakened          | Verified                             |

## Acceptance Criteria — Website Quality

| Criterion                                                     | Status                                                           |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| Homepage, list pages, and detail pages render correctly       | Verified in build output                                         |
| Internal links and images resolve correctly                   | Verified                                                         |
| SEO metadata and canonical URLs correct for deployment        | Done (canonical URLs in layout, page metadata, and detail pages) |
| Responsive behavior and content readability checked           | Done                                                             |
| Analytics behavior is intentional and documented              | See site-config.ts                                               |
| No unintended temporary deployment URL in production metadata | Verified                                                         |

## Future Possibilities (Not Yet Implemented)

- Content image validation (frontmatter + inline Markdown image path checks)
- Per-page sitemap modification dates
- Web App Manifest
