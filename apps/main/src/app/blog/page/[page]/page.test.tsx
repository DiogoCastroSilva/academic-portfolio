/**
 * @vitest-environment happy-dom
 */
import "@testing-library/jest-dom";

import React from "react";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContentMeta } from "@katie-portfolio/content";
import { PAGE_SIZE, paginate } from "../../../lib/pagination.js";

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

afterEach(() => {
  vi.unstubAllEnvs();
});

vi.mock("@katie-portfolio/content", () => ({
  withPublicBasePath: (p: string) => {
    if (!p.startsWith("/")) return p;
    const bp = process.env.NEXT_PUBLIC_BASE_PATH;
    if (!bp || bp === "/" || bp.trim() === "") return p;
    return `/${bp.trim().replace(/^\/+|\/+$/g, "")}${p}`;
  },
}));

vi.mock("@katie-portfolio/blog", () => ({
  getAllBlogPosts: () => mockPosts,
  getBlogPostContentBySlug: vi.fn(),
}));

vi.mock("@katie-portfolio/navigation", () => ({
  NavBar: () => null,
}));

vi.mock("../../../configs/site-config", () => ({
  siteConfig: {
    name: "Dr. Jane Doe",
    deploymentUrl: undefined,
    analytics: { cloudflare: { token: "test", enabled: false } },
  },
}));

vi.mock("../../../ui/Pagination", () => ({
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

vi.mock("../../../lib/og-image", () => ({
  ogImageRef: (path: string) => `/og/${path}`,
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

describe("BlogPage generateStaticParams", () => {
  it("emits page 1 when collection fits on one page", async () => {
    mockPosts.length = 0;
    const params = await generateStaticParams();
    // Page 1 redirects to /blog/ for canonical-URL correctness
    expect(params).toEqual([{ page: "1" }]);
  });

  it("generates pages 1..N for multi-page collections", async () => {
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
    // Page 1 is included so /blog/page/1/ can redirect to /blog/
    expect(pageNumbers).toEqual(["1", "2", "3"]);
  });

  it("generates pages 1 and 2 for exactly PAGE_SIZE + 1 items", async () => {
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
    expect(params).toEqual([{ page: "1" }, { page: "2" }]);
  });

  it("respects basePath in page-1 redirect", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/portfolio");
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
    // Re-import with basePath stubbed
    const { default: PageWithBase } = await import("./page");
    const result = await PageWithBase({
      params: Promise.resolve({ page: "1" }),
    });
    expect((result as React.JSX.Element).props.content).toBe(
      "0;url=/portfolio/blog/",
    );
    vi.unstubAllEnvs();
  });
});

it("emits page 1 when collection has exactly 1 item", async () => {
  mockPosts.length = 0;
  mockPosts.push({
    slug: "only-item",
    href: "/items/only-item",
    title: "Only Item",
    date: "2024-01-01",
    tags: ["test"],
    imageSrc: "/placeholder.svg",
    imageType: "cover" as const,
  });
  const params = (await generateStaticParams()) as Array<{ page: string }>;
  expect(params).toEqual([{ page: "1" }]);
});

it("emits page 1 when collection has exactly PAGE_SIZE items", async () => {
  mockPosts.length = 0;
  mockPosts.push(
    ...Array.from({ length: PAGE_SIZE }, (_, i) => ({
      slug: `item-${i}`,
      href: `/items/item-${i}`,
      title: `Item ${i}`,
      date: "2024-01-01",
      tags: ["test"],
      imageSrc: "/placeholder.svg",
      imageType: "cover" as const,
    })),
  );
  const params = (await generateStaticParams()) as Array<{ page: string }>;
  expect(params).toEqual([{ page: "1" }]);
});

it("emits pages 1 and 2 when collection has exactly PAGE_SIZE * 2 items", async () => {
  mockPosts.length = 0;
  mockPosts.push(
    ...Array.from({ length: PAGE_SIZE * 2 }, (_, i) => ({
      slug: `item-${i}`,
      href: `/items/item-${i}`,
      title: `Item ${i}`,
      date: "2024-01-01",
      tags: ["test"],
      imageSrc: "/placeholder.svg",
      imageType: "cover" as const,
    })),
  );
  const params = (await generateStaticParams()) as Array<{ page: string }>;
  expect(params).toEqual([{ page: "1" }, { page: "2" }]);
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

  it("every published item appears exactly once across all pages", () => {
    const items = Array.from({ length: PAGE_SIZE * 2 + 1 }, (_, i) => ({
      slug: `item-${i}`,
      title: `Item ${i}`,
    }));
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const allSeen: string[] = [];
    for (let page = 1; page <= totalPages; page++) {
      const { items: pageItems } = paginate(items, page);
      pageItems.forEach((item) => allSeen.push(item.slug));
    }
    // Every item appears exactly once across all pages
    expect(allSeen).toHaveLength(items.length);
    expect(new Set(allSeen).size).toBe(items.length);
    expect(allSeen.sort()).toEqual(items.map((i) => i.slug).sort());
  });
});
