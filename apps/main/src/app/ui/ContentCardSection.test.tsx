/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";

import type { ContentMeta } from "@katie-portfolio/content";

import { ContentCardSection } from "./ContentCardSection.js";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock next/link for happy-dom environment
vi.mock("next/link", () => ({
  default: function MockLink({
    children,
    href,
    "aria-label": ariaLabel,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    "aria-label"?: string;
    className?: string;
    onClick?: () => void;
  }) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  },
}));

// Helper to assert no accessibility violations
function expectNoViolations(results: { violations: unknown[] }) {
  expect(results.violations).toHaveLength(0);
}

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
    const results = await axe(container);
    expectNoViolations(results);
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
    const results = await axe(container);
    expectNoViolations(results);
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
    const results = await axe(container);
    expectNoViolations(results);
  });

  it("has no accessibility violations with tags limit applied", async () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
        tagsLimit={1}
      />,
    );
    const results = await axe(container);
    expectNoViolations(results);
  });

  it("has no accessibility violations with item limit applied", async () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
        limit={1}
      />,
    );
    const results = await axe(container);
    expectNoViolations(results);
  });

  it("section has correct aria-labelledby relationship", () => {
    render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );

    const section = screen.getByRole("region");
    expect(section).toHaveAttribute("aria-labelledby", "projects-heading");
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

    const firstLink = screen.getByLabelText("Read more: Project One");
    expect(firstLink).toBeInTheDocument();

    const secondLink = screen.getByLabelText("Read more: Project Two");
    expect(secondLink).toBeInTheDocument();
  });
});
