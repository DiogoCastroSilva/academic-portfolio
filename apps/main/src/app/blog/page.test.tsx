/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ContentMeta } from "@katie-portfolio/content";

const mockBlogPosts: ContentMeta[] = [
  {
    slug: "understanding-satellite-data",
    href: "/blog/understanding-satellite-data",
    title: "Understanding Satellite Data for Vegetation Monitoring",
    date: "2025-03-15",
    tags: ["remote-sensing", "vegetation-indices"],
    excerpt:
      "A beginner-friendly guide to satellite-derived vegetation indices.",
    imageSrc: "/blog/understanding-satellite-data/ndvi-map.svg",
    imageType: "cover",
  },
];

vi.mock("@katie-portfolio/blog", () => ({
  getAllBlogPosts: () => mockBlogPosts,
  getBlogPostContentBySlug: vi.fn(),
}));

vi.mock("@katie-portfolio/navigation", () => ({
  NavBar: () => null,
}));

vi.mock("../configs/site-config", () => ({
  siteConfig: {
    name: "Kathleen Miller",
    deploymentUrl: undefined,
    analytics: { cloudflare: { token: "test", enabled: false } },
  },
}));

type CardSectionProps = {
  heading: string;
  items: ContentMeta[];
};

vi.mock("../ui/ContentCardSection", () => ({
  ContentCardSection: ({ heading, items }: CardSectionProps) => (
    <section data-testid="card-section">
      <h2>{heading}</h2>
      {items.length === 0 ? (
        <p>No items to display at this time.</p>
      ) : (
        items.map((item: ContentMeta) => (
          <article key={item.slug}>{item.title}</article>
        ))
      )}
    </section>
  ),
}));

vi.mock("../lib/og-image", () => ({
  ogImageRef: (path: string) => `/og/${path}`,
}));

// Import after mocks
import BlogPage from "./page";

describe("BlogPage", () => {
  it("renders blog listing heading", () => {
    const { container } = render(<BlogPage />);
    const heading = container.querySelector("h2");
    expect(heading).toHaveTextContent("Blog");
  });

  it("renders one article per blog post", () => {
    const { container } = render(<BlogPage />);
    const articles = container.querySelectorAll("article");
    expect(articles).toHaveLength(1);
  });

  it("shows post title in the card", () => {
    const { container } = render(<BlogPage />);
    const article = container.querySelector("article");
    expect(article?.textContent).toContain(
      "Understanding Satellite Data for Vegetation Monitoring",
    );
  });
});
