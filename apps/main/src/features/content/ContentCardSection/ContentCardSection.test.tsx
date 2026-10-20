/** @vitest-environment happy-dom */
import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@academic-portfolio/utils/test-helpers/a11y";
import type { ContentMeta } from "@academic-portfolio/content";

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

describe("ContentCardSection heading hierarchy", () => {
  const items: ContentMeta[] = [
    {
      slug: "test",
      title: "Test",
      date: "2024-01-15",
      tags: [],
      imageSrc: "/placeholder.svg",
    },
  ];

  it("defaults heading to h2", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={items}
        hrefPrefix="/projects"
      />,
    );
    const heading = container.querySelector("h2");
    expect(heading).toHaveTextContent("Projects");
    expect(container.querySelector("h1")).toBeNull();
  });

  it('renders heading as h1 when headingLevel prop is "h1"', () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        headingLevel="h1"
        items={items}
        hrefPrefix="/projects"
      />,
    );
    const heading = container.querySelector("h1");
    expect(heading).toHaveTextContent("Projects");
    expect(container.querySelector("h2")).toBeNull();
  });

  it('renders heading as h2 when headingLevel prop is "h2"', () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        headingLevel="h2"
        items={items}
        hrefPrefix="/projects"
      />,
    );
    expect(container.querySelector("h2")).toHaveTextContent("Projects");
    expect(container.querySelector("h1")).toBeNull();
  });

  it("card titles are h3 (one level below heading)", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={items}
        hrefPrefix="/projects"
      />,
    );
    expect(container.querySelector("h3")).toHaveTextContent("Test");
  });
});

describe("ContentCardSection empty state", () => {
  it("renders an icon alongside the empty message", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={[]}
        hrefPrefix="/projects"
        emptyMessage="No projects yet."
      />,
    );
    // An inline SVG icon should be present in the empty state
    const emptyIcon = container.querySelector("svg");
    expect(emptyIcon).toBeInTheDocument();
    expect(emptyIcon).toHaveAttribute("aria-hidden", "true");
  });

  it("centers the empty state content vertically and horizontally", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={[]}
        hrefPrefix="/projects"
        emptyMessage="No projects yet."
      />,
    );
    const emptyDiv = container.querySelector(".flex-col.items-center");
    expect(emptyDiv).toBeInTheDocument();
    expect(emptyDiv).toHaveClass("justify-center");
    expect(emptyDiv).toHaveClass("text-center");
  });
});

describe("ContentCardSection dark-mode surface consistency", () => {
  it("card surfaces use dark:bg-sky-50 (light surface) matching the section in dark mode", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const article = container.querySelector("article");
    expect(article).toHaveClass("dark:bg-sky-50");
    // Must NOT use a dark card background that would clash with light section
    expect(article).not.toHaveClass("dark:bg-stone-700");
  });

  it("card borders are visible in dark mode", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const article = container.querySelector("article");
    expect(article).toHaveClass("dark:border-zinc-300");
  });

  it("section has explicit bg-white in light mode for consistent surfaces", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const section = container.querySelector("section");
    expect(section).toHaveClass("bg-white");
  });
});

describe("ContentCardSection reduced-motion compliance", () => {
  it("articles include motion-reduce:animate-none class to respect prefers-reduced-motion", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const article = container.querySelector("article");
    expect(article).toHaveClass("motion-reduce:animate-none");
    expect(article).toHaveClass("animate-fadeInUp");
  });
});
describe("ContentCardSection tag overflow", () => {
  it("shows a +N more indicator when tags exceed tagsLimit", () => {
    const items: ContentMeta[] = [
      {
        slug: "project-1",
        title: "Project One",
        date: "2024-01-15",
        tags: ["TypeScript", "React", "Next.js", "Tailwind"],
        excerpt: "A description.",
        imageSrc: "/projects/project-1.webp",
      },
    ];

    render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={items}
        hrefPrefix="/projects"
        tagsLimit={2}
      />,
    );

    // Should show first 2 tags
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();

    // Should show the "+2 more" indicator
    const moreIndicator = screen.getByText("+2 more");
    expect(moreIndicator).toBeInTheDocument();
    expect(moreIndicator).toHaveAttribute("aria-label", "2 more tags");
  });

  it("does not show a +N indicator when tags fit within tagsLimit", () => {
    const items: ContentMeta[] = [
      {
        slug: "project-1",
        title: "Project One",
        date: "2024-01-15",
        tags: ["TypeScript", "React"],
        excerpt: "A description.",
        imageSrc: "/projects/project-1.webp",
      },
    ];

    render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={items}
        hrefPrefix="/projects"
        tagsLimit={2}
      />,
    );

    expect(screen.queryByText("+2 more")).not.toBeInTheDocument();
  });
});

describe("ContentCardSection responsive spacing", () => {
  it("uses responsive padding (p-6 on mobile, larger on desktop)", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const section = container.querySelector("section");
    expect(section).toHaveClass("p-6");
    expect(section).toHaveClass("sm:p-10");
    expect(section).toHaveClass("lg:p-12");
  });
});

describe("ContentCardSection flex min-width prevents overflow", () => {
  it("time/tags flex row has min-w-0 to allow wrapping", () => {
    const { container } = render(
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={mockItems}
        hrefPrefix="/projects"
      />,
    );
    const flexRow = container.querySelector(".flex.min-w-0");
    expect(flexRow).toBeInTheDocument();
  });
});
