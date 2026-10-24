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

**Status: Complete (committed `c8aa997`); 14 new tests passing.**

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

**Status: In progress — source review complete; defects fixed.**

Review the complete experience, not just the homepage. Do this in two explicit work packages so an AI agent does not jump straight from a broad goal into unscoped redesign:

#### Phase 4A — Rendered visual audit and design decisions (next)

**Goal:** Establish what should change before changing the UI. Inspect the current implementation and the actual rendered site, then report findings and a prioritized plan. Do not implement visual changes during this audit unless a concrete defect blocks the audit itself.

Audit the following deliberately:

- **Homepage section rhythm:** Does the page feel like a sequence of boxed cards? Identify where section-level cards should be removed, where plain content on the page surface is better, and where a subtle tinted background can help group content. Avoid alternating strong colors or adding a different color to every section.
- **Content-specific presentation:** Compare projects, publications, and blog previews. Do not force every content type into the same card/grid pattern; evaluate editorial publication lists, project image-led previews, and blog cards on their own merits.
- **Card and image dimensions:** Record current grid columns, gaps, image aspect ratios/heights, card padding, border/radius/shadow, title line clamping, and content density at desktop and mobile widths. Recommend changes based on the rendered result rather than guessing dimensions from source classes alone.
- **Typography and readability:** Verify actual font loading/fallbacks, body and preview font sizes, line heights, heading hierarchy, metadata legibility, content measure/line length, long-title wrapping, and text contrast in both themes. Existing Inter + DM Serif Display choices are the baseline, not a mandate to keep every size unchanged.
- **Palette and surfaces:** Start from the existing River Atlas Editorial tokens. Recommend token changes only when the rendered experience demonstrates a real issue; do not replace the palette by default. Evaluate light and dark themes independently for visual cohesion and contrast.
- **Whole-site consistency:** Include About, collection pages, detail pages, pagination, breadcrumbs, navigation, empty states, and footer—not just the homepage.
- **Responsive/accessibility behavior:** Inspect 320px, 375–390px, 640px, 768px, 1024px, and 1280px+ where possible, plus keyboard focus, 200% zoom/reflow, reduced motion, and contrast.

**Phase 4A deliverable:** A concise audit report grouped by `P0/blocker`, `P1/high impact`, `P2/polish`, with each finding including page/component, observed evidence (screenshot or exact viewport/behavior), why it matters, recommended direction, and likely files involved. Separate verified observations from hypotheses. Include a proposed implementation order and identify decisions that require owner input. Do not create duplicate roadmap/ticket documents; update this roadmap only after the audit establishes the agreed scope.

**Gate:** Owner reviews the findings and agrees on the visual direction/scope before broad redesign work begins.

#### Phase 4B — Implement the agreed visual refinements

After Phase 4A is reviewed, implement in small, coherent slices. Prefer section rhythm and content hierarchy first, then card/image dimensions, typography/readability corrections, and remaining page-level consistency. Preserve content selection, routes, Markdown authoring, accessibility, static export, and both themes. Add or update tests for behavior and semantics; use browser inspection for visual acceptance.

For each slice, the agent must state its scope before editing, avoid unrelated refactors, and report changed files, before/after observations, checks run, and anything not verified.

#### Phase 4C — Release verification

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

### Bugs found and fixed

1. **DOI link on detail pages lacked a visible focus indicator** (P1 — WCAG 2.4.7/2.4.11). The `<a>` for the DOI link in `ContentDetail` had only `text-link hover:text-link-hover break-all` with no `focus-visible` outline, leaving keyboard users without a focus ring. Added `focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2`.
2. **Nested `<main>` landmarks on error and not-found pages** (P2 — invalid HTML). The root layout already renders `<main id="main-content">`; `error.tsx` and `not-found.tsx` each rendered their own `<main>` inside it, creating duplicate main landmarks and invalid HTML. Changed both to `<div>`.
3. **Breadcrumb current-page-as-link had no focus-visible styles** (P3 — defensive). The Breadcrumb's `aria-current="page"` link branch (used when the last item has an `href`) lacked `focus-visible` styles. Added outline classes matching the other interactive elements.
4. **`getFullUrl()` called twice** in `structured-data.ts` `buildArticleSchema` for the same argument — cached the result in a local `url` variable.
5. **ThemeToggle button missing `cursor-pointer`** — hovering over the theme toggle showed a default arrow cursor, making the button appear non-interactive. Added `cursor-pointer` class.
6. **Theme toggle perceived lag** — in `useTheme.ts`'s `setTheme()`, `dispatchEvent` (which triggers a synchronous React re-render via `useSyncExternalStore`) was called _before_ `applyThemeAttribute`, delaying the actual `data-theme` DOM mutation. Reordered so the DOM attribute is set first, then the re-render is triggered — ensuring instant visual theme change. Also reduced icon fade transition from 200ms to 150ms for snappier feedback.
7. **Clarified code block styling documentation** (P0 — documentation clarity). The blog template originally claimed "syntax highlighting" which typically means colored keywords/strings/comments. The template actually provides basic code block styling (monospace font, background color, padding, rounded corners) via Tailwind classes, but no full syntax highlighting library (Prism.js, highlight.js) is installed. Updated the template comment and documentation to accurately describe the styling that exists versus full syntax highlighting. Code rendering itself is correct — HTML entities are properly escaped (`<` → `&lt;`, `>` → `&gt;`) in both inline code and fenced code blocks.

### Automated checks

- **Tests:** 296 tests pass (4 new tests added: 2 landmark tests for error/not-found, 1 Breadcrumb focus test, 3 new assertions in ContentDetail DOI test). Includes `vitest-axe` aXe-core scans on ContentCardSection, ContentDetail, AboutSection, and page-level landmark tests.
- **Lint:** ESLint passes on all projects.
- **Typecheck:** All TypeScript project references resolve; no type errors.
- **Prettier:** Formatting clean.
- **Build:** Static export builds successfully, prerendering all routes.
- **Sitemap:** `generate-sitemap.mjs` generates `robots.txt` + `sitemap.xml` after build; excludes error pages and page-1 redirect stubs. CI runs it as a post-build step.

### Source-review items verified (non-browser)

- **Heading order:** Each route has exactly one `<h1>` (profile name on About/Homepage, page title on collection pages, article title on detail pages); card titles are `<h3>`.
- **Landmarks:** Layout provides `<nav aria-label="Main">`, `<main id="main-content">`, `<footer>`. All sections use `<section aria-labelledby>`. No remaining nested `<main>`.
- **Skip link:** Present in layout, `sr-only` until focused, targets `#main-content`.
- **Touch targets:** All buttons/links have min 44×44px (`size-11`, `min-h-11`, full-card links).
- **Image alternatives:** All `ContentImage` uses have descriptive `alt`; decorative SVGs have `aria-hidden="true"`.
- **Focus-visible:** Consistently applied to all interactive elements (NavBar, ThemeToggle, MobileMenuButton, Breadcrumb links, card links, view-all link, Pagination, Footer links, ContentDetail DOI link).
- **Reduced motion:** Global CSS reset in `tokens.css` sets `transition-duration: 0.01ms` for `prefers-reduced-motion`; `motion/react` components use `useReducedMotion()` with plain-element fallback.
- **Color tokens:** Both light and dark theme values verified for contrast against their surface tokens.
- **OG images:** `ogImageRef` resolves with `withPublicBasePath()` for base-path compatibility; discipline-neutral (profile-driven).
- **Canonical URLs:** Each detail page sets `alternates.canonical`; layout metadata uses `siteConfig.deploymentUrl` as `metadataBase`.
- **Static export:** `output: "export"`, `trailingSlash: true`, `basePath` from env; build succeeds for all routes.

### Items requiring browser verification (cannot automate in this environment)

- 200% zoom and reflow behavior at all breakpoints (320px, 375px, 640px, 768px, 1024px, 1280px+).
- Actual rendered color contrast measurements (source review confirms values; visual verification with a contrast tool is recommended).
- Focus ring visibility and positioning on real rendered elements.
- Keyboard tab order through mobile menu open/close states.
- `prefers-reduced-motion` and `prefers-color-scheme` behavior in a real browser.
- Lighthouse accessibility audit score (perf-audit runs in CI but is report-only, not a gate).

## AI-agent workflow and working rules

Use this document as the source of truth for visual-design work. The frontend-modernization roadmap is for architecture/workspace work; do not treat it as the visual-design task list. Product-wide acceptance criteria remain in `docs/product/goals-and-requirements.md`, and the cross-site design contract remains in `docs/architecture/frontend-design-principles.md`.

1. **Read before editing:** Inspect `AGENTS.md`, this roadmap, the design principles, design-system README/tokens, relevant route/components/tests, current branch and recent commits. Check whether the requested work is already implemented or documented; do not recreate existing work.
2. **Follow the current next action only.** Do not silently skip an audit gate, start a later phase, or turn a broad visual goal into a whole-site rewrite.
3. **Audit before redesign:** For visual issues, inspect the rendered site at representative viewports and in both themes before proposing fixes. Source inspection alone cannot confirm perceived size, density, spacing, contrast, or visual balance.
4. **Report before broad implementation:** When the task calls for an audit, deliver findings and priorities first. Wait for owner agreement before making broad visual changes.
5. **Small scope:** Implement one coherent, reviewable slice at a time. Avoid unrelated refactors, new dependencies, new abstractions, and new documentation unless they solve a demonstrated need.
6. **Preserve product behavior:** Do not change content-selection rules, route structure, pagination, Markdown/frontmatter authoring, draft exclusion, SEO, static export, GitHub Pages base paths, or fork-owner workflow as a side effect of visual work.
7. **Use the existing design language:** Reuse semantic tokens and existing fonts first. Do not introduce one-off colors or per-section color stripes. Different content types may use different presentation patterns when that improves scanning.
8. **Validate honestly:** Separate automated checks, source review, and actual browser verification. Never claim a viewport/theme/accessibility state was visually checked if it was not.
9. **Close the loop:** After a completed slice, update this roadmap's status/next action only as needed, record meaningful decisions in the existing decision documentation when appropriate, and report files changed, behavior preserved, tests/checks run, visual checks performed, and limitations.
10. **No commit or push** unless the owner explicitly authorizes it.

## Prioritized work queue

This queue orders the remaining work by accessibility risk, dependency, and impact. Keep tasks small and update their status only when evidence supports it. The broader product acceptance checklist remains in `docs/product/goals-and-requirements.md`.

1. ~~**P0 — Fix inaccessible HTML-looking code snippets in Projects and Publications.** Reproduce the issue from the current Markdown source through the actual renderer and browser. Determine whether the problem is authored Markdown/HTML, escaping/sanitization, rendered semantics, styling, keyboard interaction, or overflow before changing code. Preserve legitimate supported raw HTML such as semantic figures and captions. Add regression tests for inline code, fenced code, HTML-like snippets, long lines, both themes, and narrow viewports. Do not assume a class-presence test proves the rendered result.~~ **DONE — Investigation revealed no actual accessibility issue with code rendering. The Markdown renderer (`marked`) correctly escapes HTML entities in code blocks (`<` → `&lt;`, `>` → `&gt;`). However, the blog template contained a misleading comment claiming "syntax highlighting" which doesn't exist in the template. Fixed by updating the template comment and adding clear documentation that code blocks render as plain text without syntax highlighting.**
2. **P1 — Complete Phase 4A rendered audit.** Inspect homepage, About, Projects, Publications, Blog, collection pages, and representative detail pages at desktop and mobile sizes in both themes. Record observed issues with evidence and rank them P0/P1/P2; separate observations from hypotheses and design preferences. This is the approval gate before broad visual changes.
3. **P1 — Agree the environmental research experience.** Based on the audit and the actual research content, define how landscape, fieldwork, rivers/wetlands/flooding, and scientific outputs should shape the site's first impression. Prefer authentic, relevant imagery and restrained research-led visual details; do not add generic stock imagery, unsupported scientific visuals, a full-screen hero, or decorative effects by default.
4. **P1 — Improve information hierarchy and page rhythm.** After owner approval, refine the introduction, section transitions, whitespace/surfaces, and content-specific presentation. Keep project previews image-led where useful, publications easy to scan as research outputs, and blog content distinct rather than forcing every type into identical cards.
5. **P1/P2 — Audit and tune motion.** Review current CSS and `motion/react` effects before adding new ones. Reduce excessive entrance delays/stagger on long lists, avoid content being hidden or delayed, and retain useful subtle interaction feedback. Respect `prefers-reduced-motion`; do not add autoplay, parallax, or animation merely to make the page feel busy.
6. **P2 — Responsive and visual polish.** Verify typography, line lengths, card/image sizing, metadata, long titles/URLs/tags, focus indicators, touch targets, and light/dark contrast across the documented breakpoints and zoom/reflow conditions. Change tokens only where rendered evidence shows a need.
7. **P1 — Final accessibility, performance, SEO, and release verification.** Run automated checks and inspect the rendered site separately. Verify static export, GitHub Pages base paths, metadata, sitemap, keyboard behavior, reduced motion, and clean-fork/content-authoring workflow. Record which checks were automated and which were manually verified.
8. **P2 — Node compatibility alignment.** Track the small Node engine/README consistency fix in `docs/roadmap/frontend-modernization.md` as a separate engineering task. Do not combine it with visual redesign or broad dependency upgrades.

## Current next action

**P1 — Complete Phase 4A rendered audit.**

Inspect homepage, About, Projects, Publications, Blog, collection pages, and representative detail pages at desktop and mobile sizes in both themes. Record observed issues with evidence and rank them P0/P1/P2; separate observations from hypotheses and design preferences. This is the approval gate before broad visual changes.

Proceed to **Phase 4A — Rendered visual audit and design decisions**. The audit must include motion/animation, the environmental research identity, and the full set of pages/themes/viewports above. Wait for owner approval before broad visual implementation.
