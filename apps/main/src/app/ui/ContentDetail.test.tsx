/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";

import type { ContentItemMeta } from "@katie-portfolio/content";

import { ContentDetail } from "./ContentDetail.js";

// Helper to assert no accessibility violations
function expectNoViolations(results: { violations: unknown[] }) {
  expect(results.violations).toHaveLength(0);
}

const mockContent: ContentItemMeta = {
  slug: "my-project",
  title: "My Project Title",
  date: "2024-01-15",
  tags: ["TypeScript", "React"],
  excerpt: "A brief description.",
  imageSrc: "/projects/my-project.webp",
  body: "<p>This is the project content.</p>",
};

describe("ContentDetail accessibility", () => {
  it("has no accessibility violations with standard content", async () => {
    const { container } = render(<ContentDetail content={mockContent} />);
    const results = await axe(container);
    expectNoViolations(results);
  });

  it("has no violations with content that has no tags", async () => {
    const content: ContentItemMeta = {
      ...mockContent,
      tags: undefined,
    };
    const { container } = render(<ContentDetail content={content} />);
    const results = await axe(container);
    expectNoViolations(results);
  });

  it("has no violations with content that has no excerpt", async () => {
    const content: ContentItemMeta = {
      ...mockContent,
      excerpt: undefined,
    };
    const { container } = render(<ContentDetail content={content} />);
    const results = await axe(container);
    expectNoViolations(results);
  });

  it("has no violations with empty body", async () => {
    const content: ContentItemMeta = {
      ...mockContent,
      body: "",
    };
    const { container } = render(<ContentDetail content={content} />);
    const results = await axe(container);
    expectNoViolations(results);
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
    const results = await axe(container);
    expectNoViolations(results);
  });

  it("uses h1 for the content title", () => {
    render(<ContentDetail content={mockContent} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(mockContent.title);
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
