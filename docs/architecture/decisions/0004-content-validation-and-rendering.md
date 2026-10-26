# ADR-0004: Content validation and rendering security

- **Status:** Implemented (2026-10-26)
- **Context:** Parsed frontmatter is initially an untyped object. The previous implementation cast it directly to `ContentMeta` without runtime checks, risking silent rendering of invalid content. Additionally, `marked` renders HTML without sanitization, creating potential XSS vectors if untrusted content is ever introduced. URL resolution and external link attributes are applied via `marked`'s `walkTokens` (for Markdown-native tokens) and `hooks.postprocess` (for raw HTML).
- **Decision:**
  1. Add runtime validation for all required frontmatter fields (`title`, `date`).
  2. Validate field types and date format (`YYYY-MM-DD`).
  3. Validate types of optional fields (`image`, `tags`, `links`, `authors`, `venue`, `doi`, `paperUrl`) — if provided, they must be the correct type (string, string[], string[], string[], string, string, string respectively).
  4. Fail the build with an actionable error message identifying the file and field when content is invalid — never silently invent defaults.
  5. Establish a trust model for HTML: content is authored by the repository maintainer (trusted). HTML sanitization is now applied to collection content (projects, publications, blog) via ADR-0009. Profile biography sanitization is applied in profile.ts.
     5a. Apply the same "fail fast" pattern to README.md nested collections (`education`, `researchInterests`, `skills`): validate entry objects and string fields, throw with actionable messages instead of silently dropping entries or rendering empty data.
- **Alternatives considered:**
  - **`zod` or `ajv` for schema validation:** Would add a runtime dependency. The hand-rolled validator is small (~40 lines), well-tested, and sufficient for the current frontmatter schema.
  - **HTML sanitizer (`DOMPurify`, `@html-validate/sanitize`):** Adopted `sanitize-html` (v2.x) for collection content per ADR-0009. Server-side pure JavaScript, no DOM dependency, smaller footprint than DOMPurify.
- **Consequences and trade-offs:**
  - Invalid content fails the build rather than rendering a broken page. This is the desired behavior for a portfolio — incorrect metadata should be caught before deployment.
  - Collection content (projects, publications, blog) is sanitized at the shared boundary in `create-content-library.ts` after `marked.parse()`. Profile biography is sanitized in `profile.ts` at the same boundary.
  - Raw HTML in Markdown is processed by `marked` then sanitized using a strict allowlist. This allows academic formatting (`<figure>`, `<b>`, `<br>`) while stripping event handlers, unsafe URLs, and executable markup.
  - The `DEPLOYMENT_URL` placeholder is resolved by `walkTokens` (Markdown tokens) and `hooks.postprocess` (raw HTML) before any relative-link rewriting to prevent incorrect URL prefixing.
- **Evidence or validation:**
  - Tests cover: missing title, missing date, invalid date format, non-string fields, non-string slug, non-array tags/links/authors, non-string venue/doi/paperUrl/image, multiple errors in one file, and error messages containing the filename. Profile nested collection validation: non-array, non-object entry, non-string field, empty field, non-array details/items, and multiple errors collected in one throw.
  - Security tests in `sanitize-html.test.ts` verify malicious input is stripped and legitimate content survives.
  - The `getContentBySlug` function uses `createMarkedInstance` which internally resolves `DEPLOYMENT_URL` via `walkTokens` (Markdown tokens) and `hooks.postprocess` (raw HTML), so no manual regex replacement of the placeholder is needed in the calling code.
- **Conditions for revisiting:** If a public content-submission workflow is added, review the sanitization allowlist to ensure it remains appropriate for external submissions.
