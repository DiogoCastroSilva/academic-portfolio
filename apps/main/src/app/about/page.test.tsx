/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ProfileData } from "@academic-portfolio/content";

// Shared mock profile with skills
const mockProfile: ProfileData = {
  name: "Dr. Jane Doe",
  role: "PhD Researcher | Earth Observation",
  email: "test@example.com",
  linkedInUrl: "https://linkedin.com/in/test",
  githubUrl: "https://github.com/test",
  location: "Ithaca, NY",
  image: "profile.svg",
  imageSrc: "/images/profile.svg",
  biography: "<p>Brief bio.</p>",
  cvUrl: "https://example.com/cv.pdf",
  researchInterests: [],
  education: [],
  skills: [
    {
      category: "Programming",
      items: ["Python", "R"],
    },
  ],
};

// Mock dependencies
vi.mock("@academic-portfolio/content", () => ({
  getProfile: () => mockProfile,
  getFullUrl: () => "https://example.com/about/",
}));

vi.mock("../../configs/site-config", () => ({
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

vi.mock("../../features/about/AboutHero", () => ({
  AboutHero: () => <div data-testid="about-hero">About Hero</div>,
}));

vi.mock("../../features/about/EducationTimeline", () => ({
  EducationTimeline: () => (
    <div data-testid="education-timeline">Education</div>
  ),
}));

vi.mock("../../features/about/ResearchInterests", () => ({
  ResearchInterests: () => <div data-testid="research-interests">Research</div>,
}));

vi.mock("../../features/about/SkillsGrid", () => ({
  SkillsGrid: () => <div data-testid="skills-grid">Skills</div>,
}));

vi.mock("../../lib/JsonLd", () => ({
  JsonLd: () => null,
}));

vi.mock("../lib/og-image", () => ({
  ogImageRef: (path: string) => `/og/${path}`,
}));

vi.mock("../lib/structured-data", () => ({
  buildPersonSchema: () => ({}),
}));

// Import after mocks
import Index from "./page";

describe("AboutPage", () => {
  it("renders SkillsGrid when profile has skills", () => {
    render(<Index />);

    expect(screen.getByTestId("skills-grid")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
  });

  it("hides SkillsGrid when profile has no skills", () => {
    mockProfile.skills = [];

    render(<Index />);

    expect(screen.queryByTestId("skills-grid")).not.toBeInTheDocument();

    // Restore for other tests
    mockProfile.skills = [
      {
        category: "Programming",
        items: ["Python", "R"],
      },
    ];
  });

  it("always renders other about sections regardless of skills", () => {
    mockProfile.skills = [];
    render(<Index />);

    expect(screen.getByTestId("about-hero")).toBeInTheDocument();
    expect(screen.getByTestId("education-timeline")).toBeInTheDocument();
    expect(screen.getByTestId("research-interests")).toBeInTheDocument();

    // Restore
    mockProfile.skills = [
      {
        category: "Programming",
        items: ["Python", "R"],
      },
    ];
  });
});
