# ADR-0004: Content validation and rendering security

- **Status:** Accepted
- **Context:** Parsed frontmatter is initially an untyped object. The previous implementation cast it directly to `ContentMeta` without runtime checks, risking silent rendering of invalid content. Additionally, `marked` renders HTML without sanitization, creating potential XSS vectors if untrusted content is ever introduced.
- **Decision:**
  1. Add runtime validation for all required frontmatter fields (`title`, `date`).
  2. Validate field types and date format (`YYYY-MM-DD`).
  3. Fail the build with an actionable error message identifying the file and field when content is invalid — never silently invent defaults.
  4. Establish a trust model for HTML: content is authored by the repository maintainer (trusted). No HTML sanitizer is introduced now, but the trust boundary is documented.
- **Alternatives considered:**
  - **`zod` or `ajv` for schema validation:** Would add a runtime dependency. The hand-rolled validator is small (~40 lines), well-tested, and sufficient for the current frontmatter schema.
  - **HTML sanitizer (`DOMPurify`, `@html-validate/sanitize`):** Not needed for trusted maintainer-authored content. Would add bundle size and runtime overhead. Documented as a future requirement if external submissions are enabled.
- **Consequences and trade-offs:**
  - Invalid content fails the build rather than rendering a broken page. This is the desired behavior for a portfolio — incorrect metadata should be caught before deployment.
  - Raw HTML in Markdown is passed through unchanged. This allows academic formatting (`<figure>`, `<b>`, `<br>`) but means any HTML injection would be rendered verbatim. The trust model mitigates this risk.
  - The `DEPLOYMENT_URL` placeholder is replaced before relative-link rewriting to prevent incorrect URL prefixing.
- **Evidence or validation:**
  - Tests cover: missing title, missing date, invalid date format, non-string fields, non-string slug, multiple errors in one file, and error messages containing the filename.
  - The `getContentBySlug` function replaces `href="DEPLOYMENT_URL"` with the deployment URL before rewriting relative links.
- **Conditions for revisiting:** If a public content-submission workflow is added, adopt an HTML sanitizer and re-evaluate the validation strategy.
