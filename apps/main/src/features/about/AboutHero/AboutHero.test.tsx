/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@academic-portfolio/utils/test-helpers/a11y";
import type { ProfileData } from "@academic-portfolio/content";

import { AboutHero } from "./AboutHero.js";

const mockProfile: ProfileData = {
  name: "Dr. Jane Doe",
  role: "PhD Researcher | Earth Observation | Climate Solutions",
  email: "jane.doe@example.com",
  linkedInUrl: "https://www.linkedin.com/in/jane-doe/",
  githubUrl: "https://github.com/jane-doe",
  location: "Ithaca, NY",
  image: "profile.svg",
  imageSrc: "/images/profile.svg",
  biography: "<p>Biography content.</p>",
  cvUrl: "https://example.com/cv.pdf",
  education: [],
  researchInterests: [],
  skills: [],
};

describe("AboutHero accessibility", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<AboutHero profile={mockProfile} />);
    await expectNoA11yViolations(container);
  });

  it("has h1 with person name", () => {
    render(<AboutHero profile={mockProfile} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(mockProfile.name);
  });

  it("has h2 for About Me section", () => {
    render(<AboutHero profile={mockProfile} />);

    const subheading = screen.getByRole("heading", { level: 2 });
    expect(subheading).toHaveTextContent("About Me");
  });

  it("has accessible contact link with mailto", () => {
    render(<AboutHero profile={mockProfile} />);

    const contactLink = screen.getByRole("link", { name: "Get in Touch" });
    expect(contactLink).toHaveAttribute("href", `mailto:${mockProfile.email}`);
  });

  it("has a CV link with accessible name and new-tab behavior", () => {
    render(<AboutHero profile={mockProfile} />);

    const cvLink = screen.getByRole("link", { name: "View CV (PDF)" });
    expect(cvLink).toHaveAttribute("href", "https://example.com/cv.pdf");
    expect(cvLink).toHaveAttribute("target", "_blank");
    expect(cvLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not render a CV link when cvUrl is undefined", () => {
    const noCvProfile: ProfileData = {
      ...mockProfile,
      cvUrl: undefined,
    };
    render(<AboutHero profile={noCvProfile} />);

    expect(
      screen.queryByRole("link", { name: "View CV (PDF)" }),
    ).not.toBeInTheDocument();
  });

  it("has descriptive alt text for profile image", () => {
    render(<AboutHero profile={mockProfile} />);

    const img = screen.getByAltText(`Profile picture of ${mockProfile.name}`);
    expect(img).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // Phase 3: Surface consistency
  // ---------------------------------------------------------------------------

  it("section uses semantic surface token for consistent surfaces", () => {
    const { container } = render(<AboutHero profile={mockProfile} />);
    const section = container.querySelector("section");
    expect(section).toHaveClass("bg-surface-card");
  });

  it("role text uses semantic text-secondary token for both themes", () => {
    const { container } = render(<AboutHero profile={mockProfile} />);
    const roleEl = container.querySelector("p.mt-2");
    expect(roleEl).toHaveClass("text-text-secondary");
  });
});
