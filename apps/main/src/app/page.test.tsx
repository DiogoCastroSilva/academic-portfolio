/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ContentMeta, ProfileData } from "@katie-portfolio/content";

// Shared mock data
const mockProfile: ProfileData = {
  name: "Dr. Jane Doe",
  role: "PhD Researcher | Earth Observation",
  email: "test@example.com",
  linkedInUrl: "https://linkedin.com/in/test",
  githubUrl: "https://github.com/test",
  location: "Ithaca, NY",
  image: "profile.jpeg",
  imageSrc: "/images/profile.jpeg",
  biography: "<p>Brief bio.</p>",
  researchInterests: [],
  education: [],
  skills: [],
};

const mockProjects: ContentMeta[] = [
  {
    slug: "test-project",
    href: "/projects/test-project",
    title: "Test Project",
    date: "2024-01-15",
    tags: [],
    excerpt: "A test.",
    imageSrc: "/projects/test-project/cover.webp",
    imageType: "cover",
  },
];

const mockPublications: ContentMeta[] = [
  {
    slug: "test-publication",
    href: "/publications/test-publication",
    title: "Test Publication",
    date: "2024-01-15",
    tags: [],
    authors: ["Test Author"],
    venue: "Test Journal",
    imageSrc: "/publications/test-publication/cover.webp",
    imageType: "cover",
  },
];

const mockBlogPost: ContentMeta = {
  slug: "test-post",
  href: "/blog/test-post",
  title: "Test Blog Post",
  date: "2025-01-01",
  tags: [],
  excerpt: "A blog post.",
  imageSrc: "/blog/test-post/cover.webp",
  imageType: "cover",
};

// Mock dependencies
vi.mock("@katie-portfolio/content", () => ({
  getProfile: () => mockProfile,
  getDeploymentUrl: () => undefined,
  getFullUrl: () => undefined,
  getFullAssetUrl: () => undefined,
  withPublicBasePath: (p: string) => p,
  resolveImage: (slug: string, filename?: string) =>
    filename ? `/${slug}/${filename}` : `/${slug}/cover.webp`,
}));

vi.mock("@katie-portfolio/projects", () => ({
  getAllProjects: () => mockProjects,
  getProjectContentBySlug: vi.fn(),
}));

vi.mock("@katie-portfolio/publications", () => ({
  getAllPublications: vi.fn(() => []),
  getPublicationContentBySlug: vi.fn(),
}));

vi.mock("@katie-portfolio/blog", () => ({
  getAllBlogPosts: vi.fn(),
  getBlogPostContentBySlug: vi.fn(),
}));

vi.mock("@katie-portfolio/navigation", () => ({
  NavBar: () => null,
}));

vi.mock("../configs/site-config", () => ({
  siteConfig: {
    name: "Dr. Jane Doe",
    role: "PhD",
    email: "test@example.com",
    linkedInUrl: "https://linkedin.com/in/test",
    githubUrl: "https://github.com/test",
    contentLicenseName: "CC BY-NC-ND 4.0",
    contentLicenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    repoLicenseName: "MIT",
    repoLicenseUrl: "https://opensource.org/licenses/MIT",
    deploymentUrl: undefined,
    analytics: { cloudflare: { token: "", enabled: false } },
  },
}));

vi.mock("./ui/ContentCardSection", () => ({
  ContentCardSection: ({
    heading,
    items,
    limit,
    viewAllHref,
    viewAllLabel,
  }: {
    heading: string;
    items: ContentMeta[];
    limit?: number;
    viewAllHref?: string;
    viewAllLabel?: string;
  }) => (
    <section data-testid="card-section" data-heading={heading}>
      <h2>{heading}</h2>
      {(limit ? items.slice(0, limit) : items).map((item) => (
        <article key={item.slug}>{item.title}</article>
      ))}
      {viewAllHref && items.length > 0 && (
        <a
          data-testid="view-all-link"
          href={viewAllHref}
          aria-label={viewAllLabel}
        >
          {viewAllLabel}
        </a>
      )}
    </section>
  ),
}));

vi.mock("./ui/AboutSection", () => ({
  AboutSection: () => <div data-testid="about-section">About</div>,
}));

vi.mock("./ui/JsonLd", () => ({
  JsonLd: () => null,
}));

vi.mock("./lib/og-image", () => ({
  ogImageRef: (path: string) => `/og/${path}`,
}));

// Import after mocks
import Index from "./page";
import { getAllBlogPosts } from "@katie-portfolio/blog";
import { getAllPublications } from "@katie-portfolio/publications";

describe("Homepage", () => {
  it("hides Blog section when no published blog posts exist", () => {
    vi.mocked(getAllBlogPosts).mockReturnValue([]);

    render(<Index />);

    const sections = screen.getAllByTestId("card-section");
    const headings = sections.map((s) => s.getAttribute("data-heading"));
    expect(headings).not.toContain("Blog");
    expect(headings).toContain("Projects");
  });

  it("shows Blog section when published blog posts exist", () => {
    vi.mocked(getAllBlogPosts).mockReturnValue([mockBlogPost]);

    render(<Index />);

    const sections = screen.getAllByTestId("card-section");
    const headings = sections.map((s) => s.getAttribute("data-heading"));
    expect(headings).toContain("Blog");

    expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
  });

  it("shows 'View all posts' link pointing to /blog when blog posts exist", () => {
    vi.mocked(getAllBlogPosts).mockReturnValue([mockBlogPost]);

    render(<Index />);

    const allLinks = screen.getAllByTestId("view-all-link");
    const blogViewAll = allLinks.find(
      (a) => a.getAttribute("href") === "/blog",
    );
    expect(blogViewAll).toBeInTheDocument();
    expect(blogViewAll).toHaveTextContent("View all posts");
  });

  it("shows 'View all projects' and 'View all publications' links when items exist", () => {
    vi.mocked(getAllBlogPosts).mockReturnValue([]);
    vi.mocked(getAllPublications).mockReturnValue([mockPublications[0]]);

    render(<Index />);

    const links = screen.getAllByTestId("view-all-link");
    const labels = links.map((l) => l.getAttribute("aria-label"));
    expect(labels).toContain("View all projects");
    expect(labels).toContain("View all publications");
  });

  it("does not show 'View all publications' link when no publications exist", () => {
    vi.mocked(getAllBlogPosts).mockReturnValue([]);
    vi.mocked(getAllPublications).mockReturnValue([]);

    render(<Index />);

    const links = screen.getAllByTestId("view-all-link");
    const labels = links.map((l) => l.getAttribute("aria-label"));
    expect(labels).not.toContain("View all publications");
    expect(labels).toContain("View all projects");
  });

  it("limits Blog section to 6 items on the homepage", () => {
    const mockPosts = Array.from({ length: 8 }, (_, i) => ({
      slug: `post-${i}`,
      href: `/blog/post-${i}`,
      title: `Post ${i}`,
      date: `2024-01-0${(i % 9) + 1}`,
      tags: [],
      excerpt: "A post.",
      imageSrc: "/blog/placeholder.svg",
      imageType: "placeholder" as const,
    }));
    vi.mocked(getAllBlogPosts).mockReturnValue(mockPosts);

    render(<Index />);

    const blogSection = screen
      .getAllByTestId("card-section")
      .find((s) => s.getAttribute("data-heading") === "Blog");
    expect(blogSection).toBeDefined();
    const articles = blogSection!.querySelectorAll("article");
    expect(articles).toHaveLength(6);
  });
});
