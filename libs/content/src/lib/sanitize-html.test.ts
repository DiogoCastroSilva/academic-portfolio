import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "./sanitize-html";

describe("sanitizeHtml", () => {
  describe("security tests - malicious input", () => {
    it("strips event-handler attributes from images", () => {
      const input = '<img src="x" onerror="alert(1)">';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("onerror");
      expect(output).not.toContain("alert");
    });

    it("removes script elements", () => {
      const input = '<script>alert("xss")</script>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("<script>");
      // Script tags are escaped, so the alert text becomes harmless escaped text
      expect(output).toContain("&lt;script");
    });

    it("strips javascript: URLs from links", () => {
      const input = '<a href="javascript:alert(1)">click</a>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("javascript:");
      expect(output).not.toContain("alert");
    });

    it("strips unsafe style attributes", () => {
      const input = '<p style="background:url(javascript:alert(1))">x</p>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("style");
      expect(output).not.toContain("javascript:");
    });

    it("prevents nested script bypass attempts", () => {
      const input = "<scr<script>ipt>alert(1)</scr</script>ipt>";
      const output = sanitizeHtml(input);
      expect(output).not.toContain("<script>");
      // Script tags are escaped, so the alert text becomes harmless escaped text
      expect(output).toContain("&lt;script");
    });

    it("removes iframe elements", () => {
      const input = '<iframe src="https://evil.com"></iframe>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("<iframe>");
      expect(output).not.toContain("evil.com");
    });

    it("removes SVG with onload handler", () => {
      const input = '<svg onload="alert(1)"><script>alert(2)</script></svg>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("<svg>");
      expect(output).not.toContain("onload");
      expect(output).not.toContain("<script>");
    });

    it("strips data: URLs from links", () => {
      const input =
        '<a href="data:text/html,<script>alert(1)</script>">click</a>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("data:");
    });

    it("strips data: URLs from images", () => {
      const input = '<img src="data:image/svg+xml,<script>alert(1)</script>">';
      const output = sanitizeHtml(input);
      expect(output).not.toContain("data:");
    });
  });

  describe("regression tests - legitimate content", () => {
    it("preserves paragraph elements", () => {
      const input = "<p>This is a paragraph.</p>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<p>");
      expect(output).toContain("This is a paragraph.");
    });

    it("preserves heading elements", () => {
      const input = "<h1>Title</h1><h2>Subtitle</h2>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<h1>Title</h1>");
      expect(output).toContain("<h2>Subtitle</h2>");
    });

    it("preserves strong and em elements", () => {
      const input = "<strong>bold</strong> and <em>italic</em>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<strong>bold</strong>");
      expect(output).toContain("<em>italic</em>");
    });

    it("preserves code blocks", () => {
      const input = "<pre><code>const x = 1;</code></pre>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<pre>");
      expect(output).toContain("<code>");
      expect(output).toContain("const x = 1;");
    });

    it("preserves inline code", () => {
      const input = "<p>Use <code>console.log()</code> for debugging.</p>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<code>console.log()</code>");
    });

    it("preserves lists", () => {
      const input = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<ul>");
      expect(output).toContain("<li>Item 1</li>");
      expect(output).toContain("<li>Item 2</li>");
    });

    it("preserves ordered lists", () => {
      const input = "<ol><li>First</li><li>Second</li></ol>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<ol>");
      expect(output).toContain("<li>First</li>");
    });

    it("preserves blockquotes", () => {
      const input = "<blockquote>A quote</blockquote>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<blockquote>");
      expect(output).toContain("A quote");
    });

    it("preserves safe external links", () => {
      const input =
        '<a href="https://example.com" class="external-link">Example</a>';
      const output = sanitizeHtml(input);
      expect(output).toContain('href="https://example.com"');
      expect(output).toContain("Example");
    });

    it("preserves mailto links", () => {
      const input = '<a href="mailto:test@example.com">Email</a>';
      const output = sanitizeHtml(input);
      expect(output).toContain('href="mailto:test@example.com"');
    });

    it("preserves tel links", () => {
      const input = '<a href="tel:+1234567890">Call</a>';
      const output = sanitizeHtml(input);
      expect(output).toContain('href="tel:+1234567890"');
    });

    it("preserves anchor links", () => {
      const input = '<a href="#section">Section</a>';
      const output = sanitizeHtml(input);
      expect(output).toContain('href="#section"');
    });

    it("preserves images with safe attributes", () => {
      const input =
        '<img src="/image.jpg" alt="An image" width="400" height="300">';
      const output = sanitizeHtml(input);
      expect(output).toContain('src="/image.jpg"');
      expect(output).toContain('alt="An image"');
      expect(output).toContain('width="400"');
      expect(output).toContain('height="300"');
    });

    it("preserves figure and figcaption", () => {
      const input =
        '<figure><img src="chart.png" alt="Chart"><figcaption>Figure 1</figcaption></figure>';
      const output = sanitizeHtml(input);
      expect(output).toContain("<figure>");
      expect(output).toContain("<figcaption>Figure 1</figcaption>");
    });

    it("preserves tables", () => {
      const input =
        "<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Data</td></tr></tbody></table>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<table>");
      expect(output).toContain("<thead>");
      expect(output).toContain("<tbody>");
      expect(output).toContain("<th>Header</th>");
      expect(output).toContain("<td>Data</td>");
    });

    it("preserves allowed class attributes", () => {
      const input = '<p class="prose">Styled paragraph</p>';
      const output = sanitizeHtml(input);
      expect(output).toContain('class="prose"');
    });

    it("preserves div elements", () => {
      const input = '<div class="gallery">Gallery content</div>';
      const output = sanitizeHtml(input);
      expect(output).toContain('class="gallery"');
      expect(output).toContain("Gallery content");
    });

    it("preserves external-link class and target/rel attributes", () => {
      const input =
        '<a href="https://example.com" class="external-link" target="_blank" rel="noopener noreferrer">Link</a>';
      const output = sanitizeHtml(input);
      expect(output).toContain('class="external-link"');
      expect(output).toContain('target="_blank"');
      expect(output).toContain('rel="noopener noreferrer"');
    });

    it("preserves picture and source elements", () => {
      const input =
        '<picture><source srcset="image.webp" type="image/webp"><img src="image.jpg" alt="Image"></picture>';
      const output = sanitizeHtml(input);
      expect(output).toContain("<picture>");
      expect(output).toContain("<source");
      expect(output).toContain('srcset="image.webp"');
      expect(output).toContain('type="image/webp"');
    });

    it("preserves allowed data-* attributes on code", () => {
      const input = '<code data-language="typescript">const x = 1;</code>';
      const output = sanitizeHtml(input);
      expect(output).toContain('data-language="typescript"');
    });

    it("preserves scope attribute on th", () => {
      const input = '<th scope="col">Header</th>';
      const output = sanitizeHtml(input);
      expect(output).toContain('scope="col"');
    });

    it("preserves title attribute on links", () => {
      const input = '<a href="https://example.com" title="Link title">Link</a>';
      const output = sanitizeHtml(input);
      expect(output).toContain('title="Link title"');
    });

    it("preserves aria-label attribute on links", () => {
      const input =
        '<a href="https://example.com" aria-label="Read more">Link</a>';
      const output = sanitizeHtml(input);
      expect(output).toContain('aria-label="Read more"');
    });

    it("preserves sup and sub elements", () => {
      const input = "<p>H<sub>2</sub>O and E=mc<sup>2</sup></p>";
      const output = sanitizeHtml(input);
      expect(output).toContain("<sub>2</sub>");
      expect(output).toContain("<sup>2</sup>");
    });

    it("preserves horizontal rules", () => {
      const input = "<hr>";
      const output = sanitizeHtml(input);
      expect(output).toMatch(/<hr\s*\/?>/);
    });

    it("preserves line breaks", () => {
      const input = "<p>Line 1<br>Line 2</p>";
      const output = sanitizeHtml(input);
      expect(output).toMatch(/<br\s*\/?>/);
    });
  });

  describe("edge cases", () => {
    it("handles empty string input", () => {
      const input = "";
      const output = sanitizeHtml(input);
      expect(output).toBe("");
    });

    it("handles input with no HTML", () => {
      const input = "Plain text with no HTML";
      const output = sanitizeHtml(input);
      expect(output).toBe("Plain text with no HTML");
    });

    it("escapes disallowed tags instead of removing them", () => {
      const input = "<button>Click me</button>";
      const output = sanitizeHtml(input);
      expect(output).not.toContain("<button>");
      expect(output).toContain("&lt;button");
    });

    it("handles malformed HTML gracefully", () => {
      const input = "<p>Unclosed paragraph<div>Nested without closing";
      const output = sanitizeHtml(input);
      expect(output).toBeTruthy();
    });
  });
});
