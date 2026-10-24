/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ContentMeta, ProfileData } from "@academic-portfolio/content";

// Shared mock data
const mockProfile: ProfileData = {
  name: "Dr. Jane Doe",
  role: "PhD Researcher · Earth Observation",
  email: "test@example.com",
  linkedInUrl: "https://linkedin.com/in/test",
  githubUrl: "https://github.com/test",
  location: "Ithaca, NY",
  image: "profile.svg",
  imageSrc: "/images/profile.svg",
  biography: "<p>Brief bio.</p>",
  researchInterests: [],
  education: [],
  skills: [],
};

const mockProjects: ContentMeta[] = [
  {
    slug: "regular-project",
    href: "/projects/regular-project",
    title: "Regular Project",
    date: "2024-01-15",
    tags: [],
    excerpt: "A test.",
    imageSrc: "/projects/test-project/cover.webp",
    imageType: "cover",
  },
  {
    slug: "selected-project",
    href: "/projects/selected-project",
    title: "Selected Project",
    date: "2023-01-15",
    tags: [],
    excerpt: "A featured test.",
    imageSrc: "/projects/selected-project/cover.webp",
    imageType: "cover",
    selected: true,
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
vi.mock("@academic-portfolio/content", () => ({
  getProfile: () => mockProfile,
  getDeploymentUrl: () => undefined,
  getFullUrl: () => undefined,
  getFullAssetUrl: () => undefined,
  withPublicBasePath: (p: string) => p,
  resolveImage: (slug: string, filename?: string) =>
    filename ? `/${slug}/${filename}` : `/${slug}/cover.webp`,
}));

vi.mock("@academic-portfolio/projects", () => ({
  getAllProjects: vi.fn(() => mockProjects),
  getProjectContentBySlug: vi.fn(),
}));

vi.mock("@academic-portfolio/publications", () => ({
  getAllPublications: vi.fn(() => []),
  getPublicationContentBySlug: vi.fn(),
}));

vi.mock("@academic-portfolio/blog", () => ({
  getAllBlogPosts: vi.fn(),
  getBlogPostContentBySlug: vi.fn(),
}));

vi.mock("@academic-portfolio/navigation", () => ({
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

vi.mock("../features/content/ContentCardSection", () => ({
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

vi.mock("../features/content/AboutSection", () => ({
  AboutSection: () => <div data-testid="about-section">About</div>,
}));

vi.mock("../lib/JsonLd", () => ({
  JsonLd: () => null,
}));

vi.mock("./lib/og-image", () => ({
  ogImageRef: (path: string) => `/og/${path}`,
}));

// Import after mocks
import Index from "./page";
import { getAllBlogPosts } from "@academic-portfolio/blog";
import { getAllPublications } from "@academic-portfolio/publications";
import { getAllProjects } from "@academic-portfolio/projects";

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

  describe("project selection on homepage", () => {
    it("shows only selected projects when any are selected", () => {
      vi.mocked(getAllProjects).mockReturnValue([
        {
          slug: "old-project",
          href: "/projects/old-project",
          title: "Old Project",
          date: "2020-01-01",
          tags: [],
          excerpt: "Old.",
          imageSrc: "/projects/old.webp",
          imageType: "cover",
        },
        {
          slug: "featured-project",
          href: "/projects/featured-project",
          title: "Featured Project",
          date: "2024-06-01",
          tags: [],
          excerpt: "Featured.",
          imageSrc: "/projects/featured.webp",
          imageType: "cover",
          selected: true,
        },
        {
          slug: "another-unselected",
          href: "/projects/another-unselected",
          title: "Another Unselected",
          date: "2024-12-01",
          tags: [],
          excerpt: "Recent but not selected.",
          imageSrc: "/projects/another.webp",
          imageType: "cover",
        },
      ]);
      vi.mocked(getAllBlogPosts).mockReturnValue([]);

      render(<Index />);

      const projectsSection = screen
        .getAllByTestId("card-section")
        .find((s) => s.getAttribute("data-heading") === "Projects");

      const articleTitles = Array.from(
        projectsSection!.querySelectorAll("article"),
      ).map((a) => a.textContent);

      // Only the selected project should appear, not the recent unselected one
      expect(articleTitles).toEqual(["Featured Project"]);
    });

    it("shows only selected projects even when fewer than 3 are selected", () => {
      vi.mocked(getAllProjects).mockReturnValue([
        {
          slug: "unselected-1",
          href: "/projects/unselected-1",
          title: "Unselected 1",
          date: "2024-01-01",
          tags: [],
          excerpt: "",
          imageSrc: "/projects/u1.webp",
          imageType: "cover",
        },
        {
          slug: "selected-1",
          href: "/projects/selected-1",
          title: "Selected 1",
          date: "2024-06-01",
          tags: [],
          excerpt: "",
          imageSrc: "/projects/s1.webp",
          imageType: "cover",
          selected: true,
        },
        {
          slug: "unselected-2",
          href: "/projects/unselected-2",
          title: "Unselected 2",
          date: "2024-12-01",
          tags: [],
          excerpt: "",
          imageSrc: "/projects/u2.webp",
          imageType: "cover",
        },
      ]);
      vi.mocked(getAllBlogPosts).mockReturnValue([]);

      render(<Index />);

      const projectsSection = screen
        .getAllByTestId("card-section")
        .find((s) => s.getAttribute("data-heading") === "Projects");

      const articles = projectsSection!.querySelectorAll("article");
      expect(articles).toHaveLength(1);
      expect(articles[0]).toHaveTextContent("Selected 1");
    });

    it("falls back to three most recent projects when none are selected", () => {
      vi.mocked(getAllProjects).mockReturnValue([
        {
          slug: "newest",
          href: "/projects/newest",
          title: "Newestest",
          date: "2025-01-01",
          tags: [],
          excerpt: "",
          imageSrc: "/projects/newest.webp",
          imageType: "cover",
        },
        {
          slug: "new",
          href: "/projects/new",
          title: "Newest",
          date: "2024-12-01",
          tags: [],
          excerpt: "",
          imageSrc: "/projects/new.webp",
          imageType: "cover",
        },
        {
          slug: "middle",
          href: "/projects/middle",
          title: "Middle",
          date: "2021-06-01",
          tags: [],
          excerpt: "",
          imageSrc: "/projects/middle.webp",
          imageType: "cover",
        },
        {
          slug: "old",
          href: "/projects/old",
          title: "Oldest",
          date: "2020-01-01",
          tags: [],
          excerpt: "",
          imageSrc: "/projects/old.webp",
          imageType: "cover",
        },
      ]);
      vi.mocked(getAllBlogPosts).mockReturnValue([]);

      render(<Index />);

      const projectsSection = screen
        .getAllByTestId("card-section")
        .find((s) => s.getAttribute("data-heading") === "Projects");

      const articles = projectsSection!.querySelectorAll("article");
      // Should show exactly 3 (the three most recent), sorted newest-first
      expect(articles).toHaveLength(3);
      expect(articles[0]).toHaveTextContent("Newestest");
      expect(articles[1]).toHaveTextContent("Newest");
      expect(articles[2]).toHaveTextContent("Middle");
    });

    it("shows all projects when fewer than 3 exist and none are selected", () => {
      vi.mocked(getAllProjects).mockReturnValue([
        {
          slug: "only",
          href: "/projects/only",
          title: "Only Project",
          date: "2024-01-01",
          tags: [],
          excerpt: "",
          imageSrc: "/projects/only.webp",
          imageType: "cover",
        },
      ]);
      vi.mocked(getAllBlogPosts).mockReturnValue([]);

      render(<Index />);

      const projectsSection = screen
        .getAllByTestId("card-section")
        .find((s) => s.getAttribute("data-heading") === "Projects");

      const articles = projectsSection!.querySelectorAll("article");
      expect(articles).toHaveLength(1);
      expect(articles[0]).toHaveTextContent("Only Project");
    });

    it("shows 'View all projects' link pointing to /projects", () => {
      vi.mocked(getAllProjects).mockReturnValue([
        {
          slug: "p1",
          href: "/projects/p1",
          title: "Project 1",
          date: "2024-01-01",
          tags: [],
          excerpt: "",
          imageSrc: "/projects/p1.webp",
          imageType: "cover",
        },
      ]);
      vi.mocked(getAllBlogPosts).mockReturnValue([]);

      render(<Index />);

      const links = screen.getAllByTestId("view-all-link");
      const projectsLink = links.find(
        (l) => l.getAttribute("href") === "/projects",
      );
      expect(projectsLink).toBeInTheDocument();
      expect(projectsLink).toHaveTextContent("View all projects");
    });
  });

  describe("publication selection on homepage", () => {
    it("shows only selected publications when any are selected", () => {
      vi.mocked(getAllProjects).mockReturnValue([]);
      vi.mocked(getAllBlogPosts).mockReturnValue([]);
      vi.mocked(getAllPublications).mockReturnValue([
        {
          slug: "old-pub",
          href: "/publications/old-pub",
          title: "Old Publication",
          date: "2020-01-01",
          tags: [],
          imageSrc: "/publications/old.webp",
          imageType: "cover",
        },
        {
          slug: "featured-pub",
          href: "/publications/featured-pub",
          title: "Featured Publication",
          date: "2024-06-01",
          tags: [],
          authors: ["Jane Doe"],
          venue: "Nature",
          imageSrc: "/publications/featured.webp",
          imageType: "cover",
          selected: true,
        },
      ]);

      render(<Index />);

      const pubsSection = screen
        .getAllByTestId("card-section")
        .find((s) => s.getAttribute("data-heading") === "Publications");

      const articles = pubsSection!.querySelectorAll("article");
      expect(articles).toHaveLength(1);
      expect(articles[0]).toHaveTextContent("Featured Publication");
      expect(articles[0]).not.toHaveTextContent("Old Publication");
    });

    it("shows only selected publications even when fewer than 3 are selected", () => {
      vi.mocked(getAllProjects).mockReturnValue([]);
      vi.mocked(getAllBlogPosts).mockReturnValue([]);
      vi.mocked(getAllPublications).mockReturnValue([
        {
          slug: "unselected-1",
          href: "/publications/unselected-1",
          title: "Unselected 1",
          date: "2024-01-01",
          tags: [],
          imageSrc: "/publications/u1.webp",
          imageType: "cover",
        },
        {
          slug: "selected-1",
          href: "/publications/selected-1",
          title: "Selected 1",
          date: "2024-06-01",
          tags: [],
          authors: ["A"],
          imageSrc: "/publications/s1.webp",
          imageType: "cover",
          selected: true,
        },
      ]);

      render(<Index />);

      const pubsSection = screen
        .getAllByTestId("card-section")
        .find((s) => s.getAttribute("data-heading") === "Publications");

      const articles = pubsSection!.querySelectorAll("article");
      expect(articles).toHaveLength(1);
      expect(articles[0]).toHaveTextContent("Selected 1");
    });

    it("falls back to three most recent publications when none are selected", () => {
      vi.mocked(getAllProjects).mockReturnValue([]);
      vi.mocked(getAllBlogPosts).mockReturnValue([]);
      vi.mocked(getAllPublications).mockReturnValue([
        {
          slug: "newest",
          href: "/publications/newest",
          title: "Newest",
          date: "2025-01-01",
          tags: [],
          imageSrc: "/publications/newest.webp",
          imageType: "cover",
        },
        {
          slug: "middle",
          href: "/publications/middle",
          title: "Middle",
          date: "2024-06-01",
          tags: [],
          imageSrc: "/publications/middle.webp",
          imageType: "cover",
        },
        {
          slug: "old",
          href: "/publications/old",
          title: "Old",
          date: "2020-01-01",
          tags: [],
          imageSrc: "/publications/old.webp",
          imageType: "cover",
        },
      ]);

      render(<Index />);

      const pubsSection = screen
        .getAllByTestId("card-section")
        .find((s) => s.getAttribute("data-heading") === "Publications");

      const articles = pubsSection!.querySelectorAll("article");
      expect(articles).toHaveLength(3);
    });

    it("shows all publications when fewer than 3 exist and none are selected", () => {
      vi.mocked(getAllProjects).mockReturnValue([]);
      vi.mocked(getAllBlogPosts).mockReturnValue([]);
      vi.mocked(getAllPublications).mockReturnValue([
        {
          slug: "only",
          href: "/publications/only",
          title: "Only Publication",
          date: "2024-01-01",
          tags: [],
          imageSrc: "/publications/only.webp",
          imageType: "cover",
        },
      ]);

      render(<Index />);

      const pubsSection = screen
        .getAllByTestId("card-section")
        .find((s) => s.getAttribute("data-heading") === "Publications");

      const articles = pubsSection!.querySelectorAll("article");
      expect(articles).toHaveLength(1);
      expect(articles[0]).toHaveTextContent("Only Publication");
    });
  });
});
