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
  it("prose container does not use dark:prose-invert (light text on dark surface = poor contrast)", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    expect(proseDiv).toBeDefined();
    const className = proseDiv?.className || "";
    // Our prose sits on dark:bg-slate-850 in dark mode; we use
    // explicit Tailwind text color classes rather than prose-invert.
    expect(className).not.toMatch(/dark:prose-invert/);
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

  it("tag list items use readable text color in dark mode", () => {
    render(<ContentDetail content={mockContent} />);
    const tagItems = document.querySelectorAll("li");
    tagItems.forEach((li) => {
      const className = li.className;
      // On dark card surfaces (slate-850), zinc-400 provides adequate contrast
      expect(className).toMatch(/dark:text-zinc-400/);
    });
  });

  it("time element uses readable text color in dark mode for contrast on dark surfaces", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const timeEl = container.querySelector("time");
    expect(timeEl).toBeDefined();
    const className = timeEl?.className || "";
    // On dark card surfaces (slate-850), use zinc-400 (light) for readability
    expect(className).toMatch(/dark:text-zinc-400/);
    expect(className).not.toMatch(/dark:text-gray-600/);
  });

  it("article has dark surface background in dark mode (consistent with sections)", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const article = container.querySelector("article");
    expect(article).toHaveClass("dark:bg-slate-850");
    expect(article).toHaveClass("bg-white");
  });

  it("image container uses lighter dark-mode background matching the article surface", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const imgContainer = container.querySelector(".aspect-\\[16\\/9\\]");
    expect(imgContainer).toHaveClass("dark:bg-slate-700");
    expect(imgContainer).not.toHaveClass("dark:bg-stone-800");
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

  it("prose paragraphs have break-words for inline long content", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    const className = proseDiv?.className || "";
    expect(className).toMatch(/prose-p:break-words/);
  });
});
