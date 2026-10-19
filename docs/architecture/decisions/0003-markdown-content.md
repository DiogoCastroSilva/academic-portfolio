# ADR-0003: Markdown content processing

- **Status:** Accepted
- **Context:** The portfolio stores academic project and publication content as Markdown files with YAML frontmatter. The system must parse frontmatter, render Markdown to HTML, and handle optional fields (tags, excerpt, team, links, cover images) gracefully. Markdown body content may contain relative image paths, `DEPLOYMENT_URL` placeholders, anchor links, and raw HTML for academic formatting.
- **Decision:** Use `gray-matter` for frontmatter parsing and `marked` (v14) for Markdown-to-HTML rendering, as a single deliberate, tested pipeline. The `Marked` instance is created via `createMarkedInstance(config)` in `libs/content/src/lib/marked-extensions.ts`, which wires up three extension mechanisms:
  1. **`walkTokens`** — runs on every token before rendering, resolves `href`/`src` on `image` and `link` tokens (DEPLOYMENT_URL placeholder, empty hrefs, relative path prefixing). This handles all Markdown-native links and images.
  2. **Custom renderers** — `image` renderer wraps images in `<figure>` with optional `<figcaption>` (prefers `title`, falls back to alt); `link` renderer adds `target="_blank" rel="noopener noreferrer" class="external-link"` to external links; `paragraph` renderer detects gallery patterns (multiple images in one paragraph).
  3. **`hooks.postprocess`** — runs on the final HTML string, handling raw HTML that `walkTokens` cannot reach (DEPLOYMENT_URL replacement, relative path prefixing, external link attributes). Uses a negative lookahead in the relative-path regex to avoid double-processing Markdown-rendered hrefs.
- **Alternatives considered:**
  - **MDX (`@next/mdx`):** Installed but not used. The content does not require embedded React components. Adding MDX would introduce complexity (file-type changes, build pipeline modifications) without clear benefit for academic prose with occasional raw HTML figures. Removed from dependencies.
  - **Remark/rehype ecosystem:** More modular but adds many dependencies and configuration overhead. `marked` is lighter and sufficient for this project's Markdown subset.
  - **Custom parser:** Would violate the principle of using well-maintained libraries for content parsing.
- **Consequences and trade-offs:**
  - `marked` does not sanitize HTML by default. The HTML security policy is addressed in ADR-0004.
  - Raw HTML in Markdown (e.g., `<figure>`, `<b>`) is preserved by `marked` and then processed by the `hooks.postprocess` hook for URL resolution and external link attributes. This is a deliberate choice for academic content that needs precise formatting.
  - URL resolution is split into two phases: `walkTokens` handles Markdown-native `href`/`src` tokens (image and link); `hooks.postprocess` handles raw HTML attributes. The two paths use complementary regex patterns with a negative lookahead to prevent double-processing.
  - Slugs are derived from directory names; frontmatter `slug` is accepted but ignored.
- **Evidence or validation:**
  - 87 tests in `libs/content/src/lib/create-content-library.test.ts` cover frontmatter parsing, validation, image resolution, link rewriting, DEPLOYMENT_URL handling, empty/missing-content cases, and publication-specific fields (`authors`, `venue`, `doi`, `paperUrl`).
  - 12 tests in `libs/content/src/lib/profile.test.ts` cover profile frontmatter parsing, validation of required fields, structured data parsing (education, research interests, skills), biography rendering, and image URL resolution.
  - 32 tests in `libs/content/src/lib/marked-extensions.test.ts` cover the `resolveHref` URL resolver, image rendering (`<figure>`/`<figcaption>`), link rendering (external link attributes), gallery detection, raw HTML postprocess (DEPLOYMENT_URL replacement, relative path prefixing, double-processing prevention), and integration of all features together.
  - The content pipeline runs at build time (SSG), not at request time.
- **Conditions for revisiting:** If external contributions (e.g., a public submission form) are added, an HTML sanitizer must be introduced to prevent XSS.
