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
  role: "PhD Researcher · Earth Observation · Climate Solutions",
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

  it("applies motion-item-initial class to animated sections for no-JS fallback", () => {
    const { container } = render(<AboutHero profile={mockProfile} />);
    const motionItems = container.querySelectorAll(".motion-item-initial");
    // Hero container, portrait, text block, and biography all get the class
    expect(motionItems.length).toBe(4);
  });

  it("does not apply inline opacity-0 styles from Motion initial state", () => {
    const { container } = render(<AboutHero profile={mockProfile} />);
    const motionItems = container.querySelectorAll(".motion-item-initial");
    motionItems.forEach((item) => {
      expect(item).not.toHaveStyle({ opacity: "0" });
    });
  });

  it("renders name with profile-name class immediately (no hidden state)", () => {
    const { container } = render(<AboutHero profile={mockProfile} />);
    const nameEl = container.querySelector(".profile-name");
    expect(nameEl).toBeInTheDocument();
    expect(nameEl).toHaveTextContent(mockProfile.name);
    // Parent MotionDiv has motion-item-initial, but the name itself is
    // inside a child element and should be readable
  });

  it("has h1 with person name", () => {
    render(<AboutHero profile={mockProfile} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(mockProfile.name);
  });

  it("renders the researcher name with profile-name display class", () => {
    render(<AboutHero profile={mockProfile} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("profile-name");
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

  it("section does not use card wrapper background (floats on page surface)", () => {
    const { container } = render(<AboutHero profile={mockProfile} />);
    const section = container.querySelector("section");
    expect(section).not.toHaveClass("bg-surface-card");
    expect(section).not.toHaveClass("rounded-2xl");
  });

  it("role text uses semantic text-secondary token for both themes", () => {
    const { container } = render(<AboutHero profile={mockProfile} />);
    const roleEl = container.querySelector("p.mt-2");
    expect(roleEl).toHaveClass("text-text-secondary");
  });

  describe("biography image overflow protection", () => {
    it("prose images have max-w-full to prevent overflow on narrow screens", () => {
      const { container } = render(<AboutHero profile={mockProfile} />);
      const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
        d.className.includes("prose"),
      );
      const className = proseDiv?.className || "";
      expect(className).toMatch(/prose-img:max-w-full/);
    });

    it("prose images have rounded-lg corners", () => {
      const { container } = render(<AboutHero profile={mockProfile} />);
      const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
        d.className.includes("prose"),
      );
      const className = proseDiv?.className || "";
      expect(className).toMatch(/prose-img:rounded-lg/);
    });
  });

  describe("biography prose color consistency", () => {
    it("prose headings have explicit text-text-primary color for both themes", () => {
      const { container } = render(<AboutHero profile={mockProfile} />);
      const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
        d.className.includes("prose"),
      );
      const className = proseDiv?.className || "";
      expect(className).toMatch(/prose-headings:text-text-primary/);
    });

    it("prose links have explicit text-link color for both themes", () => {
      const { container } = render(<AboutHero profile={mockProfile} />);
      const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
        d.className.includes("prose"),
      );
      const className = proseDiv?.className || "";
      expect(className).toMatch(/prose-a:text-link/);
    });

    it("prose strong elements have explicit text-text-primary color for both themes", () => {
      const { container } = render(<AboutHero profile={mockProfile} />);
      const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
        d.className.includes("prose"),
      );
      const className = proseDiv?.className || "";
      expect(className).toMatch(/prose-strong:text-text-primary/);
      expect(className).not.toMatch(/dark:prose-strong/);
    });
  });

  // ---------------------------------------------------------------------------
  // Phase 3: Portrait scale animation fix
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Phase 4: Switch from mount-triggered animate to scroll-triggered whileInView
  // ---------------------------------------------------------------------------

  describe("scroll-triggered reveal (whileInView, not animate)", () => {
    it("does not apply mount-triggered animate that could flash content before Motion hydrates", () => {
      const { container } = render(<AboutHero profile={mockProfile} />);
      // With initial={false}, the hero's MotionDiv defers opacity to CSS
      // (.motion-item-initial). Under html[data-js], CSS applies opacity-0,
      // but in the test environment (no data-js), content must be visible.
      const heroMotionDiv = container.querySelector(
        ".motion-item-initial.flex.flex-col",
      );
      expect(heroMotionDiv).toBeInTheDocument();
      expect(heroMotionDiv).not.toHaveStyle({ opacity: "0" });
    });

    it("portrait wrapper uses whileInView semantics (no inline opacity-0 from Motion initial)", () => {
      const { container } = render(<AboutHero profile={mockProfile} />);
      const portraitWrapper = container.querySelector(
        ".motion-portrait-initial",
      );
      expect(portraitWrapper).toBeInTheDocument();
      expect(portraitWrapper).not.toHaveStyle({ opacity: "0" });
    });
  });

  describe("portrait scale initial state", () => {
    it("applies motion-portrait-initial class to the portrait wrapper for CSS scale fallback", () => {
      const { container } = render(<AboutHero profile={mockProfile} />);
      const portraitWrapper = container.querySelector(
        ".motion-portrait-initial",
      );
      expect(portraitWrapper).toBeInTheDocument();
      expect(portraitWrapper).toHaveClass("motion-item-initial");
    });

    it("portrait wrapper also has motion-item-initial for opacity fallback", () => {
      const { container } = render(<AboutHero profile={mockProfile} />);
      const portraitWrapper = container.querySelector(
        ".motion-portrait-initial",
      );
      expect(portraitWrapper).toHaveClass("motion-item-initial");
    });

    it("profile image has sizes matching class-based rendered dimensions", () => {
      render(<AboutHero profile={mockProfile} />);
      const img = screen.getByAltText(`Profile picture of ${mockProfile.name}`);
      // h-36 (144px) sm:h-48 (192px) md:h-60 (240px)
      expect(img).toHaveAttribute(
        "sizes",
        "(max-width: 640px) 144px, (max-width: 768px) 192px, 240px",
      );
    });
  });
});
