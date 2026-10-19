/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from "vitest";

const mockCoverProject = {
  slug: "cover-project",
  href: "/projects/cover-project",
  title: "Cover Project",
  date: "2024-06-15",
  tags: ["TypeScript"],
  excerpt: "A project with a cover image.",
  imageSrc: "/projects/cover-project/cover.webp",
  imageType: "cover" as const,
  body: "<p>Content</p>",
};

const mockPlaceholderProject = {
  slug: "placeholder-project",
  href: "/projects/placeholder-project",
  title: "Placeholder Project",
  date: "2024-07-01",
  tags: ["Python"],
  excerpt: "A project without a cover image.",
  imageSrc: "/projects/placeholder.svg",
  imageType: "placeholder" as const,
  body: "<p>Content</p>",
};

vi.mock("@academic-portfolio/projects", () => ({
  getAllProjects: () => [mockCoverProject, mockPlaceholderProject],
  getProjectContentBySlug: (slug: string) =>
    Promise.resolve(
      slug === "cover-project" ? mockCoverProject : mockPlaceholderProject,
    ),
}));

vi.mock("@academic-portfolio/content", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@academic-portfolio/content")>();
  return {
    ...actual,
    getFullAssetUrl: (path: string) =>
      path ? `https://example.com${path}` : undefined,
    getFullUrl: (path: string) => `https://example.com${path}`,
    withPublicBasePath: (path: string) => path,
  };
});

vi.mock("../../lib/og-image", () => ({
  ogImageRef: (path: string) => `/og/${path}`,
}));

vi.mock("../../ui/NavBar", () => ({
  NavBar: () => null,
}));

// Import after mocks — generateMetadata is the function under test
const { generateMetadata } = await import("./page.js");

describe("ProjectPage generateMetadata — OG image fallback precedence", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("uses cover image URL when imageType is 'cover'", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "cover-project" }),
    });
    expect(metadata.openGraph?.images?.[0]?.url).toBe(
      "https://example.com/projects/cover-project/cover.webp",
    );
  });

  it("falls back to generated OG SVG when imageType is 'placeholder'", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "placeholder-project" }),
    });
    expect(metadata.openGraph?.images?.[0]?.url).toBe(
      "/og/project-placeholder-project.svg",
    );
  });
});
