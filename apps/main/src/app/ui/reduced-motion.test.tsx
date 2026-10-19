/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  ProfileData,
  EducationEntry,
  ResearchInterest,
  SkillCategory,
} from "@katie-portfolio/content";

import { AboutHero } from "./AboutHero.js";
import { AboutSection } from "./AboutSection.js";
import { EducationTimeline } from "./EducationTimeline.js";
import { ResearchInterests } from "./ResearchInterests.js";
import { SkillsGrid } from "./SkillsGrid.js";

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
  image: "profile.jpeg",
  imageSrc: "/images/profile.jpeg",
  biography: "<p>Bio content.</p>",
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
