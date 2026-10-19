/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContentMeta } from "@katie-portfolio/content";
import { PAGE_SIZE } from "../lib/pagination.js";

const mockProjects: ContentMeta[] = [
  {
    slug: "first-project",
    href: "/projects/first-project",
    title: "First Project",
    date: "2024-06-15",
    tags: ["TypeScript"],
    excerpt: "A test project.",
    imageSrc: "/projects/first-project/cover.webp",
    imageType: "cover",
  },
];

vi.mock("@katie-portfolio/projects", () => ({
  getAllProjects: () => mockProjects,
  getProjectContentBySlug: vi.fn(),
}));

vi.mock("@katie-portfolio/navigation", () => ({
  NavBar: ({ items }: { items?: { name: string; href: string }[] }) => (
    <nav data-testid="navbar">
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
    contentLicenseName: "CC BY-NC-ND 4.0",
    contentLicenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    repoLicenseName: "MIT",
    repoLicenseUrl: "https://opensource.org/licenses/MIT",
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
import ProjectsPage from "./page";

describe("ProjectsPage", () => {
  it("renders projects listing heading as h1 (page-level title)", () => {
    const { container } = render(<ProjectsPage />);
    const heading = container.querySelector("h1");
    expect(heading).toHaveTextContent("Projects");
  });

  it("renders one article per project", () => {
    const { container } = render(<ProjectsPage />);
    const articles = container.querySelectorAll("article");
    expect(articles).toHaveLength(1);
  });

  it("shows project title in the card", () => {
    const { container } = render(<ProjectsPage />);
    const article = container.querySelector("article");
    expect(article?.textContent).toContain("First Project");
  });

  it("does not render pagination nav when collection fits on one page", () => {
    render(<ProjectsPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("renders pagination with correct props when multiple pages", () => {
    mockProjects.length = 0;
    mockProjects.push(...buildMockProjects(PAGE_SIZE + 1));
    render(<ProjectsPage />);
    const pagination = screen.getByTestId("pagination");
    expect(pagination).toHaveAttribute("data-current", "1");
    expect(pagination).toHaveAttribute("data-total", "2");
  });
});

/** Build N mock projects with deterministic titles for pagination tests. */
function buildMockProjects(n: number): ContentMeta[] {
  return Array.from({ length: n }, (_, i) => ({
    slug: `project-${i}`,
    href: `/projects/project-${i}`,
    title: `Test Project ${i}`,
    date: "2024-01-01",
    tags: ["test"],
    excerpt: `Description for project ${i}.`,
    imageSrc: "/projects/placeholder.svg",
    imageType: "cover" as const,
  }));
}

describe("ProjectsPage multi-item pagination", () => {
  afterEach(() => {
    mockProjects.length = 0;
    mockProjects.push({
      slug: "first-project",
      href: "/projects/first-project",
      title: "First Project",
      date: "2024-06-15",
      tags: ["TypeScript"],
      excerpt: "A test project.",
      imageSrc: "/projects/first-project/cover.webp",
      imageType: "cover",
    });
  });

  it("shows 1 page for 0 items", () => {
    mockProjects.length = 0;
    render(<ProjectsPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("shows 1 page for 1 item", () => {
    render(<ProjectsPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("shows 1 page for exactly PAGE_SIZE items", () => {
    mockProjects.length = 0;
    mockProjects.push(...buildMockProjects(PAGE_SIZE));
    render(<ProjectsPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("shows 2 pages for PAGE_SIZE + 1 items", () => {
    mockProjects.length = 0;
    mockProjects.push(...buildMockProjects(PAGE_SIZE + 1));
    render(<ProjectsPage />);
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-total", "2");
  });

  it("shows 2 pages for 2 × PAGE_SIZE items", () => {
    mockProjects.length = 0;
    mockProjects.push(...buildMockProjects(PAGE_SIZE * 2));
    render(<ProjectsPage />);
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-total", "2");
  });

  it("shows 3 pages for 2 × PAGE_SIZE + 1 items", () => {
    mockProjects.length = 0;
    mockProjects.push(...buildMockProjects(PAGE_SIZE * 2 + 1));
    render(<ProjectsPage />);
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-total", "3");
  });

  it("renders no pagination controls when totalPages is 1", () => {
    mockProjects.length = 0;
    mockProjects.push(...buildMockProjects(PAGE_SIZE));
    render(<ProjectsPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });
});
