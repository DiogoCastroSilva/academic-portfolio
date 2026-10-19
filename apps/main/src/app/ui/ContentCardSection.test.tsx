/** @vitest-environment happy-dom */
import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@katie-portfolio/utils/test-helpers/a11y";
import type { ContentMeta } from "@katie-portfolio/content";

import { ContentCardSection } from "./ContentCardSection.js";

const mockItems: ContentMeta[] = [
  {
    slug: "project-1",
    title: "Project One",
    date: "2024-01-15",
    tags: ["TypeScript", "React"],
    excerpt: "A description of project one.",
    imageSrc: "/projects/project-1.webp",
  },
  {
    slug: "project-2",
    title: "Project Two",
    date: "2024-02-20",
    tags: ["Next.js", "Tailwind"],
    imageSrc: "/projects/project-2.webp",
  },
];

describe("ContentCardSection accessibility", () => {
  it("has no accessibility violations with items", async () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with empty items", async () => {
    const { container } = render(
      <ContentCardSection
        heading="No Projects"
        headingId="no-projects-heading"
        items={[]}
        hrefPrefix="/projects"
      />,
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with custom empty message", async () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={[]}
        hrefPrefix="/projects"
        emptyMessage="No projects available yet."
      />,
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with tags limit", async () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
        tagsLimit={1}
      />,
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with item limit", async () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
        limit={1}
      />,
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with 'View all' link", async () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
        viewAllHref="/projects"
        viewAllLabel="View all projects"
      />,
    );
    await expectNoA11yViolations(container);
  });

  it("section has heading with text content", () => {
    render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );

    const heading = screen.getByText("Projects");
    const section = heading.closest("section");
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe("SECTION");
  });

  it("links have descriptive aria-label", () => {
    render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );

    const firstLink = screen.getByText("Project One").closest("a");
    expect(firstLink).toHaveAttribute("aria-label", "Read more: Project One");

    const secondLink = screen.getByText("Project Two").closest("a");
    expect(secondLink).toHaveAttribute("aria-label", "Read more: Project Two");
  });

  it("renders a 'View all' link when viewAllHref is provided", () => {
    render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
        viewAllHref="/projects"
        viewAllLabel="View all projects"
      />,
    );

    const link = screen.getByRole("link", { name: "View all projects" });
    expect(link).toHaveAttribute("href", "/projects");
  });

  it("does not render a 'View all' link when viewAllHref is omitted", () => {
    render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );

    expect(screen.queryByRole("link", { name: /view all/i })).toBeNull();
  });

  it("applies limit to the number of visible items", () => {
    const manyItems: ContentMeta[] = Array.from({ length: 8 }, (_, i) => ({
      slug: `item-${i}`,
      href: `/projects/item-${i}`,
      title: `Item ${i}`,
      date: "2024-01-15",
      tags: [],
      imageSrc: "/projects/placeholder.svg",
      imageType: "placeholder" as const,
    }));

    render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={manyItems}
        hrefPrefix="/projects"
        limit={3}
      />,
    );

    // The component should render exactly 3 article cards (the limit).
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(3);
    expect(screen.getByText("Item 0")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.queryByText("Item 3")).toBeNull();
  });

  it("renders all items when limit is not provided (no truncation)", () => {
    const manyItems: ContentMeta[] = Array.from({ length: 8 }, (_, i) => ({
      slug: `item-${i}`,
      href: `/projects/item-${i}`,
      title: `Item ${i}`,
      date: "2024-01-15",
      tags: [],
      imageSrc: "/projects/placeholder.svg",
      imageType: "placeholder" as const,
    }));

    render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={manyItems}
        hrefPrefix="/projects"
      />,
    );

    // Without a limit, ALL items should be visible.
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(8);
    expect(screen.getByText("Item 7")).toBeInTheDocument();
  });
});
