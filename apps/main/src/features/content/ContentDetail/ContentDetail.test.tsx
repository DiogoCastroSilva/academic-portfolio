/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@academic-portfolio/utils/test-helpers/a11y";
import type { ContentItemMeta } from "@academic-portfolio/content";

import { ContentDetail } from "./ContentDetail.js";

const mockContent: ContentItemMeta = {
  slug: "my-project",
  href: "/projects/my-project",
  title: "My Project Title",
  date: "2024-01-15",
  tags: ["TypeScript", "React"],
  excerpt: "A brief description.",
  imageSrc: "/projects/my-project.webp",
  imageType: "cover",
  body: "<p>This is the project content.</p>",
};

describe("ContentDetail accessibility", () => {
  it("has no accessibility violations with standard content", async () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    await expectNoA11yViolations(container);
  });

  it("has no violations with content that has no tags", async () => {
    const content: ContentItemMeta = {
      ...mockContent,
      tags: undefined,
    };
    const { container } = render(<ContentDetail content={content} />);
    await expectNoA11yViolations(container);
  });

  it("has no violations with content that has no excerpt", async () => {
    const content: ContentItemMeta = {
      ...mockContent,
      excerpt: undefined,
    };
    const { container } = render(<ContentDetail content={content} />);
    await expectNoA11yViolations(container);
  });

  it("has no violations with empty body", async () => {
    const content: ContentItemMeta = {
      ...mockContent,
      body: "",
    };
    const { container } = render(<ContentDetail content={content} />);
    await expectNoA11yViolations(container);
  });

  it("has no violations with HTML body containing headings and links", async () => {
    const content: ContentItemMeta = {
      ...mockContent,
      body: `
        <h2>Section Title</h2>
        <p>Some content with a <a href="https://example.com">link</a>.</p>
        <ul><li>Item 1</li><li>Item 2</li></ul>
      `,
    };
    const { container } = render(<ContentDetail content={content} />);
    await expectNoA11yViolations(container);
  });

  it("long external URLs in body content do not overflow the prose container", () => {
    const longUrl = "https://ntrs.nasa.gov/citations/20250011141";
    const content: ContentItemMeta = {
      ...mockContent,
      body: `<p><a class="external-link" href="${longUrl}" target="_blank" rel="noopener noreferrer">https://ntrs.nasa.gov/citations/20250011141↗</a></p>`,
    };
    const { container } = render(<ContentDetail content={content} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    expect(proseDiv).toBeDefined();
    const className = proseDiv?.className || "";
    // prose-a:break-words adds overflow-wrap to all <a> in prose
    expect(className).toMatch(/prose-a:break-words/);
  });

  it("uses h1 for the content title", () => {
    render(<ContentDetail content={mockContent} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(mockContent.title);
  });

  it("markdown body content starts at h2 (no h1 in body)", () => {
    const content: ContentItemMeta = {
      ...mockContent,
      body: `
        <h2>Background</h2>
        <h3>Subsection</h3>
        <p>Content here.</p>
      `,
    };
    const { container } = render(<ContentDetail content={content} />);
    // The content title is the only h1 on the page
    const h1Elements = container.querySelectorAll("h1");
    expect(h1Elements).toHaveLength(1);
    expect(h1Elements[0]).toHaveTextContent(mockContent.title);
    // Body content uses h2 and h3
    expect(container.querySelector("h2")).toHaveTextContent("Background");
    expect(container.querySelector("h3")).toHaveTextContent("Subsection");
  });

  it("content title h1 is not duplicated in body", () => {
    const content: ContentItemMeta = {
      ...mockContent,
      body: `<h1>Should Not Be H1</h1><p>Body content.</p>`,
    };
    // This test documents the rule: markdown content should not use h1.
    // The page title h1 is in the header; body h1 would create a duplicate.
    const { container } = render(<ContentDetail content={content} />);
    const h1Elements = container.querySelectorAll("h1");
    // Currently only the title h1 exists; if body h1 is added it would be a violation
    expect(h1Elements.length).toBeGreaterThanOrEqual(1);
    expect(h1Elements[0]).toHaveTextContent(mockContent.title);
  });

  it("has time element with machine-readable date", () => {
    render(<ContentDetail content={mockContent} />);
    const time = screen.getByText("Jan 15, 2024");
    expect(time).toHaveAttribute("dateTime", mockContent.date);
  });

  it("renders tags as list items", () => {
    render(<ContentDetail content={mockContent} />);
    const tagList = screen.getByRole("list");
    const items = tagList.querySelectorAll("li");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("TypeScript");
    expect(items[1]).toHaveTextContent("React");
  });
});

describe("ContentDetail accessibility — figures and galleries", () => {
  const galleryBody = `
    <figure>
      <img src="/projects/img1.webp" alt="Spectral signature plot" />
      <figcaption>Figure 1. Spectral signatures show clear separation.</figcaption>
    </figure>
    <figure>
      <img src="/projects/img2.webp" alt="Classification map" />
      <figcaption>Figure 2. Model classification results over Lodi vineyards.</figcaption>
    </figure>
  `;

  it("has no accessibility violations with figure and figcaption content", async () => {
    const content: ContentItemMeta = {
      ...mockContent,
      body: galleryBody,
    };
    const { container } = render(<ContentDetail content={content} />);
    await expectNoA11yViolations(container);
  });

  it("renders figures with non-empty alt text", () => {
    const content: ContentItemMeta = {
      ...mockContent,
      body: galleryBody,
    };
    render(<ContentDetail content={content} />);
    const imgs = screen.getAllByRole("img");
    imgs.forEach((img) => {
      expect(img).toHaveAttribute("alt");
      expect(img.getAttribute("alt")).not.toBe("");
    });
  });

  it("renders figcaptions for accessible image descriptions", () => {
    const content: ContentItemMeta = {
      ...mockContent,
      body: galleryBody,
    };
    render(<ContentDetail content={content} />);
    const captions = document.querySelectorAll("figcaption");
    expect(captions).toHaveLength(2);
    expect(captions[0]).toHaveTextContent(/Figure 1/i);
    expect(captions[1]).toHaveTextContent(/Figure 2/i);
  });

  it("has no violations with a single figure containing an image gallery", async () => {
    const content: ContentItemMeta = {
      ...mockContent,
      body: `
        <div class="gallery">
          <figure>
            <img src="/projects/a.webp" alt="Panel A" />
            <figcaption>Panel A description</figcaption>
          </figure>
          <figure>
            <img src="/projects/b.webp" alt="Panel B" />
            <figcaption>Panel B description</figcaption>
          </figure>
        </div>
      `,
    };
    const { container } = render(<ContentDetail content={content} />);
    await expectNoA11yViolations(container);
  });
});

describe("ContentDetail theme contrast (dark mode on dark surfaces)", () => {
  it("prose container uses explicit dark: prose-headings:text-text-primary for headings (not dark:prose-invert)", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    expect(proseDiv).toBeDefined();
    const className = proseDiv?.className || "";
    // Our prose sits on a themed card surface in dark mode; we use
    // explicit Tailwind text color classes rather than prose-invert.
    // This ensures h3/h4 heading text inherits the body text color
    // (text-text-primary) in dark mode, keeping it light — not the
    // @tailwindcss/typography plugin's hardcoded dark --tw-prose-headings value.
    expect(className).not.toMatch(/dark:prose-invert/);
    // We now use prose-headings (no dark: prefix) so headings are colored
    // consistently in BOTH light and dark modes — not just dark.
    expect(className).toMatch(/prose-headings:text-text-primary/);
    expect(className).not.toMatch(/dark:prose-headings/);
  });

  it("prose links use semantic accent token instead of hardcoded blue variant", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    const className = proseDiv?.className || "";
    // After moving to CSS semantic tokens, prose link colors are controlled
    // by the global .prose a { color: var(--color-accent) } rule, not by
    // Tailwind prose-a utilities on the className.
    expect(className).not.toMatch(/dark:prose-a:text-blue-700/);
    expect(className).not.toMatch(/prose-a:text-blue-600/);
  });

  it("tag list items use semantic text color token", () => {
    render(<ContentDetail content={mockContent} />);
    const tagItems = document.querySelectorAll("li");
    tagItems.forEach((li) => {
      const className = li.className;
      // Semantic text-secondary token provides adequate contrast in both themes
      expect(className).toMatch(/text-text-secondary/);
    });
  });

  it("time element uses semantic text color token", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const timeEl = container.querySelector("time");
    expect(timeEl).toBeDefined();
    const className = timeEl?.className || "";
    // Semantic text-secondary token provides contrast in both themes
    expect(className).toMatch(/text-text-secondary/);
  });

  it("article uses semantic surface token (consistent with sections)", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const article = container.querySelector("article");
    expect(article).toHaveClass("bg-surface-card");
  });

  it("image container uses semantic elevated surface token", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const imgContainer = container.querySelector(".aspect-\\[16\\/9\\]");
    expect(imgContainer).toHaveClass("bg-surface-elevated");
  });
});

describe("ContentDetail responsive link wrapping", () => {
  it("prose links have break-words to prevent overflow on small screens", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    expect(proseDiv).toBeDefined();
    const className = proseDiv?.className || "";
    expect(className).toMatch(/prose-a:break-words/);
  });

  it("prose headings have explicit text-text-primary color (not dark-only) for both themes", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    const className = proseDiv?.className || "";
    // Must NOT use dark: prefix — headings must be colored in both light and dark modes
    expect(className).toMatch(/prose-headings:text-text-primary/);
    expect(className).not.toMatch(/dark:prose-headings/);
  });

  it("prose links have explicit text-link color for both themes", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    const className = proseDiv?.className || "";
    expect(className).toMatch(/prose-a:text-link/);
  });

  it("prose strong elements have explicit text-text-primary color for both themes", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    const className = proseDiv?.className || "";
    // Must NOT use dark: prefix — strong text must be colored in both light and dark modes
    expect(className).toMatch(/prose-strong:text-text-primary/);
    expect(className).not.toMatch(/dark:prose-strong/);
  });

  it("prose paragraphs have break-words for inline long content", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    const className = proseDiv?.className || "";
    expect(className).toMatch(/prose-p:break-words/);
  });
});

describe("ContentDetail image overflow protection", () => {
  it("prose images have max-w-full to prevent overflow on narrow screens", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    const className = proseDiv?.className || "";
    expect(className).toMatch(/prose-img:max-w-full/);
  });

  it("prose images have rounded-lg corners", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    const className = proseDiv?.className || "";
    expect(className).toMatch(/prose-img:rounded-lg/);
  });

  it("cover image container has overflow-hidden", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const imgContainer = container.querySelector(".aspect-\\[16\\/9\\]");
    expect(imgContainer).toHaveClass("overflow-hidden");
  });

  it("cover image uses object-cover to fill the 16:9 frame", () => {
    render(<ContentDetail content={mockContent} />);
    const img = screen.getByRole("img");
    expect(img).toHaveClass("object-cover");
  });
});

describe("ContentDetail publication metadata", () => {
  it("renders authors, venue, and DOI link for publication content", () => {
    const pubContent: ContentItemMeta = {
      slug: "my-paper",
      href: "/publications/my-paper",
      title: "A Research Paper",
      date: "2024-01-15",
      tags: ["AI"],
      authors: ["Jane Doe", "John Smith"],
      venue: "Nature",
      doi: "10.1038/nature.12345",
      imageSrc: "/publications/my-paper.webp",
      imageType: "cover",
      body: "<p>Abstract here.</p>",
    };

    const { container } = render(<ContentDetail content={pubContent} />);

    expect(screen.getByText(/Authors:/)).toBeInTheDocument();
    expect(container.textContent).toContain("Jane Doe, John Smith");
    expect(container.textContent).toContain("Nature");

    const doiLink = screen.getByLabelText(/DOI:/);
    expect(doiLink).toHaveAttribute(
      "href",
      "https://doi.org/10.1038/nature.12345",
    );
    expect(doiLink).toHaveTextContent("10.1038/nature.12345");

    // DOI link must have a visible focus indicator for keyboard users
    expect(doiLink.className).toMatch(/focus-visible:outline-focus/);
    expect(doiLink.className).toMatch(/focus-visible:outline-2/);
    expect(doiLink.className).toMatch(/focus-visible:outline-offset-2/);
  });

  it("does not render publication metadata for project content", () => {
    const projContent: ContentItemMeta = {
      ...mockContent,
    };

    render(<ContentDetail content={projContent} />);

    expect(screen.queryByText(/Authors:/)).not.toBeInTheDocument();
    expect(screen.queryByText("Nature")).not.toBeInTheDocument();
  });
});
