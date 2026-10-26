/** @vitest-environment happy-dom */
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ContentMeta } from "@academic-portfolio/content";
import { expectNoA11yViolations } from "@academic-portfolio/utils/test-helpers/a11y";

import { PublicationRowSection } from "./PublicationRowSection.js";

const mockItems: ContentMeta[] = [
  {
    slug: "paper-1",
    title: "Neural Methods for Vegetation Analysis",
    date: "2024-06-15",
    tags: ["Remote Sensing", "Machine Learning", "Ecology"],
    authors: ["Jane Doe", "John Smith"],
    venue: "Journal of Environmental Science",
    doi: "10.1000/jes.2024.06",
    paperUrl: "https://example.com/paper1",
    excerpt:
      "We present novel methods for vegetation analysis using neural networks.",
    imageSrc: "/publications/paper-1/cover.webp",
    imageType: "cover",
    href: "/publications/paper-1",
  },
  {
    slug: "paper-2",
    title: "Urban Heat Island Dynamics",
    date: "2023-09-01",
    tags: ["Climatology"],
    venue: "Nature Climate Change",
    excerpt: "An analysis of urban heat patterns.",
    imageSrc: "/publications/placeholder.svg",
    imageType: "placeholder",
    href: "/publications/paper-2",
  },
];

describe("PublicationRowSection accessibility", () => {
  it("has no accessibility violations with items", async () => {
    const { container } = render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with empty items", async () => {
    const { container } = render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={[]}
        hrefPrefix="/publications"
        emptyMessage="No publications yet."
      />,
    );
    await expectNoA11yViolations(container);
  });
});

describe("PublicationRowSection rendering", () => {
  it("renders heading with correct text and id", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Publications");
    expect(heading).toHaveAttribute("id", "publications-heading");
  });

  it("renders heading as h1 when headingLevel is h1", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        headingLevel="h1"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Publications");
  });

  it("renders publication titles", () => {
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
    expect(screen.getByText("Urban Heat Island Dynamics")).toBeInTheDocument();
  });

  it("renders authors and venue", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    expect(
      screen.getByText(
        "Jane Doe, John Smith · Journal of Environmental Science",
      ),
    ).toBeInTheDocument();
  });

  it("renders venue only when no authors", () => {
    const items: ContentMeta[] = [
      { ...mockItems[0], authors: undefined, venue: "ACM Conference" },
    ];
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={items}
        hrefPrefix="/publications"
      />,
    );
    expect(screen.getByText("ACM Conference")).toBeInTheDocument();
  });

  it("renders year from date", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    const times = screen.getAllByRole("time");
    expect(times[0]).toHaveTextContent("2024");
    expect(times[1]).toHaveTextContent("2023");
  });

  it("renders excerpt when present", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    expect(
      screen.getByText(
        "We present novel methods for vegetation analysis using neural networks.",
      ),
    ).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    expect(screen.getByText("Remote Sensing")).toBeInTheDocument();
    expect(screen.getByText("Machine Learning")).toBeInTheDocument();
  });

  it("renders View all link", () => {
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

  it("renders empty state when no items", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={[]}
        hrefPrefix="/publications"
        emptyMessage="No publications yet."
      />,
    );
    expect(screen.getByText("No publications yet.")).toBeInTheDocument();
  });

  it("does not render view-all link when items are empty", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={[]}
        hrefPrefix="/publications"
        emptyMessage="No publications yet."
        viewAllHref="/publications"
        viewAllLabel="View all publications"
      />,
    );
    expect(
      screen.queryByRole("link", { name: "View all publications" }),
    ).not.toBeInTheDocument();
  });

  it("renders links to publication detail pages", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    const links = screen.getAllByRole("link", { name: /Read more:/ });
    expect(links[0]).toHaveAttribute("href", "/publications/paper-1/");
    expect(links[1]).toHaveAttribute("href", "/publications/paper-2/");
  });

  it("renders DOI link", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    const doiLink = screen.getByRole("link", {
      name: "DOI: 10.1000/jes.2024.06",
    });
    expect(doiLink).toHaveAttribute(
      "href",
      "https://doi.org/10.1000/jes.2024.06",
    );
  });

  it("renders paper link with new-tab behavior", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    const pdfLink = screen.getByRole("link", { name: "Link to paper" });
    expect(pdfLink).toHaveAttribute("href", "https://example.com/paper1");
    expect(pdfLink).toHaveAttribute("target", "_blank");
    expect(pdfLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders featured badge for selected publications", () => {
    const items: ContentMeta[] = [{ ...mockItems[0], selected: true }];
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={items}
        hrefPrefix="/publications"
      />,
    );
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("does not render featured badge for unselected publications", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    expect(screen.queryByText("Featured")).not.toBeInTheDocument();
  });

  it("does not render thumbnail when imageType is placeholder", () => {
    const { container } = render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    const articles = container.querySelectorAll("article");
    // Second item has placeholder image — no img element should be rendered
    const imgElements = articles[1].querySelectorAll("img");
    expect(imgElements.length).toBe(0);
  });

  it("respects limit prop", () => {
    render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
        limit={1}
      />,
    );
    expect(
      screen.getByText("Neural Methods for Vegetation Analysis"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Urban Heat Island Dynamics"),
    ).not.toBeInTheDocument();
  });
});

describe("PublicationRowSection progressive enhancement", () => {
  it("applies motion-item-initial class to article elements for no-JS fallback", () => {
    const { container } = render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    const articles = container.querySelectorAll("article");
    expect(articles.length).toBe(2);
    articles.forEach((article) => {
      expect(article).toHaveClass("motion-item-initial");
    });
  });

  it("does not apply inline opacity-0 styles from Motion initial state", () => {
    const { container } = render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    const articles = container.querySelectorAll("article");
    articles.forEach((article) => {
      expect(article).not.toHaveStyle({ opacity: "0" });
      expect(article).not.toHaveStyle({ opacity: 0 });
    });
  });

  it("renders view-all link with motion-item-initial class", () => {
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
    const link = screen.getByText("View all publications");
    expect(link).toBeInTheDocument();
    // The parent div should have motion-item-initial class
    const parentDiv = link.closest("div");
    expect(parentDiv).toHaveClass("motion-item-initial");
  });

  it("child Motion elements do not have inline opacity-0 from missing initial={false}", () => {
    const { container } = render(
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={mockItems}
        hrefPrefix="/publications"
      />,
    );
    // Heading and articles are children with variants applied.
    // Without initial={false}, Motion would inject inline opacity-0 in SSR.
    const heading = container.querySelector("h2");
    expect(heading).not.toHaveStyle({ opacity: "0" });

    const article = container.querySelector("article");
    expect(article).not.toHaveStyle({ opacity: "0" });
  });
});
