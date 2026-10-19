/** @vitest-environment happy-dom */
import "@testing-library/jest-dom";

import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ContentMeta } from "@katie-portfolio/content";
import { PAGE_SIZE } from "../../lib/pagination.js";

import PublicationsPage, { generateStaticParams } from "./page";

const mockPublications: ContentMeta[] = [
  {
    slug: "pub-0",
    href: "/publications/pub-0",
    title: "Pub 0",
    date: "2024-09-01",
    tags: ["test"],
    authors: ["Test Author"],
    venue: "Journal of Examples",
    imageSrc: "/publications/placeholder.svg",
    imageType: "cover" as const,
  },
];

vi.mock("@katie-portfolio/publications", () => ({
  getAllPublications: () => mockPublications,
  getPublicationContentBySlug: vi.fn(),
}));

vi.mock("@katie-portfolio/navigation", () => ({
  NavBar: () => null,
}));

vi.mock("../../configs/site-config", () => ({
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

describe("PublicationsPage generateStaticParams", () => {
  it("returns no pages when collection fits on one page", async () => {
    mockPublications.length = 0;
    const params = await generateStaticParams();
    expect(params).toEqual([]);
  });

  it("generates pages 2..N for multi-page collections", async () => {
    mockPublications.length = 0;
    mockPublications.push(
      ...Array.from({ length: PAGE_SIZE * 2 + 1 }, (_, i) => ({
        slug: `pub-${i}`,
        href: `/publications/pub-${i}`,
        title: `Publication ${i}`,
        date: "2024-01-01",
        tags: ["test"],
        authors: ["Test Author"],
        venue: "Journal of Examples",
        imageSrc: "/publications/placeholder.svg",
        imageType: "cover" as const,
      })),
    );
    const params = (await generateStaticParams()) as Array<{ page: string }>;
    const pageNumbers = params.map((p) => p.page);
    expect(pageNumbers).toEqual(["2", "3"]);
  });

  it("generates page 2 for exactly PAGE_SIZE + 1 items", async () => {
    mockPublications.length = 0;
    mockPublications.push(
      ...Array.from({ length: PAGE_SIZE + 1 }, (_, i) => ({
        slug: `pub-${i}`,
        href: `/publications/pub-${i}`,
        title: `Publication ${i}`,
        date: "2024-01-01",
        tags: ["test"],
        authors: ["Test Author"],
        venue: "Journal of Examples",
        imageSrc: "/publications/placeholder.svg",
        imageType: "cover" as const,
      })),
    );
    const params = (await generateStaticParams()) as Array<{ page: string }>;
    expect(params).toEqual([{ page: "2" }]);
  });
});

describe("PublicationsPage page rendering", () => {
  it("redirects page 1 to /publications/ via meta refresh", async () => {
    mockPublications.length = 0;
    mockPublications.push({
      slug: "pub-0",
      href: "/publications/pub-0",
      title: "Pub 0",
      date: "2024-09-01",
      tags: ["test"],
      authors: ["Test Author"],
      venue: "Journal of Examples",
      imageSrc: "/publications/placeholder.svg",
      imageType: "cover",
    });
    const result = await PublicationsPage({
      params: Promise.resolve({ page: "1" }),
    });
    expect(result).toBeDefined();
    expect((result as React.JSX.Element).type).toBe("meta");
    expect((result as React.JSX.Element).props["httpEquiv"]).toBe("refresh");
    expect((result as React.JSX.Element).props.content).toBe(
      "0;url=/publications/",
    );
  });

  it("renders correct items for page 2", async () => {
    mockPublications.length = 0;
    mockPublications.push(
      ...Array.from({ length: PAGE_SIZE + 3 }, (_, i) => ({
        slug: `pub-${i}`,
        href: `/publications/pub-${i}`,
        title: `Publication ${i}`,
        date: "2024-01-01",
        tags: ["test"],
        authors: ["Test Author"],
        venue: "Journal of Examples",
        imageSrc: "/publications/placeholder.svg",
        imageType: "cover" as const,
      })),
    );

    const result = await PublicationsPage({
      params: Promise.resolve({ page: "2" }),
    });
    const { container } = render(result);
    const articles = container.querySelectorAll("article");
    // Page 2 has 3 items (items 10-12 of 13 total)
    expect(articles).toHaveLength(3);
    expect(container.textContent).toContain("Publication 10");
    expect(container.textContent).toContain("Publication 12");
    expect(container.textContent).not.toContain("Publication 0");
  });

  it("throws NOT_FOUND for page beyond totalPages", async () => {
    mockPublications.length = 0;
    mockPublications.push({
      slug: "pub-0",
      href: "/publications/pub-0",
      title: "Pub 0",
      date: "2024-09-01",
      tags: ["test"],
      authors: ["Test Author"],
      venue: "Journal of Examples",
      imageSrc: "/publications/placeholder.svg",
      imageType: "cover",
    });

    await expect(
      PublicationsPage({ params: Promise.resolve({ page: "5" }) }),
    ).rejects.toThrow("NOT_FOUND");
  });
});
