/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ContentCardSection } from "./ContentCardSection.js";
import type { ContentMeta } from "@academic-portfolio/content";

// Mock useReducedMotion to return true, simulating a user who prefers
// reduced motion. This verifies the shouldReduceMotion path in
// ContentCardSection — motion elements become plain HTML elements.
vi.mock("motion/react", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

const mockItems: ContentMeta[] = [
  {
    slug: "project-1",
    title: "Project One",
    date: "2024-01-15",
    tags: ["TypeScript"],
    excerpt: "A description of project one.",
    imageSrc: "/projects/project-1.webp",
    href: "",
    imageType: "cover",
  },
  {
    slug: "project-2",
    title: "Project Two",
    date: "2024-02-20",
    tags: ["React"],
    imageSrc: "/projects/project-2.webp",
    href: "",
    imageType: "cover",
  },
];

describe("ContentCardSection reduced-motion", () => {
  it("renders articles as plain HTML elements without Motion opacity styles", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const article = container.querySelector("article");
    expect(article).not.toBeNull();
    // Articles should not have hidden opacity or transform styles
    expect(article).not.toHaveStyle({ opacity: 0 });
    expect(article).not.toHaveAttribute("data-framer");
    // Articles use plain HTML elements (no Motion component markers)
    expect(article?.tagName).toBe("ARTICLE");
  });

  it("retains motion-item-initial class but CSS keeps it visible under reduced motion", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const article = container.querySelector("article");
    // The class is present (CSS @media override handles visibility)
    expect(article).toHaveClass("motion-item-initial");
    // But no inline opacity-0 from Motion
    expect(article).not.toHaveStyle({ opacity: 0 });
  });

  it("renders content immediately without waiting for viewport trigger", () => {
    render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    expect(screen.getByText("Project One")).toBeInTheDocument();
    expect(screen.getByText("Project Two")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("renders heading as a semantic element", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const heading = container.querySelector("h2");
    expect(heading).toHaveTextContent("Projects");
  });

  it("renders view-all link", () => {
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
    expect(
      screen.getByRole("link", { name: "View all projects" }),
    ).toBeInTheDocument();
  });
});
