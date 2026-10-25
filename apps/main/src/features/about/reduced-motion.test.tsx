/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  EducationEntry,
  ProfileData,
  ResearchInterest,
  SkillCategory,
} from "@academic-portfolio/content";

import { AboutSection } from "../content/AboutSection/AboutSection.js";
import { AboutHero } from "./AboutHero/AboutHero.js";
import { EducationTimeline } from "./EducationTimeline/EducationTimeline.js";
import { ResearchInterests } from "./ResearchInterests/ResearchInterests.js";
import { SkillsGrid } from "./SkillsGrid/SkillsGrid.js";

// Mock useReducedMotion to return true, simulating a user who prefers
// reduced motion. This verifies the shouldReduceMotion path in each
// component — motion elements become plain div/span.
vi.mock("motion/react", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

const mockProfile: ProfileData = {
  name: "Dr. Jane Doe",
  role: "PhD Researcher",
  email: "jane@example.com",
  linkedInUrl: "https://linkedin.com/in/jane",
  githubUrl: "https://github.com/jane",
  location: "Ithaca, NY",
  image: "profile.svg",
  imageSrc: "/images/profile.svg",
  biography: "<p>Bio content.</p>",
  cvUrl: "https://example.com/cv.pdf",
  education: [],
  researchInterests: [],
  skills: [],
};

describe("Reduced motion support", () => {
  it("AboutHero renders correctly without animations", () => {
    render(<AboutHero profile={mockProfile} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Dr. Jane Doe",
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "About Me",
    );
  });

  it("AboutSection renders correctly without animations", () => {
    render(<AboutSection profile={mockProfile} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Dr. Jane Doe",
    );
  });

  it("EducationTimeline renders correctly without animations", () => {
    const items: EducationEntry[] = [
      {
        degree: "PhD",
        institution: "Cornell",
        period: "2024 – Present",
        focus: "Remote sensing",
        details: ["Item 1"],
      },
    ];
    render(<EducationTimeline items={items} />);
    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("PhD")).toBeInTheDocument();
  });

  it("ResearchInterests renders correctly without animations", () => {
    const items: ResearchInterest[] = [
      {
        title: "Remote Sensing",
        description: "EO data analysis",
        icon: "🛰️",
      },
    ];
    render(<ResearchInterests items={items} />);
    expect(
      screen.getByText("Research Interests & Expertise"),
    ).toBeInTheDocument();
    expect(screen.getByText("Remote Sensing")).toBeInTheDocument();
    expect(screen.getByText("🛰️")).toBeInTheDocument();
  });

  it("SkillsGrid renders correctly without animations", () => {
    const categories: SkillCategory[] = [
      { category: "Languages", items: ["Python", "R"] },
    ];
    render(<SkillsGrid categories={categories} />);
    expect(screen.getByText("Skills & Tools")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
  });
});

/**
 * Verify the centralized motion-config module exports consistent timing values.
 * These constants are shared across all motion components to ensure a
 * coherent animation language across the site.
 */
describe("Motion system consistency", () => {
  it("exports timing constants within design-guidance ranges", async () => {
    const config = await import("@/lib/motion-config.js");

    // Hero/intro: 500-700ms
    expect(config.MOTION_DURATION_HERO).toBeGreaterThanOrEqual(0.5);
    expect(config.MOTION_DURATION_HERO).toBeLessThanOrEqual(0.7);

    // Section reveals: 400-550ms
    expect(config.MOTION_DURATION_SECTION).toBeGreaterThanOrEqual(0.4);
    expect(config.MOTION_DURATION_SECTION).toBeLessThanOrEqual(0.55);

    // Sibling stagger: 70-100ms
    expect(config.MOTION_STAGGER).toBeGreaterThanOrEqual(0.07);
    expect(config.MOTION_STAGGER).toBeLessThanOrEqual(0.1);

    // Section offset: 16-20px
    expect(config.MOTION_OFFSET).toBeGreaterThanOrEqual(16);
    expect(config.MOTION_OFFSET).toBeLessThanOrEqual(20);
  });

  it("uses editorial easing curve for consistency", async () => {
    const config = await import("@/lib/motion-config.js");
    // Editorial ease-out cubic bezier, matching CSS --motion-ease-enter
    expect(config.MOTION_EASE_ENTER).toEqual([0.22, 1, 0.36, 1]);
  });
});
