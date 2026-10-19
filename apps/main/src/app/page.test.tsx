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
  name: "Kathleen Miller",
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
  getAllPublications: () => [],
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
    name: "Kathleen Miller",
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
  }: {
    heading: string;
    items: ContentMeta[];
  }) => (
    <section data-testid="card-section" data-heading={heading}>
      <h2>{heading}</h2>
      {items.map((item) => (
        <article key={item.slug}>{item.title}</article>
      ))}
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
});
