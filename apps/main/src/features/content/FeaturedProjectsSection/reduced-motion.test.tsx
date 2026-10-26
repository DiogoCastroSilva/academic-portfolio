/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FeaturedProjectsSection } from "./FeaturedProjectsSection.js";
import type { ContentMeta } from "@academic-portfolio/content";

// Mock useReducedMotion to return true, simulating a user who prefers
// reduced motion. This verifies the shouldReduceMotion path in
// FeaturedProjectsSection — motion elements become plain HTML elements.
vi.mock("motion/react", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

const mockItems: ContentMeta[] = [
  {
    slug: "lead-project",
    href: "/projects/lead-project",
    title: "Lead Project",
    date: "2024-06-15",
    tags: ["research"],
    excerpt: "An important project.",
    imageSrc: "/projects/lead-project/cover.webp",
    imageType: "cover",
    selected: true,
  },
  {
    slug: "supporting-project",
    href: "/projects/supporting-project",
    title: "Supporting Project",
    date: "2023-09-01",
    tags: ["analysis"],
    excerpt: "A companion project.",
    imageSrc: "/projects/supporting-project/cover.webp",
    imageType: "cover",
    selected: true,
  },
];

describe("FeaturedProjectsSection reduced-motion", () => {
  it("renders articles as plain HTML elements without Motion opacity styles", () => {
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const article = container.querySelector("article");
    expect(article).not.toBeNull();
    expect(article).not.toHaveStyle({ opacity: 0 });
    expect(article?.tagName).toBe("ARTICLE");
  });

  it("retains motion-item-initial class but CSS keeps it visible under reduced motion", () => {
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const section = container.querySelector("section");
    expect(section).toHaveClass("motion-item-initial");
    expect(section).not.toHaveStyle({ opacity: 0 });
  });

  it("renders content immediately without waiting for viewport trigger", () => {
    render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    expect(screen.getByText("Lead Project")).toBeInTheDocument();
    expect(screen.getByText("Supporting Project")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("renders heading as a semantic element", () => {
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const heading = container.querySelector("h2");
    expect(heading).toHaveTextContent("Featured");
    expect(heading).toHaveAttribute("id", "featured-projects-heading");
  });

  it("renders links to project detail pages", () => {
    render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    expect(screen.getByLabelText("View project: Lead Project")).toHaveAttribute(
      "href",
      "/projects/lead-project/",
    );
    expect(
      screen.getByLabelText("View project: Supporting Project"),
    ).toHaveAttribute("href", "/projects/supporting-project/");
  });

  it("returns null when items is empty even with reduced motion", () => {
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[]}
        hrefPrefix="/projects"
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
