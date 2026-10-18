/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@katie-portfolio/utils/test-helpers/a11y";
import type { ContentMeta, ProfileData } from "@katie-portfolio/content";

// Mock content libraries to isolate page-level structure.
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
  researchInterests: [
    {
      title: "Remote Sensing",
      description: "Satellite imagery analysis.",
      icon: "🛰️",
    },
  ],
  education: [
    {
      degree: "PhD in Environmental Science",
      institution: "Cornell University",
      period: "2020–2026",
      focus: "Remote sensing of vegetation",
      details: ["Specialization in hyperspectral analysis"],
    },
  ],
  skills: [
    {
      category: "Data Science",
      items: ["Python", "R"],
    },
  ],
};

const mockProjects: ContentMeta[] = [
  {
    slug: "test-project",
    href: "/projects/test-project",
    title: "Test Project",
    date: "2024-01-15",
    tags: ["TypeScript"],
    excerpt: "A test project.",
    imageSrc: "/projects/test-project/cover.webp",
    imageType: "cover",
  },
];

// Mock the navigation module's NavBar (it uses server-only imports).
vi.mock("@katie-portfolio/navigation", () => ({
  NavBar: () => <nav aria-label="navigation">Nav</nav>,
}));

// Mock the site-config module (it uses process.env).
vi.mock("../configs/site-config", () => ({
  siteConfig: {
    name: "Kathleen Miller",
    linkedInUrl: "https://linkedin.com/in/test",
    githubUrl: "https://github.com/test",
    email: "test@example.com",
    contentLicenseName: "CC BY-NC-ND 4.0",
    contentLicenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    repoLicenseName: "MIT",
    repoLicenseUrl: "https://opensource.org/licenses/MIT",
    deploymentUrl: undefined,
    analytics: {
      cloudflare: {
        token: "test-token",
        enabled: false,
      },
    },
  },
}));

vi.mock("@katie-portfolio/projects", () => ({
  getAllProjects: () => mockProjects,
  getProjectContentBySlug: vi.fn(),
}));

vi.mock("@katie-portfolio/publications", () => ({
  getAllPublications: () => [],
  getPublicationContentBySlug: vi.fn(),
}));

vi.mock("@katie-portfolio/content", () => ({
  getProfile: () => mockProfile,
  getDeploymentUrl: () => undefined,
  getFullUrl: () => undefined,
  getFullAssetUrl: () => undefined,
  resolveImage: (slug: string, filename?: string) =>
    filename ? `/${slug}/${filename}` : `/${slug}/cover.webp`,
}));

// Import page components after mocks are set up.
import Index from "./page";
import AboutPage from "./about/page";
import ProjectsPage from "./projects/page";
import PublicationsPage from "./publications/page";

describe("Landmark: no duplicate <main> elements", () => {
  it("homepage uses <div> not <main> (nav layout provides <main>)", async () => {
    const { container } = render(<Index />);
    await expectNoA11yViolations(container);
    const mains = container.querySelectorAll("main");
    expect(mains).toHaveLength(0);
  });

  it("about page uses <div> not <main>", async () => {
    const { container } = render(<AboutPage />);
    await expectNoA11yViolations(container);
    const mains = container.querySelectorAll("main");
    expect(mains).toHaveLength(0);
  });

  it("projects listing uses <div> not <main>", () => {
    const { container } = render(<ProjectsPage />);
    const mains = container.querySelectorAll("main");
    expect(mains).toHaveLength(0);
  });

  it("publications listing uses <div> not <main>", () => {
    const { container } = render(<PublicationsPage />);
    const mains = container.querySelectorAll("main");
    expect(mains).toHaveLength(0);
  });
});
