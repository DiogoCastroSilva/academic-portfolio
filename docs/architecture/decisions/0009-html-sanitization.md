# ADR-0009: HTML Sanitization for Markdown Rendering

- **Status:** Implemented (2026-10-26)
- **Context:** The repository renders Markdown to HTML via `marked` (ADR-0003) and
  injects the output via `dangerouslySetInnerHTML` in three components. `marked`
  does **not** sanitize HTML, and no sanitizer was previously applied (ADR-0004
  accepted this for trusted maintainer-authored content only). The River Atlas
  Editorial handoff (Phase 6) elevated HTML sanitization to a priority
  production-readiness item.
- **Decision:** Adopted `sanitize-html` (v2.x) as a maintained, server-side JS
  sanitizer at the shared Markdown→HTML boundary in
  `libs/content/src/lib/create-content-library.ts`, immediately after
  `marked.parse()` completes (including its `postprocess` hook that resolves
  `DEPLOYMENT_URL` placeholders, prefixes relative paths, and adds external-link
  attributes). See "Implementation Plan" below for the full allowlist and
  rationale for not using `DOMPurify`.
- **Alternatives considered:**
  - **`DOMPurify` (`isomorphic-dompurify`):** Widely used in React projects but
    requires a JSDOM environment at build time, adding transitive dependencies.
    `sanitize-html` is pure JavaScript with no DOM dependency, smaller footprint,
    and is purpose-built for server-side Node.js — a better fit for this static-
    export build pipeline.
  - **Hand-written regex sanitizer:** Explicitly rejected — fragile and
    bypassable (see §3 below for bypass examples).
- **Consequences:**
  - Added one production dependency (`sanitize-html`).
  - All Markdown-rendered HTML is now sanitized before injection via
    `dangerouslySetInnerHTML` in ContentDetail, AboutSection, and AboutHero.
  - Automated security tests (39 tests) verify malicious input is stripped and
    legitimate content survives.
  ## 1. Rendering Pipeline Audit

All Markdown→HTML conversion flows through a single entry point:

```
libs/content/src/lib/create-content-library.ts
  → getContentBySlug()
    → createMarkedInstance(config)   // from marked-extensions.ts
      → marked.parse(markdown)
        → walkTokens (URL resolution)
        → custom renderers (image/figure, link, paragraph/gallery)
        → hooks.postprocess (raw HTML URL resolution, table wrapping)
  → result stored in ContentItemMeta.body
```

### HTML injection points (all use `dangerouslySetInnerHTML`)

| Component       | File                                                             | Source of HTML                        |
| --------------- | ---------------------------------------------------------------- | ------------------------------------- |
| `ContentDetail` | `apps/main/src/features/content/ContentDetail/ContentDetail.tsx` | `content.body` (parsed Markdown)      |
| `AboutSection`  | `apps/main/src/features/content/AboutSection/AboutSection.tsx`   | `profile.biography` (parsed Markdown) |
| `AboutHero`     | `apps/main/src/features/about/AboutHero/AboutHero.tsx`           | `profile.biography` (parsed Markdown) |

All three paths originate from the same `createMarkedInstance` → `marked.parse()`
pipeline, so a single sanitization boundary in `create-content-library.ts` covers
every injection point.

## 2. Proposed Allowlist

The allowlist must permit all currently-supported content features while
stripping event handler attributes, `javascript:`/`data:` URLs, and `<script>`
elements.

```typescript
const ALLOWED_TAGS = [
  // Block-level
  "p", "br", "hr", "div", "figure", "figcaption",
  // Headings
  "h1", "h2", "h3", "h4", "h5", "h6",
  // Text formatting
  "strong", "b", "em", "i", "code", "pre", "blockquote",
  // Lists
  "ul", "ol", "li",
  // Links and images
  "a", "img", "picture", "source",
  // Tables
  "table", "thead", "tbody", "tr", "th", "td",
  // Inline
  "span", "sup", "sub",
];

const ALLOWED_ATTRIBUTES = {
  a: ["href", "target", "rel", "class", "title", "aria-label"],
  img: ["src", "alt", "width", "height", "sizes", "loading", "fetchpriority"],
  source: ["srcSet", "type", "sizes"],
  figure: ["class"],
  figcaption: [],
  div: ["class"],
  span: ["class"],
  th: ["scope", "class"],
  td: [],
  pre: ["class"],
  code: ["class", "data-*"],
  *: ["class"],  // Allow class attr broadly for prose styling
};

const ALLOWED_PROTOCOLS = ["https", "http", "mailto", "tel"];
const ALLOWED_SCHEMES = ["#", "anchor"];  // Anchor links
```

Notes:

- `*` in `ALLOWED_ATTRIBUTES` means `sanitize-html` allows `class` on every tag,
  which is necessary for the `@tailwindcss/typography` prose classes (e.g.,
  `prose`, `external-link`).
- `data-*` is allowed on `code` elements (used by some syntax highlighters).
- `javascript:` and `data:` URL schemes are stripped from `href`/`src`.

## 3. Malicious Input Examples for Security Tests

The following test cases must be covered (equivalent to the handoff's Phase 6
requirements):

1. **Event-handler attribute on image:**
   `<img src=x onerror=alert(1)>` → `onerror` stripped, `src` kept (or image removed if `src` is invalid).

2. **`<script>` element:**
   `<script>alert('xss')</script>` → entire element removed.

3. **`javascript:` link:**
   `<a href="javascript:alert(1)">click</a>` → `href` replaced with empty string or link removed.

4. **Unsafe attributes:**
   `<p style="background:url(javascript:alert(1))">x</p>` → `style` stripped.

5. **Nested bypass attempt:**
   `<scr<script>ipt>alert(1)</scr</script>ipt>` → no `<script>` in output.

6. **`<iframe>` embed:**
   `<iframe src="https://evil.com"></iframe>` → element removed (not in allowlist).

7. **`<svg onload>`:**
   `<svg onload="alert(1)"><script>alert(2)</script></svg>` → all removed.

## 4. Implementation Plan (Completed)

### Step 1: Install dependency ✅

```bash
npm install sanitize-html
npm install -D @types/sanitize-html
```

### Step 2: Create shared sanitizer module ✅

File: `libs/content/src/lib/sanitize-html.ts`

```typescript
import sanitize from "sanitize-html";

export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [...],
    allowedAttributes: { ... },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowedSchemesAppliedToAttributes: ["href", "src"],
    disallowedTagsMode: "escape",
  });
}
```

### Step 3: Apply at the shared boundary ✅

In `getContentBySlug()` (the method that calls `marked.parse`):

```typescript
const htmlBody = await markedInstance.parse(body);
const sanitizedBody = sanitizeHtml(htmlBody);

return { ...meta, body: sanitizedBody };
```

### Step 4: Security + regression tests ✅

- `libs/content/src/lib/sanitize-html.test.ts` — 39 tests with malicious input
- Verified legitimate content (figures, tables, links, code) survives
- All tests pass (236 total tests in @academic-portfolio/content)

## 5. Conditions for Revisiting

None — this is a one-time hardening change. The allowlist may be expanded
case-by-case if future content features require additional tags/attributes.
