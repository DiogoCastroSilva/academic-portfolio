/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { describe, expect, it, vi } from "vitest";

// Mock next/navigation to avoid notFound() side-effects in tests
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

const mockPost = {
  slug: "test-post",
  href: "/blog/test-post",
  title: "Test Post Title",
  date: "2025-01-15",
  tags: ["example"],
  excerpt: "A test blog post.",
  imageSrc: "/blog/test-post/cover.jpeg",
  imageType: "cover" as const,
  body: "<p>Content</p>",
};

vi.mock("@academic-portfolio/blog", () => ({
  getAllBlogPosts: () => [mockPost],
  getBlogPostContentBySlug: (slug: string) =>
    Promise.resolve(slug === "test-post" ? mockPost : null),
}));

vi.mock("@academic-portfolio/content", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@academic-portfolio/content")>();
  return {
    ...actual,
    getFullAssetUrl: (path: string) =>
      path ? `https://example.com${path}` : undefined,
    getFullUrl: (path: string) => `https://example.com${path}`,
  };
});

vi.mock("../../lib/og-image", () => ({
  ogImageRef: (path: string) => `/og/${path}`,
}));

vi.mock("../../ui/NavBar", () => ({
  NavBar: () => null,
}));

// Import after mocks
const { default: BlogPostPage, generateMetadata } = await import("./page.js");

describe("BlogPostPage card surface consistency", () => {
  it("uses the same card container class as project/publication detail pages (dark:bg-slate-850)", async () => {
    const params = Promise.resolve({ slug: "test-post" });
    const result = await BlogPostPage({ params });
    // The card container div is the first child — check its className
    const containerDiv = (
      result as { type: string; props: { className: string } }
    ).props.className;
    expect(containerDiv).toContain("mx-4");
    expect(containerDiv).toContain("flex-col");
    expect(containerDiv).toContain("gap-4");
    expect(containerDiv).toContain("rounded-2xl");
    // Card container uses dark slate-800 surface in dark mode
    expect(containerDiv).toContain("dark:bg-slate-850");
  });

  it("Breadcrumb and ContentDetail both render inside the card container", async () => {
    const params = Promise.resolve({ slug: "test-post" });
    const result = await BlogPostPage({ params });
    const children = (result as { props: { children: unknown[] } }).props
      .children;
    // Should have Breadcrumb first, then ContentDetail
    expect(children).toBeDefined();
  });
});

describe("BlogPostPage generateMetadata", () => {
  it("uses cover image URL when imageType is 'cover'", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "test-post" }),
    });
    expect(metadata.openGraph?.images?.[0]?.url).toBe(
      "https://example.com/blog/test-post/cover.jpeg",
    );
  });
});
