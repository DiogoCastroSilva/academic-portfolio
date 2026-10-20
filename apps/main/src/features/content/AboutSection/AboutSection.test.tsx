/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@academic-portfolio/utils/test-helpers/a11y";
import type { ProfileData } from "@academic-portfolio/content";

import { AboutSection } from "./AboutSection.js";

const mockProfile: ProfileData = {
  name: "Dr. Jane Doe",
  role: "PhD Researcher | Earth Observation & Climate Solutions",
  description: "Climate researcher at Cornell University.",
  email: "jane@example.com",
  linkedInUrl: "https://linkedin.com/in/jane",
  githubUrl: "https://github.com/jane",
  location: "Ithaca, NY",
  image: "profile.svg",
  imageSrc: "/images/profile.svg",
  biography:
    "<p>I am a PhD researcher developing machine learning and remote sensing methods for climate change mitigation.</p>",
  education: [],
  researchInterests: [],
  skills: [],
};

describe("AboutSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the profile name as an h1 heading", () => {
    render(<AboutSection profile={mockProfile} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Dr. Jane Doe");
    expect(heading).toHaveClass("profile-name");
  });

  it("renders the role subtitle", () => {
    render(<AboutSection profile={mockProfile} />);

    const role = screen.getByText(
      "PhD Researcher | Earth Observation & Climate Solutions",
    );
    expect(role).toBeInTheDocument();
  });

  it("renders the profile image with descriptive alt text", () => {
    render(<AboutSection profile={mockProfile} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/profile.svg");
    expect(img).toHaveAttribute("alt", "Profile picture of Dr. Jane Doe");
  });

  it("renders the biography HTML content", () => {
    render(<AboutSection profile={mockProfile} />);

    const bioParagraph = screen.getByText(
      /I am a PhD researcher developing machine learning/,
    );
    expect(bioParagraph).toBeInTheDocument();
  });

  it("renders the 'About Me' section heading as h2", () => {
    render(<AboutSection profile={mockProfile} />);

    const subheading = screen.getByRole("heading", { level: 2 });
    expect(subheading).toHaveTextContent("About Me");
  });

  it("passes accessibility checks with profile image", async () => {
    const { container } = render(<AboutSection profile={mockProfile} />);

    await expectNoA11yViolations(container);
  });

  it("passes accessibility checks without email link", async () => {
    const noEmailProfile: ProfileData = {
      ...mockProfile,
      email: undefined,
    };
    const { container } = render(<AboutSection profile={noEmailProfile} />);

    await expectNoA11yViolations(container);
  });

  it("has a single h1 in the document outline", () => {
    render(<AboutSection profile={mockProfile} />);

    const h1Headings = screen.getAllByRole("heading", { level: 1 });
    expect(h1Headings).toHaveLength(1);
  });
});
