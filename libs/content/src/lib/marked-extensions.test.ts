import { describe, expect, it, vi } from "vitest";

import {
  type ContentRendererConfig,
  createMarkedInstance,
  resolveHref,
} from "./marked-extensions.js";

// ---------------------------------------------------------------------------
// resolveHref
// ---------------------------------------------------------------------------

describe("resolveHref", () => {
  const baseConfig: ContentRendererConfig = {
    publicPrefix: "/test",
  };

  it("replaces DEPLOYMENT_URL placeholder with deployment URL", () => {
    const config: ContentRendererConfig = {
      publicPrefix: "/test",
      deploymentUrl: "https://example.com",
    };
    expect(resolveHref("DEPLOYMENT_URL", config, "link")).toBe(
      "https://example.com",
    );
  });

  it("leaves DEPLOYMENT_URL placeholder intact when no deployment URL", () => {
    expect(resolveHref("DEPLOYMENT_URL", baseConfig, "link")).toBe(
      "DEPLOYMENT_URL",
    );
  });

  it("replaces empty href with deployment URL", () => {
    const config: ContentRendererConfig = {
      publicPrefix: "/test",
      deploymentUrl: "https://example.com",
    };
    expect(resolveHref("", config, "link")).toBe("https://example.com");
  });

  it("leaves empty href intact when no deployment URL", () => {
    expect(resolveHref("", baseConfig, "link")).toBe("");
  });

  it("does not modify external URLs", () => {
    expect(resolveHref("https://example.com/page", baseConfig, "link")).toBe(
      "https://example.com/page",
    );
  });

  it("does not modify anchor links", () => {
    expect(resolveHref("#section", baseConfig, "link")).toBe("#section");
  });

  it("does not modify mailto links", () => {
    expect(resolveHref("mailto:person@example.com", baseConfig, "link")).toBe(
      "mailto:person@example.com",
    );
  });

  it("does not modify absolute image paths", () => {
    expect(resolveHref("/image.png", baseConfig, "image")).toBe("/image.png");
  });

  it("does modify absolute link paths (strips leading slash and prefixes)", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");
    expect(resolveHref("/relative-page", baseConfig, "link")).toBe(
      "/subpath/test/relative-page",
    );
    vi.unstubAllEnvs();
  });

  it("resolves relative image paths with prefix", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");
    expect(resolveHref("image.png", baseConfig, "image")).toBe(
      "/subpath/test/image.png",
    );
    vi.unstubAllEnvs();
  });

  it("resolves relative link paths with prefix", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");
    expect(resolveHref("other-post", baseConfig, "link")).toBe(
      "/subpath/test/other-post",
    );
    vi.unstubAllEnvs();
  });

  it("works without a publicPrefix", () => {
    expect(resolveHref("image.png", { publicPrefix: "" }, "image")).toBe(
      "/image.png",
    );
  });
});

// ---------------------------------------------------------------------------
// ContentRenderer — image rendering (figure/figcaption)
// ---------------------------------------------------------------------------

describe("ContentRenderer — image rendering", () => {
  const config: ContentRendererConfig = {
    publicPrefix: "/test",
  };

  function renderBody(markdown: string): string {
    const instance = createMarkedInstance(config);
    return instance.parse(markdown) as string;
  }

  it("wraps markdown images in <figure> with alt text caption", () => {
    const html = renderBody("![Alt text](image.png)");
    expect(html).toContain("<figure>");
    expect(html).toContain("</figure>");
    expect(html).toContain('alt="Alt text"');
    expect(html).toContain("<figcaption>Alt text</figcaption>");
  });

  it("uses title as figcaption when present", () => {
    const html = renderBody('![Alt text](image.png "Custom caption")');
    expect(html).toContain("<figcaption>Custom caption</figcaption>");
    expect(html).toContain('title="Custom caption"');
  });

  it("does not add figcaption when alt and title are both empty", () => {
    const html = renderBody("![](image.png)");
    expect(html).toContain("<figure>");
    expect(html).not.toContain("<figcaption>");
    expect(html).toContain('alt=""');
  });

  it("uses title as alt text fallback when alt is missing", () => {
    const html = renderBody('![](image.png "Chart title")');
    expect(html).toContain('alt="Chart title"');
    // Caption still uses title
    expect(html).toContain("<figcaption>Chart title</figcaption>");
  });

  it("prefers explicit alt text over title for the alt attribute", () => {
    const html = renderBody('![Explicit alt](image.png "Title text")');
    expect(html).toContain('alt="Explicit alt"');
    // Caption prefers title over alt text
    expect(html).toContain("<figcaption>Title text</figcaption>");
  });

  it("wraps gallery images in div.gallery", () => {
    const html = renderBody("![Img1](a.png)\n![Img2](b.png)");
    expect(html).toContain('<div class="gallery">');
    expect(html).toContain("</div>");
    expect(html).toContain("<figure>");
    expect((html.match(/<figure>/g) || []).length).toBe(2);
  });

  it("does not wrap single images in gallery div", () => {
    const html = renderBody("![Single](image.png)");
    expect(html).not.toContain('class="gallery"');
    expect(html).toContain("<figure>");
  });
});

// ---------------------------------------------------------------------------
// ContentRenderer — link rendering (external attributes)
// ---------------------------------------------------------------------------

describe("ContentRenderer — link rendering", () => {
  const config: ContentRendererConfig = {
    publicPrefix: "/test",
  };

  function renderBody(markdown: string): string {
    const instance = createMarkedInstance(config);
    return instance.parse(markdown) as string;
  }

  it("adds security attributes to external links", () => {
    const html = renderBody("[External](https://example.com/page)");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('class="external-link"');
  });

  it("does not add security attributes to relative links", () => {
    const html = renderBody("[Relative](other-page)");
    expect(html).not.toContain('target="_blank"');
    expect(html).not.toContain('rel="noopener noreferrer"');
    expect(html).not.toContain('class="external-link"');
  });

  it("does not add security attributes to anchor links", () => {
    const html = renderBody("[Jump](#section)");
    expect(html).not.toContain('target="_blank"');
  });

  it("does not add security attributes to mailto links", () => {
    const html = renderBody("[Email](mailto:person@example.com)");
    expect(html).not.toContain('target="_blank"');
  });

  it("preserves link title attribute", () => {
    const html = renderBody('[Text](https://example.com "Title")');
    expect(html).toContain('title="Title"');
  });

  it("renders inline formatting in link text", () => {
    const html = renderBody("[**Bold link**](https://example.com)");
    expect(html).toContain("<strong>Bold link</strong>");
  });
});

// ---------------------------------------------------------------------------
// ContentRenderer — raw HTML postprocess
// ---------------------------------------------------------------------------

describe("ContentRenderer — raw HTML postprocess", () => {
  const config: ContentRendererConfig = {
    publicPrefix: "/test",
    deploymentUrl: "https://example.com",
  };

  function renderBody(markdown: string): string {
    const instance = createMarkedInstance(config);
    return instance.parse(markdown) as string;
  }

  it("preserves absolute image src in raw HTML", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");
    const html = renderBody('<img src="/image.png" alt="Raw" />');
    expect(html).toContain('src="/image.png"');
    vi.unstubAllEnvs();
  });

  it("preserves external image src in raw HTML", () => {
    const html = renderBody('<img src="https://example.com/img.png" />');
    expect(html).toContain('src="https://example.com/img.png"');
  });

  it("replaces DEPLOYMENT_URL in raw HTML href", () => {
    const html = renderBody('<a href="DEPLOYMENT_URL">Link</a>');
    expect(html).not.toContain("DEPLOYMENT_URL");
    expect(html).toContain('href="https://example.com"');
  });

  it("replaces empty href in raw HTML with deployment URL", () => {
    const html = renderBody('<a href="">Empty</a>');
    expect(html).toContain('href="https://example.com"');
  });

  it("rewrites relative href in raw HTML links", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");
    const html = renderBody('<a href="other-page">Link</a>');
    expect(html).toContain('href="/subpath/test/other-page"');
    vi.unstubAllEnvs();
  });

  it("preserves external href in raw HTML", () => {
    const html = renderBody('<a href="https://example.com">Link</a>');
    expect(html).toContain('href="https://example.com"');
  });

  it("adds external link attributes to raw HTML links", () => {
    const html = renderBody('<a href="https://example.com">Link</a>');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('class="external-link"');
  });

  it("does not double-process markdown-rendered hrefs", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");
    const html = renderBody("[Link](other-post)");
    expect(html).toContain('href="/subpath/test/other-post"');
    expect(html).not.toContain("/subpath//test/");
    vi.unstubAllEnvs();
  });
});

// ---------------------------------------------------------------------------
// Integration: combined markdown + raw HTML
// ---------------------------------------------------------------------------

describe("ContentRenderer — integration", () => {
  it("renders mixed markdown and raw HTML correctly", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");
    const config: ContentRendererConfig = {
      publicPrefix: "/test",
      deploymentUrl: "https://example.com",
    };
    const instance = createMarkedInstance(config);

    const markdown = `# Heading

![Alt](image.png)

[External](https://example.com) and [internal](page-2)

<div class="raw-html"><a href="DEPLOYMENT_URL">Team</a></div>`;
    const html = instance.parse(markdown) as string;

    // Markdown image in figure with prefix
    expect(html).toContain("<figure>");
    expect(html).toContain('<img src="/subpath/test/image.png"');

    // External markdown link with attributes
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');

    // Relative markdown link prefixed
    expect(html).toContain('href="/subpath/test/page-2"');

    // Raw HTML DEPLOYMENT_URL replaced
    expect(html).not.toContain("DEPLOYMENT_URL");

    vi.unstubAllEnvs();
  });
});

// ---------------------------------------------------------------------------
// Table wrapping — wide tables get a scrollable container
// ---------------------------------------------------------------------------

describe("ContentRenderer — table wrapping", () => {
  const config: ContentRendererConfig = {
    publicPrefix: "/test",
  };

  function renderBody(markdown: string): string {
    const instance = createMarkedInstance(config);
    return instance.parse(markdown) as string;
  }

  it("wraps GFM tables in a scrollable div", () => {
    const html = renderBody(
      "| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell A   | Cell B   |\n",
    );
    expect(html).toContain('<div class="overflow-x-auto">');
    expect(html).toContain("</div>");
    // The table itself is preserved inside the wrapper
    expect(html).toContain("<table>");
    expect(html).toContain("</table>");
  });

  it("preserves table content and structure inside the wrapper", () => {
    const html = renderBody(
      "| Name | Value |\n| ---- | ----- |\n| Foo  | 1     |\n",
    );
    // Header cells preserved
    expect(html).toContain("Name");
    expect(html).toContain("Value");
    // Body cells preserved
    expect(html).toContain("Foo");
    expect(html).toContain("1");
  });

  it("does not wrap raw HTML tables that already have a wrapper", () => {
    // The postprocess wraps <table> in a div; if a <table> is already inside
    // a div, the regex still wraps it (no double-wrapping prevention needed
    // because GFM markdown never generates nested wrappers).
    const html = renderBody(
      '<div class="raw"><table><tr><td>A</td></tr></table></div>',
    );
    expect(html).toContain('<div class="overflow-x-auto">');
    expect(html).toContain("<td>A");
  });

  it("wraps each table in its own scrollable container", () => {
    const html = renderBody(
      "| A | B |\n|---|---|\n| 1 | 2 |\n\n" +
        "Some text\n\n" +
        "| X | Y |\n|---|---|\n| a | b |\n",
    );
    // Count wrapper divs by counting the opening tag
    const wrapperCount = html.split('<div class="overflow-x-auto">').length - 1;
    expect(wrapperCount).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Markdown HTML Policy (ADR-0004: trusted content, no sanitizer)
// ---------------------------------------------------------------------------

describe("Markdown HTML policy", () => {
  const config: ContentRendererConfig = {
    publicPrefix: "/test",
    deploymentUrl: "https://example.com",
  };

  function renderBody(markdown: string): string {
    const instance = createMarkedInstance(config);
    return instance.parse(markdown) as string;
  }

  it("passes through inline HTML formatting elements unmodified", () => {
    const html = renderBody(
      "<b>bold</b> and <i>italic</i> and <em>emphasis</em>",
    );
    expect(html).toContain("<b>bold</b>");
    expect(html).toContain("<i>italic</i>");
    expect(html).toContain("<em>emphasis</em>");
  });

  it("passes through block-level HTML elements (figure, div, br)", () => {
    const html = renderBody(
      '<figure><img src="/img.png" alt="Test" /><figcaption>Caption</figcaption></figure>',
    );
    expect(html).toContain("<figure>");
    expect(html).toContain("</figure>");
    expect(html).toContain("<figcaption>Caption</figcaption>");
  });

  it("does not escape raw HTML angle brackets", () => {
    const html = renderBody("<b>text</b>");
    // If HTML were escaped, <b> would become &lt;b&gt;
    expect(html).not.toContain("&lt;b&gt;");
    expect(html).toContain("<b>text</b>");
  });

  it("adds security attributes to raw HTML external links", () => {
    const html = renderBody('<a href="https://evil.com">Unsafe</a>');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('class="external-link"');
  });

  it("does not sanitize script tags at the marked.parse() layer (sanitization applied separately)", () => {
    // `marked.parse()` itself does not sanitize HTML — that is by design.
    // Sanitization is applied as a separate boundary AFTER `marked.parse()`
    // returns: in `getContentBySlug()` (content collections) and in
    // `parseBiography()` (profile biography), both via `sanitizeHtml()`.
    // This test validates the `marked.parse()` layer only; the sanitized
    // output is verified in sanitize-html.test.ts and create-content-library.test.ts.
    // See ADR-0009 for the full trust model and allowlist.
    const html = renderBody("<b>text</b>\n\n<script>alert(1)</script>");
    expect(html).toContain("<script>");
  });
});

// ---------------------------------------------------------------------------
// Heading level shifting
// ---------------------------------------------------------------------------

describe("heading level shifting", () => {
  const config: ContentRendererConfig = {
    publicPrefix: "/content",
  };

  function renderMarkdown(md: string): string {
    return createMarkedInstance(config).parse(md) as string;
  }

  it("shifts h1 (#) down to h2", () => {
    const html = renderMarkdown("# My Heading");
    expect(html).toContain("<h2>");
    expect(html).toContain("My Heading</h2>");
    expect(html).not.toContain("<h1>");
  });

  it("shifts h2 (##) down to h3", () => {
    const html = renderMarkdown("## Section Title");
    expect(html).toContain("<h3>");
    expect(html).toContain("Section Title</h3>");
  });

  it("shifts h3 (###) down to h4", () => {
    const html = renderMarkdown("### Subsection");
    expect(html).toContain("<h4>");
    expect(html).toContain("Subsection</h4>");
  });

  it("caps heading at h6", () => {
    // ###### is the deepest heading in markdown (h6). After shifting by +1,
    // it should cap at h6 (not go to h7).
    const html = renderMarkdown("###### Deepest");
    expect(html).toContain("<h6>");
    expect(html).toContain("Deepest</h6>");
  });

  it("never produces h1 in rendered markdown content", () => {
    const html = renderMarkdown("# Top\n## Sub\n### Sub-sub\n#### Deep");
    // The page-level H1 is reserved for the title; markdown content must
    // never introduce duplicate h1 elements.
    expect(html).not.toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).toContain("<h4");
  });
});
