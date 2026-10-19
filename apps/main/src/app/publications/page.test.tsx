/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContentMeta } from "@academic-portfolio/content";
import { PAGE_SIZE } from "../lib/pagination.js";

const mockPublications: ContentMeta[] = [
  {
    slug: "first-publication",
    href: "/publications/first-publication",
    title: "First Publication",
    date: "2024-09-01",
    tags: ["ecology"],
    authors: ["Jane Doe"],
    venue: "Journal of Examples",
    imageSrc: "/publications/first-publication/cover.webp",
    imageType: "cover",
  },
];

vi.mock("@academic-portfolio/publications", () => ({
  getAllPublications: () => mockPublications,
  getPublicationContentBySlug: vi.fn(),
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
import PublicationsPage from "./page";

describe("PublicationsPage", () => {
  it("renders publications listing heading as h1 (page-level title)", () => {
    const { container } = render(<PublicationsPage />);
    const heading = container.querySelector("h1");
    expect(heading).toHaveTextContent("Publications");
  });

  it("renders one article per publication", () => {
    const { container } = render(<PublicationsPage />);
    const articles = container.querySelectorAll("article");
    expect(articles).toHaveLength(1);
  });

  it("shows publication title in the card", () => {
    const { container } = render(<PublicationsPage />);
    const article = container.querySelector("article");
    expect(article?.textContent).toContain("First Publication");
  });

  it("does not render pagination nav when collection fits on one page", () => {
    render(<PublicationsPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("renders pagination with correct props when multiple pages", () => {
    mockPublications.length = 0;
    mockPublications.push(...buildMockPublications(PAGE_SIZE + 1));
    render(<PublicationsPage />);
    const pagination = screen.getByTestId("pagination");
    expect(pagination).toHaveAttribute("data-current", "1");
    expect(pagination).toHaveAttribute("data-total", "2");
  });
});

/** Build N mock publications with deterministic titles for pagination tests. */
function buildMockPublications(n: number): ContentMeta[] {
  return Array.from({ length: n }, (_, i) => ({
    slug: `pub-${i}`,
    href: `/publications/pub-${i}`,
    title: `Test Publication ${i}`,
    date: "2024-01-01",
    tags: ["test"],
    authors: ["Test Author"],
    venue: "Journal of Examples",
    imageSrc: "/publications/placeholder.svg",
    imageType: "cover" as const,
  }));
}

describe("PublicationsPage multi-item pagination", () => {
  afterEach(() => {
    mockPublications.length = 0;
    mockPublications.push({
      slug: "first-publication",
      href: "/publications/first-publication",
      title: "First Publication",
      date: "2024-09-01",
      tags: ["ecology"],
      authors: ["Jane Doe"],
      venue: "Journal of Examples",
      imageSrc: "/publications/first-publication/cover.webp",
      imageType: "cover",
    });
  });

  it("shows 1 page for 0 items", () => {
    mockPublications.length = 0;
    render(<PublicationsPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("shows 1 page for 1 item", () => {
    render(<PublicationsPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("shows 1 page for exactly PAGE_SIZE items", () => {
    mockPublications.length = 0;
    mockPublications.push(...buildMockPublications(PAGE_SIZE));
    render(<PublicationsPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });

  it("shows 2 pages for PAGE_SIZE + 1 items", () => {
    mockPublications.length = 0;
    mockPublications.push(...buildMockPublications(PAGE_SIZE + 1));
    render(<PublicationsPage />);
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-total", "2");
  });

  it("shows 2 pages for 2 × PAGE_SIZE items", () => {
    mockPublications.length = 0;
    mockPublications.push(...buildMockPublications(PAGE_SIZE * 2));
    render(<PublicationsPage />);
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-total", "2");
  });

  it("shows 3 pages for 2 × PAGE_SIZE + 1 items", () => {
    mockPublications.length = 0;
    mockPublications.push(...buildMockPublications(PAGE_SIZE * 2 + 1));
    render(<PublicationsPage />);
    expect(screen.getByTestId("pagination")).toHaveAttribute("data-total", "3");
  });

  it("renders no pagination controls when totalPages is 1", () => {
    mockPublications.length = 0;
    mockPublications.push(...buildMockPublications(PAGE_SIZE));
    render(<PublicationsPage />);
    expect(screen.queryByTestId("pagination")).toBeNull();
  });
});
