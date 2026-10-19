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

| Criterion                                                                                                   | Status / next action                                                                                      |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Markdown/frontmatter validation has positive and negative tests                                             | Implemented; recheck coverage for malformed nested values and array entries                               |
| Deployment URL substitution works                                                                           | Previously verified; retain regression coverage                                                           |
| Relative links and images support GitHub Pages base paths                                                   | Previously verified; retain regression coverage                                                           |
| Missing images have deliberate fallback behavior                                                            | Implemented; verify fallback is distinguishable from real content                                         |
| Invalid metadata produces actionable messages                                                               | Implemented; strengthen gaps listed in the roadmap                                                        |
| Empty collections and unknown slugs have deliberate behavior                                                | Implemented; retain regression coverage                                                                   |
| Draft content is excluded from published lists, detail routes, sitemap, and generated metadata              | Verify all surfaces; fix any gaps                                                                         |
| Slug generation and lookup use one consistent rule                                                          | Audit finding: verify/fix mismatch between frontmatter slug and directory lookup                          |
| Profile and nested collections reject malformed values instead of silently dropping or rendering empty data | Roadmap item                                                                                              |
| Owner-editable information is documented in one obvious index                                               | Roadmap item                                                                                              |
| Sample content is clearly labelled and safe for a fresh fork                                                | Roadmap item; this replaces any expectation that the template must contain the owner's final real content |
| Content author can add/edit/remove entries without changing app code                                        | Must be demonstrated in clean-fork test                                                                   |
| Images and inline Markdown references are validated with useful errors                                      | Verify current implementation and document its exact guarantees                                           |

## Acceptance Criteria — Engineering

| Criterion                                                                       | Status / next action                                                      |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Internal namespace uses `@katie-portfolio/*`                                    | Previously marked complete; verify current state                          |
| Nx retained with documented justification                                       | ADR-0002                                                                  |
| Vitest is the single unit-test framework                                        | Implemented                                                               |
| Empty test suites do not pass silently                                          | Implemented                                                               |
| Shared lint and formatting configurations work                                  | ADR-0006                                                                  |
| Nx module-boundary rules are effective                                          | Implemented                                                               |
| Lockfile supports reproducible clean install                                    | Previously verified with `npm ci`; repeat during clean-fork test          |
| TypeScript strictness and useful lint rules are not weakened to bypass failures | Previously verified; preserve                                             |
| Generated build/cache artifacts are not tracked                                 | Roadmap item: ignore/remove tracked `*.tsbuildinfo` artifacts             |
| Dependency security status is current and documented                            | Re-run audit; old vulnerability counts are historical, not current status |
| Content paths and workspace execution assumptions are explicit and tested       | Review content path resolution during correctness pass                    |

## Acceptance Criteria — Website quality

| Criterion                                                                                               | Status / next action                                                       |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Homepage, collection lists, and detail pages build                                                      | Previously verified; retain CI                                             |
| Internal links and images resolve                                                                       | Previously verified; expand checks where necessary                         |
| Metadata and canonical URLs work with deployment base paths                                             | Implemented; regression test representative routes                         |
| Responsive behavior and readability                                                                     | Previously checked; include visual smoke test in final verification        |
| Analytics behavior is intentional and documented                                                        | Documented in site configuration; ensure it is optional and safe for forks |
| No temporary deployment URL leaks into production metadata                                              | Previously verified; retain regression coverage                            |
| Light and dark themes have readable surfaces, text, links, and focus states                             | Audit finding: verify/fix detail-page surface and prose contrast           |
| Open Graph image selection uses real covers when available and generated fallback otherwise             | Audit finding: verify/fix fallback precedence                              |
| Sitemap dates reflect defensible content/build dates rather than an arbitrary current date              | Previously reported fixed; retain regression test                          |
| Personal metadata derives from editable profile/site configuration rather than hardcoded names in pages | Roadmap item                                                               |
| Empty states and sample entries look intentional                                                        | Roadmap item                                                               |

## Roadmap

This roadmap is ordered by user impact and correctness, not by adding more features. Keep work incremental and verify each phase before moving on.

### Phase 1 — Fix correctness and content validation

**Priority: P1 — do first**

- Resolve the slug contract: either directory names are authoritative, or custom slugs must be mapped consistently for both list generation and detail-page lookup. Prefer directory-authoritative slugs for simplicity unless a real use case requires overrides.
- Strengthen frontmatter validation for images, links, tags, authors, dates, and other nested arrays/objects. Do not silently filter malformed values if doing so hides an authoring mistake.
- Validate profile data as carefully as collection entries, including research interests, education, skills, social/contact links, and optional fields.
- Verify drafts cannot leak into list pages, static detail routes, sitemap, JSON-LD, or Open Graph metadata.
- Add regression tests for malformed data, duplicate slugs, unknown slugs, missing assets, and base-path URL handling.
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

### Phase 3 — Visual consistency and accessibility

**Priority: P1/P2**

- Resolve the light/dark theme surface and prose contrast mismatch found in the detail-page styling.
- Use semantic tokens consistently for surfaces, text, muted text, borders, links, accent colors, and focus rings where that simplifies maintenance.
- Check homepage, about, project, publication, and blog pages in both themes and at mobile/desktop widths.
- Verify keyboard navigation, visible focus, heading hierarchy, link distinction, image alt text, captions, and reduced-motion behavior.
- Ensure placeholder images and empty states are visibly intentional.
- Keep the UI system compact; do not create a separate design-system package without a concrete need.

**Exit criteria:** No known contrast/layout defects; key routes pass automated accessibility checks and a documented manual keyboard/responsive smoke test.

### Phase 4 — SEO, metadata, and repository hygiene

**Priority: P2**

- Make page titles and descriptions derive from the editable site/profile data, not a specific person's name.
- Fix/test Open Graph selection: use a real content cover when present and generated title-based imagery when absent.
- Verify canonical URLs, sitemap entries, robots rules, and social image paths under both root-domain and GitHub Pages project-site/base-path deployments.
- Ensure draft entries never appear in generated SEO output.
- Ignore and remove generated TypeScript build-info/cache artifacts from version control.
- Refresh dependency/security documentation using a new audit; clearly separate current findings from old audit counts.
- Resolve the repository-code license versus portfolio-content license/template-reuse documentation mismatch. State separately what license applies to code, sample content, and owner-supplied content.
- Remove stale roadmap items that are already implemented, and update status tables when fixes land.

**Exit criteria:** Metadata and generated assets are correct for representative routes and deployment modes; documentation reflects the current code and licensing intent.

### Phase 5 — Documentation and clean-fork acceptance test

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
