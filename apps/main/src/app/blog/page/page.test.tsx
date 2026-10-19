/**
 * @vitest-environment happy-dom
 */
import "@testing-library/jest-dom";

import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ContentMeta } from "@katie-portfolio/content";
import { PAGE_SIZE } from "../../lib/pagination.js";

import BlogPage, { generateStaticParams } from "./page";

const mockPosts: ContentMeta[] = [
  {
    slug: "post-0",
    href: "/blog/post-0",
    title: "Post 0",
    date: "2025-01-01",
    tags: ["test"],
    imageSrc: "/blog/placeholder.svg",
    imageType: "cover" as const,
  },
];

vi.mock("@katie-portfolio/blog", () => ({
  getAllBlogPosts: () => mockPosts,
  getBlogPostContentBySlug: vi.fn(),
}));

vi.mock("@katie-portfolio/navigation", () => ({
  NavBar: () => null,
}));

vi.mock("../../configs/site-config", () => ({
  siteConfig: {
    name: "Kathleen Miller",
    deploymentUrl: undefined,
    analytics: { cloudflare: { token: "test", enabled: false } },
  },
}));

vi.mock("../../ui/Pagination", () => ({
  Pagination: ({
    currentPage,
    totalPages,
  }: {
    currentPage: number;
    totalPages: number;
  }) => (
    <nav
      data-testid="pagination"
      data-current={currentPage}
      data-total={totalPages}
    >
      Pagination
    </nav>
  ),
}));

vi.mock("../../lib/og-image", () => ({
  ogImageRef: (path: string) => `/og/${path}`,
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

describe("BlogPage generateStaticParams", () => {
  it("returns no pages when collection fits on one page", async () => {
    mockPosts.length = 0;
    const params = await generateStaticParams();
    expect(params).toEqual([]);
  });

  it("generates pages 2..N for multi-page collections", async () => {
    // Set up enough posts for 3 pages
    mockPosts.length = 0;
    mockPosts.push(
      ...Array.from({ length: PAGE_SIZE * 2 + 1 }, (_, i) => ({
        slug: `post-${i}`,
        href: `/blog/post-${i}`,
        title: `Post ${i}`,
        date: "2025-01-01",
        tags: ["test"],
        imageSrc: "/blog/placeholder.svg",
        imageType: "cover" as const,
      })),
    );
    const params = (await generateStaticParams()) as Array<{ page: string }>;
    const pageNumbers = params.map((p) => p.page);
    expect(pageNumbers).toEqual(["2", "3"]);
  });

  it("generates pages 2..N for exactly 2 pages of content", async () => {
    mockPosts.length = 0;
    mockPosts.push(
      ...Array.from({ length: PAGE_SIZE + 1 }, (_, i) => ({
        slug: `post-${i}`,
        href: `/blog/post-${i}`,
        title: `Post ${i}`,
        date: "2025-01-01",
        tags: ["test"],
        imageSrc: "/blog/placeholder.svg",
        imageType: "cover" as const,
      })),
    );
    const params = (await generateStaticParams()) as Array<{ page: string }>;
    expect(params).toEqual([{ page: "2" }]);
  });
});

describe("BlogPage page rendering", () => {
  it("redirects page 1 to /blog/ via meta refresh", async () => {
    mockPosts.length = 0;
    mockPosts.push({
      slug: "post-0",
      href: "/blog/post-0",
      title: "Post 0",
      date: "2025-01-01",
      tags: ["test"],
      imageSrc: "/blog/placeholder.svg",
      imageType: "cover",
    });
    const result = await BlogPage({ params: Promise.resolve({ page: "1" }) });
    // The component returns a bare <meta> element for the redirect
    expect(result).toBeDefined();
    expect((result as React.JSX.Element).type).toBe("meta");
    expect((result as React.JSX.Element).props["httpEquiv"]).toBe("refresh");
    expect((result as React.JSX.Element).props.content).toBe("0;url=/blog/");
  });

  it("renders correct items for page 2", async () => {
    mockPosts.length = 0;
    mockPosts.push(
      ...Array.from({ length: PAGE_SIZE + 3 }, (_, i) => ({
        slug: `post-${i}`,
        href: `/blog/post-${i}`,
        title: `Post ${i}`,
        date: "2025-01-01",
        tags: ["test"],
        imageSrc: "/blog/placeholder.svg",
        imageType: "cover" as const,
      })),
    );

    const result = await BlogPage({ params: Promise.resolve({ page: "2" }) });
    const { container } = render(result);
    const articles = container.querySelectorAll("article");
    // Page 2 has 3 items (items 10-12 of 13 total)
    expect(articles).toHaveLength(3);
    expect(container.textContent).toContain("Post 10");
    expect(container.textContent).toContain("Post 12");
    expect(container.textContent).not.toContain("Post 0");
  });

  it("throws NOT_FOUND for page beyond totalPages", async () => {
    mockPosts.length = 0;
    mockPosts.push({
      slug: "post-0",
      href: "/blog/post-0",
      title: "Post 0",
      date: "2025-01-01",
      tags: ["test"],
      imageSrc: "/blog/placeholder.svg",
      imageType: "cover",
    });

    await expect(
      BlogPage({ params: Promise.resolve({ page: "5" }) }),
    ).rejects.toThrow("NOT_FOUND");
  });
});
