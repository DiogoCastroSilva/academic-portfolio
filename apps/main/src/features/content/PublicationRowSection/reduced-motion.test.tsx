/** @vitest-environment happy-dom */
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ContentMeta } from "@academic-portfolio/content";
import { PublicationRowSection } from "./PublicationRowSection.js";

// Mock useReducedMotion to return true, simulating a user who prefers
// reduced motion. This verifies the shouldReduceMotion path —
// motion elements become plain HTML elements.
vi.mock("motion/react", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

const mockItems: ContentMeta[] = [
  {
    slug: "paper-1",
    title: "Neural Methods for Vegetation Analysis",
    date: "2024-06-15",
    tags: ["Remote Sensing"],
    authors: ["Jane Doe"],
    venue: "Journal of Environmental Science",
    imageSrc: "/publications/paper-1/cover.webp",
    imageType: "cover",
    href: "/publications/paper-1",
  },
];

describe("PublicationRowSection reduced-motion", () => {
  it("renders articles as plain HTML elements without Motion opacity styles", () => {
    const { container } = render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    const article = container.querySelector("article");
    expect(article).not.toBeNull();
    expect(article).not.toHaveStyle({ opacity: 0 });
    expect(article).not.toHaveAttribute("data-framer");
  });

  it("retains motion-item-initial class but CSS keeps it visible under reduced motion", () => {
    const { container } = render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
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
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    expect(
      screen.getByText("Neural Methods for Vegetation Analysis"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
  });

  it("renders heading as a semantic element", () => {
    const { container } = render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    const heading = container.querySelector("h2");
    expect(heading).toHaveTextContent("Publications");
  });

  it("renders view-all link", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
        viewAllHref="/publications"
        viewAllLabel="View all publications"
      />,
    );
    expect(
      screen.getByRole("link", { name: "View all publications" }),
    ).toBeInTheDocument();
  });
});
