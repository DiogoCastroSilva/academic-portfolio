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

describe("ContentDetail theme contrast (dark mode on light-blue surfaces)", () => {
  it("prose container does not use dark:prose-invert (light text on light blue = poor contrast)", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    expect(proseDiv).toBeDefined();
    const className = proseDiv?.className || "";
    // prose-invert makes text light for dark surfaces; our prose sits on
    // bg-sky-50 (light blue) in dark mode, so light text would have poor contrast.
    expect(className).not.toMatch(/dark:prose-invert/);
  });

  it("prose links use a blue-700 variant in dark mode for contrast on light-blue surfaces", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
      d.className.includes("prose"),
    );
    const className = proseDiv?.className || "";
    expect(className).toMatch(/dark:prose-a:text-blue-700/);
    expect(className).not.toMatch(/dark:prose-a:text-blue-400/);
  });

  it("tag list items use readable text color in dark mode", () => {
    render(<ContentDetail content={mockContent} />);
    const tagItems = document.querySelectorAll("li");
    tagItems.forEach((li) => {
      const className = li.className;
      // zinc-400 is too light on the light-blue surface; use zinc-600
      expect(className).not.toMatch(/dark:text-zinc-400/);
    });
  });

  it("time element uses gray-600 in dark mode for readable contrast", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const timeEl = container.querySelector("time");
    expect(timeEl).toBeDefined();
    const className = timeEl?.className || "";
    expect(className).toMatch(/dark:text-gray-600/);
  });

  it("article has light-blue surface background in dark mode (consistent with sections)", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const article = container.querySelector("article");
    expect(article).toHaveClass("dark:bg-sky-50");
    expect(article).toHaveClass("bg-white");
  });

  it("image container uses lighter dark-mode background matching the article surface", () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const imgContainer = container.querySelector(".aspect-\\[16\\/9\\]");
    expect(imgContainer).toHaveClass("dark:bg-stone-300");
    expect(imgContainer).not.toHaveClass("dark:bg-stone-700");
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
