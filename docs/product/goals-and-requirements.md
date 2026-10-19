# Product Requirements and Roadmap

## Project Purpose

This repository is a reusable template for a professional academic portfolio. The primary intended user is a scientist who can use GitHub and edit Markdown files but is not a frontend engineer. The owner should be able to fork the repository, change their information and content, and deploy a personalized site without editing React/Next.js application code.

**Primary user:** A scientist or academic maintaining their own portfolio  
**Secondary users:** Hiring managers, academic collaborators, recruiters  
**Current content strategy:** Markdown/README files and a small, clearly documented site configuration  
**Deployment:** Next.js static export deployed through GitHub Actions to GitHub Pages  
**Future possibility:** An optional CMS such as Decap CMS, deferred until the Markdown-first template is reliable and easy to use.

### Explicit scope clarification

This is a **template**, not a completed personal portfolio. The template does not need Kathleen's final biography, real publications, a finished CV, or a complete set of personal projects before it is considered successful. Example content and placeholders are expected, provided they are clearly identified, safe to publish, easy to replace, and do not accidentally masquerade as the fork owner's real information.

The deliverable is a reliable, understandable template that lets its next owner add their own content without frontend engineering.

## Product Goals

### Goal A — Make the template easy for a non-frontend owner

The owner must be able to:

- Fork the repository and follow one clear setup guide.
- Find every place where their personal information is edited.
- Edit profile, biography, research interests, skills, education, contact/social links, projects, publications, and blog posts through documented Markdown/README files or an explicitly documented configuration file.
- Add, edit, reorder where supported, and remove content without changing application components.
- Add images and understand where files belong and how to reference them.
- Understand which fields are required, optional, and shown publicly.
- Mark unfinished content as a draft and know that drafts do not appear on the published site.
- Run a small set of documented checks, interpret validation errors, and recover from common mistakes.
- Deploy through GitHub Actions/GitHub Pages without introducing a backend, database, paid service, or CMS account.

### Goal B — Deliver a professional, flexible academic portfolio

The site must:

- Present biography, research interests, education, projects, publications, and relevant links professionally.
- Support optional content and common academic content shapes: long titles, multiple authors, DOI/paper links, tags, figures, captions, and images.
- Render content consistently and responsively on desktop and mobile.
- Provide appropriate page metadata, canonical URLs, sitemap, structured data, and social-sharing previews.
- Have accessible navigation, heading structure, focus states, color contrast, image alternatives, and reduced-motion behavior.
- Handle empty sections intentionally, without broken layouts or misleading claims.
- Remain fast and reliable as a static site.

### Goal C — Demonstrate sound engineering judgment

The repository should demonstrate:

- Architecture appropriate to the scope.
- Clear module boundaries and understandable code.
- Evidence-based dependency and framework decisions.
- Meaningful automated tests and reliable CI.
- Safe Markdown/content processing and actionable validation errors.
- Reproducible builds and maintainable deployment automation.
- Current, useful documentation and honest architecture decision records.
- Deliberate decisions not to add unnecessary technology.

**Core principle:** Build the simplest well-engineered template that a scientist can maintain confidently.

## Non-goals

- Completing the owner's real academic content as a prerequisite for template readiness.
- Adding a CMS or authentication service in the current phase.
- Requiring a database, server-rendered runtime, contact-form backend, or paid provider.
- Adding search/filtering before content volume makes it useful.
- Creating a separate design-system package or introducing Storybook without a demonstrated need.
- Migrating away from Next.js static export, GitHub Actions, GitHub Pages, Markdown, or the current Nx workspace without concrete evidence that the current choice blocks the goals.
- Building a plugin system or making every possible academic section mandatory.

## Acceptance Criteria — Content and authoring

| Criterion                                                                                                   | Status / next action                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Markdown/frontmatter validation has positive and negative tests                                             | Implemented; coverage includes content frontmatter and profile nested collections (education, researchInterests, skills); malformed values and array entries throw actionable errors |
| Deployment URL substitution works                                                                           | Previously verified; retain regression coverage                                                                                                                                      |
| Relative links and images support GitHub Pages base paths                                                   | Previously verified; retain regression coverage                                                                                                                                      |
| Missing images have deliberate fallback behavior                                                            | Implemented; verify fallback is distinguishable from real content                                                                                                                    |
| Invalid metadata produces actionable messages                                                               | Implemented; strengthen gaps listed in the roadmap                                                                                                                                   |
| Empty collections and unknown slugs have deliberate behavior                                                | Implemented; retain regression coverage                                                                                                                                              |
| Draft content is excluded from published lists, detail routes, sitemap, and generated metadata              | Implemented; regression tests cover `getAll()`, `getBySlug()`, and `getContentBySlug()` draft filtering; sitemap/JSON-LD draft exclusion verified                                    |
| Slug generation and lookup use one consistent rule                                                          | Done; resolved — directory names are authoritative across `getAll()`, `getBySlug()`, sitemap, and canonical metadata                                                                 |
| Profile and nested collections reject malformed values instead of silently dropping or rendering empty data | Implemented; profile.ts validates education, researchInterests, and skills structure (non-array, non-object entries, non-string fields) and throws actionable errors                 |
| Owner-editable information is documented in one obvious index                                               | Roadmap item                                                                                                                                                                         |
| Sample content is clearly labelled and safe for a fresh fork                                                | Roadmap item; this replaces any expectation that the template must contain the owner's final real content                                                                            |
| Content author can add/edit/remove entries without changing app code                                        | Must be demonstrated in clean-fork test                                                                                                                                              |
| Images and inline Markdown references are validated with useful errors                                      | Verify current implementation and document its exact guarantees                                                                                                                      |

## Acceptance Criteria — Engineering

| Criterion                                                                       | Status / next action                                                                                                                                                              |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Internal namespace uses `@katie-portfolio/*`                                    | Previously marked complete; verify current state                                                                                                                                  |
| Nx retained with documented justification                                       | ADR-0002                                                                                                                                                                          |
| Vitest is the single unit-test framework                                        | Implemented                                                                                                                                                                       |
| Empty test suites do not pass silently                                          | Implemented                                                                                                                                                                       |
| Shared lint and formatting configurations work                                  | ADR-0006                                                                                                                                                                          |
| Nx module-boundary rules are effective                                          | Implemented                                                                                                                                                                       |
| Lockfile supports reproducible clean install                                    | Previously verified with `npm ci`; repeat during clean-fork test                                                                                                                  |
| TypeScript strictness and useful lint rules are not weakened to bypass failures | Previously verified; preserve                                                                                                                                                     |
| Generated build/cache artifacts are not tracked                                 | Verified: `*.tsbuildinfo` already in `.gitignore`; no tracked artifacts found                                                                                                     |
| Dependency security status is current and documented                            | Updated: 36 vulnerabilities (down from 99); 4 critical eliminated; all dev-only. Counts: 0 critical, 16 high, 20 moderate, 0 low. See `docs/operations/dependency-maintenance.md` |
| Content paths and workspace execution assumptions are explicit and tested       | Review content path resolution during correctness pass                                                                                                                            |

## Acceptance Criteria — Website quality

| Criterion                                                                                               | Status / next action                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage, collection lists, and detail pages build                                                      | Previously verified; retain CI                                                                                                                                                                                                                                                                                            |
| Internal links and images resolve                                                                       | Previously verified; expand checks where necessary                                                                                                                                                                                                                                                                        |
| Metadata and canonical URLs work with deployment base paths                                             | Implemented; regression test representative routes                                                                                                                                                                                                                                                                        |
| Responsive behavior and readability                                                                     | Previously checked; include visual smoke test in final verification                                                                                                                                                                                                                                                       |
| Analytics behavior is intentional and documented                                                        | Documented in site configuration; ensure it is optional and safe for forks                                                                                                                                                                                                                                                |
| No temporary deployment URL leaks into production metadata                                              | Previously verified; retain regression coverage                                                                                                                                                                                                                                                                           |
| Light and dark themes have readable surfaces, text, links, and focus states                             | Fixed: removed dark:prose-invert from prose containers on light-blue (bg-sky-50) surfaces so text remains dark; changed dark-mode link color from blue-400 to blue-700 for readable contrast; fixed tag text from gray-400/zinc-400 to gray-600/zinc-600; added theme-contrast regression tests in ContentDetail.test.tsx |
| Open Graph image selection uses real covers when available and generated fallback otherwise             | Fixed: `generateMetadata` now checks `imageType === "cover"` before using the cover image asset URL; placeholder images fall back to the generated OG SVG. Added regression test in `projects/[slug]/page.test.tsx`.                                                                                                      |
| Sitemap dates reflect defensible content/build dates rather than an arbitrary current date              | Previously reported fixed; retain regression test                                                                                                                                                                                                                                                                         |
| Personal metadata derives from editable profile/site configuration rather than hardcoded names in pages | Fixed: removed hardcoded "Kathleen Miller" name from not-found.tsx metadata; now uses `siteConfig.name` (which derives from profile.md via getProfile())                                                                                                                                                                  |
| Empty states and sample entries look intentional                                                        | Fixed: empty state in ContentCardSection now renders a centered SVG icon with the message; added tests                                                                                                                                                                                                                    |
| Navigation marks the active section on collection and nested detail routes                              | Implemented; isPathActive() uses segment-aware prefix matching; NavBar and MobileNavLinks both use it                                                                                                                                                                                                                     |
| Collection pages show every item or provide pagination; never silently truncate content                 | Implemented; collection pages use ContentCardSection with all items; pagination via Pagination component with 10 items per page                                                                                                                                                                                           |
| Pagination appears only when more than one page exists                                                  | Implemented; static pagination via Pagination component (returns null when totalPages u2264 1), generateStaticParams for pages 1..N, 0/1/10/11/20/21 item test coverage                                                                                                                                                   |
| Heading hierarchy and typography are consistent across homepage, lists, details, and Markdown content   | Implemented; collection pages use headingLevel="h1" for page title, ContentCardSection defaults to "h2", markdown headings shifted +1 to start at H2, prose-h1 styling removed from ContentDetail                                                                                                                         |
| Motion is purposeful, restrained, performant, and respects reduced-motion preferences                   | Verified: animations (0.5s fadeInUp, 150ms gallery hover) only under `prefers-reduced-motion: no-preference`; `!important` disables all transitions/animations under `reduce`; 5 reduced-motion tests. No changes needed                                                                                                  |

## Roadmap

This roadmap is ordered by user impact and correctness, not by adding more features. Keep work incremental and verify each phase before moving on.

### Phase 1 — Fix correctness and content validation

**Priority: P1 — do first**

- ~~Resolve the slug contract: either directory names are authoritative, or custom slugs must be mapped consistently for both list generation and detail-page lookup. Prefer directory-authoritative slugs for simplicity unless a real use case requires overrides.~~ ✅ Done — directory names are the authoritative slug; frontmatter `slug` is accepted but ignored.
- Strengthen frontmatter validation for images, links, tags, authors, dates, and other nested arrays/objects. Do not silently filter malformed values if doing so hides an authoring mistake.
- Validate profile data as carefully as collection entries, including research interests, education, skills, social/contact links, and optional fields.
- ~~Verify drafts cannot leak into list pages, static detail routes, sitemap, JSON-LD, or Open Graph metadata.~~ ✅ Done — draft exclusion added to `getBySlug()` and `getContentBySlug()` in addition to `getAll()`.
- Ensure collection ordering is deterministic: sort newest-first by publication date with a slug-based tie-breaker for identical dates, so filesystem readdir order does not affect output.
- ~~Add regression tests for malformed data, duplicate slugs, unknown slugs, missing assets, and base-path URL handling.~~ ✅ Done — validation tests added for `image: []`, array element types, empty `title`; duplicate slug tests updated for directory-authoritative behavior; draft exclusion tests added for `getBySlug()` and `getContentBySlug()`.
- Ensure validation errors identify the file, field, expected format, and a useful correction.

**Exit criteria:** Valid content builds reliably; invalid content fails with actionable errors; public routes and generated metadata agree on slugs and draft status.

### Phase 2 — Make every owner-controlled detail easy to edit

**Priority: P1 — core template requirement**

- Inventory every user-facing personal detail and identify its single source of truth.
- Move hardcoded personal names and page descriptions into profile/site configuration or editable content where appropriate.
- Make the editing guide the single entry point for personal changes, with a table mapping each task to the exact file/directory and required fields.
- Document how to edit the profile, education, research interests, skills, social/contact links, projects, publications, blog, images, site title/description, deployment URL/base path, and optional analytics.
- Prefer README/Markdown files for content collections; keep technical deployment settings separate and explain any settings that still require editing a configuration file.
- Supply clearly labelled, realistic-but-generic sample entries and copyable templates. Mark unfinished examples as drafts where appropriate; do not publish invented credentials, publications, or personal claims as if they were real.
- Explain how to add, edit, reorder (where supported), and remove entries and assets.
- Make empty states useful and intentional when the owner deletes all examples.
- Keep Decap CMS documented as a future option only; no CMS or login implementation in this phase.

**Exit criteria:** A non-frontend owner can find every editable detail from the main README and make routine content changes without touching React/Next.js components.

### Phase 3 — Visual consistency, navigation, and accessibility

**Priority: P1 — core quality requirement**

- Resolve the light/dark theme surface and prose contrast mismatch found in the detail-page styling, including dates, tags, card surfaces, links, and body prose.
- Use semantic tokens consistently for surfaces, text, muted text, borders, links, accent colors, and focus rings where that simplifies maintenance.
- Check homepage, about, project, publication, and blog pages in both themes and at mobile/desktop widths.
- Fix active navigation matching: a detail route such as `/projects/example-project/` must mark Projects as the current section. Use segment-aware path matching (not a naive prefix that could match unrelated paths) and consistent behavior in desktop and mobile navigation.
- Show the active state with a clear visual indicator and `aria-current="page"` where appropriate; do not communicate state by color alone.
- Establish a compact typography system for body text, page titles, section headings, card titles, metadata, and long-form Markdown. Check readable line length, line-height, spacing, and responsive sizes.
- Audit heading hierarchy: one clear page-level H1, section headings in order, no levels skipped for styling, and a deliberate rule for headings authored inside Markdown detail content.
- Review repeated components for consistent card image ratios, padding, borders, radii, text lengths, link treatment, empty states, and responsive breakpoints.
- Keep animations purposeful and subtle. Audit the existing staggered card entrance, image zoom, and title movement for excessive motion, visual noise, and performance impact; avoid animating every item on long pages. Respect `prefers-reduced-motion` for all motion.
- Verify keyboard navigation, visible and unobscured focus, link distinction, image alt text, captions, semantic landmarks, touch target sizes, and reduced-motion behavior.
- Use WCAG 2.2 AA as the practical target, supported by automated checks and manual keyboard/zoom/reflow testing; automated scans alone are not sufficient.
- Ensure placeholder images and empty states are visibly intentional.
- Keep the UI system compact; do not create a separate design-system package without a concrete need.

**Exit criteria:** No known contrast/layout defects; active navigation works for all parent/detail routes; typography and heading structure are consistent; key routes pass automated accessibility checks and a documented manual keyboard/responsive smoke test.

### Phase 4 — Collection pagination and long-list behavior

**Status: Complete — implemented path-based static pagination for blog, projects, and publications**

**Priority: P1/P2 — content must never disappear silently**

The shared `ContentCardSection` defaults to showing six items on the homepage via `items.slice(0, limit)`, but collection pages now provide full pagination. This is resolved — see below.

- Add a reusable, static-export-compatible pagination pattern for blog posts, projects, and publications.
- Start with **10 items per page** as a reasonable content/scanability default. Keep the page size in one shared configuration; change it only if visual and performance testing provides evidence for a better value.
- Render pagination controls **only when total items exceed the page size**. For zero items, show the empty state; for one through ten items, show the full list and no pagination controls.
- Generate all listing pages at build time for Next.js static export/GitHub Pages. Do not depend on client-only filtering, server runtime, or query-string behavior that fails on static hosting.
- Preserve deterministic ordering (date descending for dated content unless a documented section-specific order applies) so items do not move unpredictably between pages.
- Provide accessible Previous/Next links, numbered pages where useful, a visible current-page state, descriptive labels, keyboard focus, and sensible first/last-page behavior. Do not render disabled links that navigate nowhere.
- Ensure each page has appropriate title/description/canonical behavior and that sitemap/SEO output does not expose drafts or invalid page routes.
- Avoid rendering the same full collection on every page when a simple shared pagination helper can slice it at build time. Since this is a static site, the page size is a usability and page-weight choice, not a substitute for image optimization.
- Add tests for 0, 1, exactly 10, 11, 20, and 21 items; verify every published item appears exactly once across pages, no item is silently lost, and no pagination controls appear when there is only one page.
- **Homepage preview limit is now explicit** (6 items, passed as `limit={6}` at the call site) with a "View all" link to `/blog`, `/projects`, and `/publications`. The content library's `getAll()` sort now includes a slug-based tie-breaker for deterministic ordering when dates are identical. Full collection-page pagination is implemented and tested (see below).

**Exit criteria:** Every published item is reachable; listing pages generate deterministically for static export; pagination is absent when there is only one page; the clean-fork test verifies the behavior.

**Implementation details:**

- `Pagination` component updated for path-based URLs (`/blog/`, `/blog/page/2/`)
- `ContentCardSection` `limit` prop made optional — when omitted, all items are shown
- `blog/page.tsx`, `projects/page.tsx`, `publications/page.tsx` render page 1 server-side with `ContentCardSection` + `Pagination`
- `blog/page/[page]/page.tsx`, `projects/page/[page]/page.tsx`, `publications/page/[page]/page.tsx` handle pages 1..N via `generateStaticParams`
- All pagination routes use `dynamicParams = false` so only build-time-generated params are reachable
- Page 1 served directly by `page.tsx` (avoids ambiguity with `[slug]` dynamic routes)
- Pages 1..N generated at build time using dynamic segment `[page]` with `dynamicParams = false`; page 1 redirects to the collection root via `withPublicBasePath()`
- `generateStaticParams` returns at least `[{ page: "1" }]` — Next.js `output: export` requires ≥1 static param per dynamic route. When the collection fits on one page, page 1 is generated as a redirect to the collection root.

### Phase 5 — SEO, metadata, and repository hygiene

**Priority: P2**

- Make page titles and descriptions derive from the editable site/profile data, not a specific person's name.
- Fix/test Open Graph selection: use a real content cover when present and generated title-based imagery when absent.
- Verify canonical URLs, sitemap entries, robots rules, and social image paths under both root-domain and GitHub Pages project-site/base-path deployments.
- Ensure draft entries never appear in generated SEO output.
- Ignore and remove generated TypeScript build-info/cache artifacts from version control.
- Refresh dependency/security documentation using a new audit; clearly separate current findings from old audit counts.
- ~~Resolve the repository-code license versus portfolio-content license/template-reuse documentation mismatch. State separately what license applies to code, sample content, and owner-supplied content.~~ ✅ ADR-0007 created — MIT for code, CC BY-NC-ND 4.0 for sample content, no license imposed on owner-supplied content
- Remove stale roadmap items that are already implemented, and update status tables when fixes land.

**Exit criteria:** Metadata and generated assets are correct for representative routes and deployment modes; documentation reflects the current code and licensing intent.

### Phase 6 — Documentation and clean-fork acceptance test

**Priority: P1 — release gate**

- Align the root README, `TEMPLATE_USAGE.md`, content-authoring guide, deployment guide, and product requirements around the actual intended workflow: fork this repository and personalize it.
- Document prerequisites, fork/setup steps, repository variables/settings, GitHub Pages setup, first edit, local validation, deployment verification, and troubleshooting.
- Keep the quick-start concise; put architecture rationale in separate docs/ADRs.
- Run the guide from a clean clone or test fork, not only from the existing developer workspace.
- Use a checklist to test changing profile data, adding a published project, adding a draft, adding/removing an image, adding a publication, deleting all sample entries from a collection, and verifying the deployed output.
- Confirm the fork never needs to edit application components for normal personalization.
- Confirm GitHub Actions builds and deploys with the documented steps and no paid services.

**Exit criteria:** A scientist comfortable with GitHub and Markdown, but not frontend engineering, can follow the guide without guessing, editing application code, or requiring help for routine content changes.

### Deferred — only when there is a demonstrated need

- Decap CMS with GitHub authentication: investigate later, after Markdown authoring is reliable; preserve static export and GitHub Pages.
- Search/filtering, teaching/talks/awards/datasets sections, and other academic content types: add only when the intended owner has content that benefits from them.
- Contact form or backend: not needed for a static template; use contact links.
- Framework/workspace migration: only if evidence shows current tooling creates more maintenance than value.
- Web App Manifest: not needed for a static portfolio site; installability is not a requirement for this template.

## Definition of done

The template is ready when:

1. A clean fork can be personalized using documented Markdown/README files and a small set of clearly explained settings.
2. No normal content change requires editing React/Next.js application code.
3. Invalid content and asset references fail with clear, actionable errors.
4. Drafts stay out of published routes and SEO output.
5. The main routes are responsive, accessible, and visually consistent in light/dark modes.
6. SEO metadata and static assets work with the documented GitHub Pages deployment configuration.
7. CI and a clean-fork deployment test pass.
8. Documentation, ADRs, dependency notes, and license statements reflect the actual implementation.
9. The template's sample content is clearly labelled and removable; real personal content is not a release prerequisite.

## Architecture decisions to preserve

- Keep Next.js App Router with static export and GitHub Pages unless a concrete blocker is demonstrated.
- Keep Markdown + frontmatter; do not migrate to MDX without a demonstrated need.
- Keep the existing Nx workspace while its documented boundaries and CI value justify the overhead.
- Keep Vitest as the single test framework.
- Keep content parsing/validation shared and collection wrappers thin.
- Keep analytics optional and deployment configuration explicit.
- Prefer accessible semantic tokens and reusable page patterns over a large design-system abstraction.
- Defer CMS, database, and authentication infrastructure.
- Omit `<lastmod>` from sitemap.xml; build timestamps are not meaningful content-change dates. The decision is tested in `sitemap.test.ts`.

## Reference material for UX and implementation

Use these as references, not as designs to copy wholesale. Preserve the template's focus on clarity, maintainability, and a scientist's Markdown-first workflow.

- [W3C Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) — target for contrast, headings/labels, keyboard focus, navigation, reflow, and motion.
- [Next.js static export guide](https://nextjs.org/docs/app/guides/static-exports) and [`generateStaticParams` reference](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) — ensure collection pagination routes are generated at build time and work on GitHub Pages without a server.
- [PhD student website examples, annotated](https://www.scilio.app/examples/phd-student-websites) — inspiration for clear research-area summaries, dated updates, and publications presented as useful artifacts rather than citation-only lists.
- [Mayank Mittal's academic site](https://mayankm96.github.io/) — example of publication entries with visuals and direct links to abstracts, code, and project artifacts.
- [Cecilia Baldoni's academic/science communication site](https://cecibaldoni.github.io/) — example of a portfolio that spans projects, publications, talks, workshops, and communication work over time.

The useful pattern from these examples is not extra animation or decoration: make the research and outputs easy to understand, provide direct evidence/links, keep dates and context visible, and make the site easy to maintain over multiple career stages.
