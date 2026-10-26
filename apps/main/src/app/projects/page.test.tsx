/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContentMeta } from "@academic-portfolio/content";
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

vi.mock("@academic-portfolio/projects", () => ({
  getAllProjects: () => mockProjects,
  getProjectContentBySlug: vi.fn(),
}));

vi.mock("@academic-portfolio/navigation", () => ({
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
    name: "Dr. Jane Doe",
    deploymentUrl: undefined,
    analytics: { cloudflare: { token: "test", enabled: false } },
    contentLicenseName: "CC BY-NC-ND 4.0",
    contentLicenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    repoLicenseName: "MIT",
    repoLicenseUrl: "https://opensource.org/licenses/MIT",
  },
}));

vi.mock("@academic-portfolio/design-system", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@academic-portfolio/design-system")
  >()),
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

describe("ProjectsPage featured section", () => {
  const originalMock: ContentMeta[] = [
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

  afterEach(() => {
    mockProjects.length = 0;
    mockProjects.push(...originalMock);
  });

  it("renders featured section heading when projects are selected", () => {
    mockProjects.length = 0;
    mockProjects.push(
      {
        slug: "featured-project",
        href: "/projects/featured-project",
        title: "Featured Project Title",
        date: "2024-06-15",
        tags: ["research"],
        excerpt: "An important project.",
        imageSrc: "/projects/featured-project/cover.webp",
        imageType: "cover",
        selected: true,
      },
      {
        slug: "regular-project",
        href: "/projects/regular-project",
        title: "Regular Project Title",
        date: "2023-01-15",
        tags: ["analysis"],
        excerpt: "A regular project.",
        imageSrc: "/projects/regular-project/cover.webp",
        imageType: "cover",
      },
    );
    render(<ProjectsPage />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Featured" }),
    ).toBeInTheDocument();
  });

  it("excludes featured projects from the regular grid", () => {
    mockProjects.length = 0;
    mockProjects.push(
      {
        slug: "featured-project",
        href: "/projects/featured-project",
        title: "Featured Project Title",
        date: "2024-06-15",
        tags: ["research"],
        excerpt: "An important project.",
        imageSrc: "/projects/featured-project/cover.webp",
        imageType: "cover",
        selected: true,
      },
      {
        slug: "regular-project",
        href: "/projects/regular-project",
        title: "Regular Project Title",
        date: "2023-01-15",
        tags: ["analysis"],
        excerpt: "A regular project.",
        imageSrc: "/projects/regular-project/cover.webp",
        imageType: "cover",
      },
    );
    render(<ProjectsPage />);

    // Find the ContentCardSection by its heading
    const allProjectsHeading = screen.getByRole("heading", {
      level: 2,
      name: "All Projects",
    });
    const cardSection = allProjectsHeading.closest("section");

    // Featured project should NOT appear in the card grid
    expect(cardSection?.textContent).not.toContain("Featured Project Title");
    // Regular project SHOULD appear in the card grid
    expect(cardSection?.textContent).toContain("Regular Project Title");
  });

  it("does not render featured section when no projects are selected", () => {
    // mockProjects has 1 item without selected — already set by afterEach
    render(<ProjectsPage />);
    expect(
      screen.queryByRole("heading", { level: 2, name: "Featured" }),
    ).not.toBeInTheDocument();
  });

  it("renders all projects in the grid when none are selected", () => {
    mockProjects.length = 0;
    mockProjects.push(...buildMockProjects(3));
    render(<ProjectsPage />);

    // No featured section
    expect(
      screen.queryByRole("heading", { level: 2, name: "Featured" }),
    ).not.toBeInTheDocument();

    // All 3 projects appear in the grid
    const allProjectsHeading = screen.getByRole("heading", {
      level: 2,
      name: "All Projects",
    });
    const cardSection = allProjectsHeading.closest("section");
    const articles = cardSection?.querySelectorAll("article");
    expect(articles).toHaveLength(3);
  });
});
