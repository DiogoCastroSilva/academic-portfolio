/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@katie-portfolio/utils/test-helpers/a11y";
import type { ContentMeta } from "@katie-portfolio/content";

import { ContentCardSection } from "./ContentCardSection.js";

// Mock next/link for happy-dom environment
vi.mock("next/link", () => ({
  default: function MockLink({
    children,
    href,
    className,
    onClick,
    "aria-current": ariaCurrent,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: () => void;
    "aria-current"?: string;
    "aria-label"?: string;
  }) {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        aria-current={ariaCurrent}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  },
}));

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
});
