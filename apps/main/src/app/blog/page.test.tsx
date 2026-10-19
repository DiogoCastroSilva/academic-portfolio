/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContentMeta } from "@katie-portfolio/content";
import { PAGE_SIZE } from "../lib/pagination.js";

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
  NavBar: ({ items }: { items?: { name: string; href: string }[] }) => (
    <nav
      data-testid="navbar"
      data-has-blog={items?.some((i) => i.name === "Blog")}
    >
      {items?.map((i) => (
        <a key={i.name} href={i.href}>
          {i.name}
        </a>
      ))}
    </nav>
  ),
}));

vi.mock("../configs/site-config", () => ({
  siteConfig: {
    name: "Kathleen Miller",
    deploymentUrl: undefined,
    analytics: { cloudflare: { token: "test", enabled: false } },
  },
}));

vi.mock("../ui/Pagination", () => ({
  Pagination: ({
    currentPage,
    totalPages,
  }: {
    currentPage: number;
    totalPages: number;
  }) =>
    totalPages <= 1 ? null : (
      <nav
        data-testid="pagination"
        data-current={currentPage}
        data-total={totalPages}
      >
        Pagination
      </nav>
    ),
}));

vi.mock("../lib/og-image", () => ({
  ogImageRef: (path: string) => `/og/${path}`,
}));

// Import after mocks
import BlogPage from "./page";

describe("BlogPage", () => {
  it("renders blog listing heading as h1 (page-level title)", () => {
    const { container } = render(<BlogPage />);
    const heading = container.querySelector("h1");
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

  it("does not render pagination nav when collection fits on one page", () => {
    render(<BlogPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("renders pagination with correct props when multiple pages", () => {
    mockBlogPosts.length = 0;
    mockBlogPosts.push(...buildMockBlogPosts(PAGE_SIZE + 1));
    render(<BlogPage />);
    const pagination = screen.getByTestId("pagination");
    expect(pagination).toHaveAttribute("data-current", "1");
    expect(pagination).toHaveAttribute("data-total", "2");
  });
});

/** Build N mock blog posts with deterministic titles for pagination tests. */
function buildMockBlogPosts(n: number): ContentMeta[] {
  return Array.from({ length: n }, (_, i) => ({
    slug: `post-${i}`,
    href: `/blog/post-${i}`,
    title: `Test Post ${i}`,
    date: "2025-01-01",
    tags: ["test"],
    excerpt: `Description for post ${i}.`,
    imageSrc: "/blog/placeholder.svg",
    imageType: "cover" as const,
  }));
}

describe("BlogPage multi-item pagination", () => {
  afterEach(() => {
    mockBlogPosts.length = 0;
    mockBlogPosts.push({
      slug: "understanding-satellite-data",
      href: "/blog/understanding-satellite-data",
      title: "Understanding Satellite Data for Vegetation Monitoring",
      date: "2025-03-15",
      tags: ["remote-sensing", "vegetation-indices"],
      excerpt:
        "A beginner-friendly guide to satellite-derived vegetation indices.",
      imageSrc: "/blog/understanding-satellite-data/ndvi-map.svg",
      imageType: "cover",
    });
  });

  it("shows 1 page for 0 items", () => {
    mockBlogPosts.length = 0;
    render(<BlogPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("shows 1 page for 1 item", () => {
    render(<BlogPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("shows 1 page for exactly PAGE_SIZE items", () => {
    mockBlogPosts.length = 0;
    mockBlogPosts.push(...buildMockBlogPosts(PAGE_SIZE));
    render(<BlogPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("shows 2 pages for PAGE_SIZE + 1 items", () => {
    mockBlogPosts.length = 0;
    mockBlogPosts.push(...buildMockBlogPosts(PAGE_SIZE + 1));
    render(<BlogPage />);
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-total", "2");
  });

  it("shows 2 pages for 2 × PAGE_SIZE items", () => {
    mockBlogPosts.length = 0;
    mockBlogPosts.push(...buildMockBlogPosts(PAGE_SIZE * 2));
    render(<BlogPage />);
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-total", "2");
  });

  it("shows 3 pages for 2 × PAGE_SIZE + 1 items", () => {
    mockBlogPosts.length = 0;
    mockBlogPosts.push(...buildMockBlogPosts(PAGE_SIZE * 2 + 1));
    render(<BlogPage />);
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-total", "3");
  });

  it("renders no pagination controls when totalPages is 1", () => {
    mockBlogPosts.length = 0;
    mockBlogPosts.push(...buildMockBlogPosts(PAGE_SIZE));
    render(<BlogPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });
});
