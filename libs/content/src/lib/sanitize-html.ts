import sanitize from "sanitize-html";

/**
 * Sanitize HTML output from Markdown rendering to prevent XSS attacks.
 *
 * This function applies a strict allowlist of permitted tags and attributes,
 * stripping event handlers, unsafe URL schemes (javascript:, data:), and
 * executable markup (script, iframe, etc.).
 *
 * @param html - Raw HTML string from marked.parse()
 * @returns Sanitized HTML string safe for injection via dangerouslySetInnerHTML
 */
export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [
      // Block-level
      "p",
      "br",
      "hr",
      "div",
      "figure",
      "figcaption",
      // Headings
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      // Text formatting
      "strong",
      "b",
      "em",
      "i",
      "code",
      "pre",
      "blockquote",
      // Lists
      "ul",
      "ol",
      "li",
      // Links and images
      "a",
      "img",
      "picture",
      "source",
      // Tables
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      // Inline
      "span",
      "sup",
      "sub",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "class", "title", "aria-label"],
      img: [
        "src",
        "alt",
        "width",
        "height",
        "sizes",
        "loading",
        "fetchpriority",
      ],
      source: ["srcset", "type", "sizes"],
      figure: ["class"],
      figcaption: [],
      div: ["class"],
      span: ["class"],
      th: ["scope", "class"],
      td: [],
      pre: ["class"],
      code: ["class", "data-*"],
      "*": ["class"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowedSchemesAppliedToAttributes: ["href", "src"],
    disallowedTagsMode: "escape",
  });
}
