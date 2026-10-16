# ADR-0003: Markdown content processing

- **Status:** Accepted
- **Context:** The portfolio stores academic project and publication content as Markdown files with YAML frontmatter. The system must parse frontmatter, render Markdown to HTML, and handle optional fields (tags, excerpt, team, links, cover images) gracefully.
- **Decision:** Use `gray-matter` for frontmatter parsing and `marked` for Markdown-to-HTML rendering, as a single deliberate, tested pipeline.
- **Alternatives considered:**
  - **MDX (`@next/mdx`):** Installed but not used. The content does not require embedded React components. Adding MDX would introduce complexity (file-type changes, build pipeline modifications) without clear benefit for academic prose with occasional raw HTML figures. Removed from dependencies.
  - **Remark/rehype ecosystem:** More modular but adds many dependencies and configuration overhead. `marked` is lighter and sufficient for this project's Markdown subset.
  - **Custom parser:** Would violate the principle of using well-maintained libraries for content parsing.
- **Consequences and trade-offs:**
  - `marked` does not sanitize HTML by default. The HTML security policy is addressed in ADR-0004.
  - Raw HTML in Markdown (e.g., `<figure>`, `<b>`) is preserved. This is a deliberate choice for academic content that needs precise formatting.
  - Slugs are derived from filenames, with an optional frontmatter `slug` override.
- **Evidence or validation:**
  - 44 tests in `libs/content/src/lib/create-content-library.test.ts` cover frontmatter parsing, validation, image resolution, link rewriting, DEPLOYMENT_URL substitution, and empty/missing-content cases.
  - The content pipeline runs at build time (SSG), not at request time.
- **Conditions for revisiting:** If external contributions (e.g., a public submission form) are added, an HTML sanitizer must be introduced to prevent XSS.
