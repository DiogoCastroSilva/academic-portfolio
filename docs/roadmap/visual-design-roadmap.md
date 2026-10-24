# Visual Design and Experience Roadmap

> **Status:** Active
> **Purpose:** Guide visual and interaction refinement without conflating it with the separate frontend-modernization roadmap.
> **Design direction:** River Atlas Editorial — calm, contemporary, research-focused, typographic, and content-led.

## Product goals this roadmap serves

The portfolio is a reusable template for a scientist or academic who should be able to personalize it through Markdown/README content and a small documented site configuration, without editing application components for routine content changes.

Design work must support these goals:

- Make research, projects, publications, and biography easy to scan and understand.
- Feel polished and distinctive without looking like a generic portfolio template or an overdesigned marketing site.
- Keep typography, spacing, imagery, navigation, cards, and metadata coherent across routes.
- Work responsively and accessibly in light and dark themes.
- Preserve clear empty states, safe generic sample content, and the Markdown-first workflow.
- Prefer the simplest solution that meets the need. Reuse existing components and semantic tokens; do not add dependencies or abstractions without evidence.
- Preserve static export, GitHub Pages compatibility, performance, SEO, and existing content behavior.

This roadmap is about the **visual and user experience** of the site. The broader product and engineering acceptance plan remains in docs/product/goals-and-requirements.md. The separate architecture/workspace roadmap remains in docs/roadmap/frontend-modernization.md. Their phase numbers are independent.

## Phase 1 — Foundations: typography, fonts, and themes

**Status: Implemented; final cross-site verification is part of Phase 4.**

- Establish the editorial typography direction and local font assets.
- Establish the River Atlas Editorial palette and semantic light/dark theme tokens.
- Keep theme switching, persistence, and prevention of incorrect-theme flashes working.
- Make typography, color, and prose styles consistent without replacing Tailwind's existing spacing/type scales or creating unnecessary abstraction.

**Exit criteria:** Fonts load correctly; both themes are readable; theme switching is reliable; semantic styles are used consistently; no regressions to static export.

## Phase 2 — Homepage: introduction and Selected Projects

**Status: Implementation and focused refinements committed; browser-level acceptance still needs to be confirmed.**

- Refine the introduction's hierarchy: name as the page's primary heading, role as secondary information, biography, and existing portrait.
- Keep a natural mobile reading order and a balanced desktop composition; do not force a full-viewport hero or add a large landscape hero image.
- Use middle-dot role separators where appropriate.
- Refine Selected Projects imagery, card hierarchy, spacing, grid, and transitions from the introduction.
- Preserve intentional behavior: explicitly selected projects take precedence, even if fewer than three; when none are selected, show up to the three most recent; show all when fewer than three exist.
- Confirm ordering is deterministic, including equal, missing, or invalid dates, and reuse the existing content loader/schema rather than duplicating sorting logic.
- Keep the full Projects page independent of the homepage selection.

**Exit criteria:** Introduction and project grid feel cohesive; selection rules and full Projects listing are correct; both themes and narrow/large viewports have been inspected; no unresolved critical overflow, keyboard, or contrast issues remain.

## Phase 3 — Homepage: Selected Publications

**Status: Next.**

Refine the publications preview to present research outputs clearly and elegantly, using the data and links already supported by the content model.

- Review the current publication card/section and its relationship to the homepage introduction and projects.
- Establish clear hierarchy for publication title, authors, venue, date, tags, and DOI/paper links where available.
- Keep metadata subordinate to the title while making important research context and direct evidence links easy to find.
- Choose a list or card treatment based on the content and existing visual language; favor an editorial, readable presentation over forcing publications into project-style cards when that harms scanning.
- Handle long titles, multiple authors, missing optional fields, and zero/one/many publications gracefully.
- Preserve draft exclusion, existing content authoring, detail routes, pagination, and the View all link behavior.
- Reuse existing components and semantic tokens when appropriate; do not add fields or dependencies solely for visual polish.

**Exit criteria:** Publications are easy to scan on mobile and desktop, metadata remains readable in both themes, optional fields and long content do not break the layout, and all existing publication routes/content behavior remain intact.

## Phase 4 — Whole-site consistency, accessibility, and release verification

**Status: Planned after Phase 3.**

Review the complete experience, not just the homepage:

- Homepage, About, Projects, Publications, Blog, collection lists, detail pages, pagination, breadcrumbs, navigation, empty states, and footer.
- Light and dark themes, semantic color contrast, typography, spacing, image crops, card treatments, metadata, link affordances, and active navigation states.
- Responsive layouts at 320px, 375–390px, 640px, 768px, 1024px, and 1280px+; include long names/titles/URLs/tags, 200% zoom, and reflow.
- Keyboard-only navigation, visible/unobscured focus, skip link, semantic heading order, landmarks, image alternatives, touch targets, and reduced-motion behavior.
- Check that animations remain restrained and never delay access to content or convey meaning by themselves.
- Verify content and image paths, base-path handling, metadata/canonical URLs, sitemap/structured data, Open Graph assets, and static export.
- Run tests, lint, type checking, formatting checks where configured, production build, and the actual CI/deployment workflows. Record what was genuinely checked; a passing unit test is not a substitute for browser inspection.
- Review documentation for contradictions only where the implementation or decisions changed. Do not create new docs or abstractions just to record routine styling changes.
- Perform a clean-fork/owner-workflow check as part of overall template release readiness, using the broader acceptance criteria in docs/product/goals-and-requirements.md.

**Exit criteria:** No known critical visual, responsive, accessibility, content, SEO, or deployment defects remain; relevant automated checks pass; manual checks and their limits are recorded; a clean fork can be personalized through documented owner-facing controls without application-code edits.

## Working rules

1. Inspect the current branch, commits, existing documentation, and rendered site before changing anything.
2. Work incrementally within the active phase; do not redo accepted foundations without evidence of a defect.
3. Treat River Atlas Editorial as the design contract, not a mandate to make every section identical. Publications may use a more editorial list pattern than projects.
4. Preserve the template's owner workflow and existing behavior; design polish must not introduce fake academic claims, required personal content, a backend, or a CMS.
5. Validate the rendered result in a real browser when possible. Clearly distinguish automated checks, source review, and manual visual verification.
6. Do not commit or push unless the owner explicitly authorizes it.

## Current next action

Start Phase 3 — Selected Publications. First inspect the current homepage, publication content schema/templates, publication cards and detail pages, existing design principles, and available publication metadata. Report what already works and the specific gaps before implementation. Do not redesign the whole site or revisit Phase 1/2 unless a concrete issue is found.
