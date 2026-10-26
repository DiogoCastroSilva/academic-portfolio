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
  role: "PhD Researcher · Earth Observation · Climate Solutions",
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
      "PhD Researcher · Earth Observation · Climate Solutions",
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

  it("does not render an 'About Me' section heading", () => {
    render(<AboutSection profile={mockProfile} />);

    const h2Headings = screen.queryByRole("heading", { level: 2 });
    expect(h2Headings).not.toBeInTheDocument();
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

  describe("layout: portrait and text positioning", () => {
    it("text container uses flex-col so name, role, and bio stack vertically", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);

      /* The text container is the second <div> inside the outer flex.
         It must use flex-col so that <h1>, <p> (role), and the bio <div>
         stack vertically instead of sitting side-by-side in a row. */
      const outerFlex = container.querySelector(
        ".animate-fadeInUp",
      ) as HTMLElement;
      const children = Array.from(outerFlex.children);
      const textContainer = children[1] as HTMLElement;
      expect(textContainer.className).toMatch(/flex-col/);
    });

    it("portrait container does not use md:order-2 (which would place it on the LEFT in desktop)", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);

      /* With md:flex-row-reverse, any md:order overrides would swap
         the portrait to the wrong side. The portrait must rely on
         natural DOM order so flex-row-reverse places it on the RIGHT. */
      const portraitContainer = Array.from(
        container.querySelectorAll("div"),
      ).find((d) => d.querySelector("img")) as HTMLElement;
      expect(portraitContainer.className).not.toMatch(/md:order-2/);
    });

    it("portrait appears first in DOM order (before text) for correct flex-row-reverse visual", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);

      const outerFlex = container.querySelector(
        ".animate-fadeInUp",
      ) as HTMLElement;
      const children = Array.from(outerFlex.children);
      const firstChildHasImage = (children[0] as HTMLElement).querySelector(
        "img",
      );
      const secondChildHasName = (children[1] as HTMLElement).querySelector(
        ".profile-name",
      );
      expect(firstChildHasImage).toBeInTheDocument();
      expect(secondChildHasName).toBeInTheDocument();
    });

    it("uses md:flex-row-reverse for desktop two-column layout (portrait on right)", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);

      const outerFlex = container.querySelector(
        ".animate-fadeInUp",
      ) as HTMLElement;
      expect(outerFlex.className).toMatch(/md:flex-row-reverse/);
    });
  });

  describe("biography prose color consistency", () => {
    it("prose headings have explicit text-text-primary color for both themes", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);
      const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
        d.className.includes("prose"),
      );
      const className = proseDiv?.className || "";
      expect(className).toMatch(/prose-headings:text-text-primary/);
    });

    it("prose links have explicit text-link color for both themes", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);
      const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
        d.className.includes("prose"),
      );
      const className = proseDiv?.className || "";
      expect(className).toMatch(/prose-a:text-link/);
    });

    it("prose strong elements have explicit text-text-primary color for both themes", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);
      const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
        d.className.includes("prose"),
      );
      const className = proseDiv?.className || "";
      expect(className).toMatch(/prose-strong:text-text-primary/);
      expect(className).not.toMatch(/dark:prose-strong/);
    });
  });

  describe("biography image overflow protection", () => {
    it("prose images have max-w-full to prevent overflow on narrow screens", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);
      const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
        d.className.includes("prose"),
      );
      const className = proseDiv?.className || "";
      expect(className).toMatch(/prose-img:max-w-full/);
    });

    it("prose images have rounded-lg corners", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);
      const proseDiv = Array.from(container.querySelectorAll("div")).find((d) =>
        d.className.includes("prose"),
      );
      const className = proseDiv?.className || "";
      expect(className).toMatch(/prose-img:rounded-lg/);
    });
  });

  describe("hero composition and scroll cue", () => {
    it("section has a responsive min-height that fills the desktop viewport", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);
      const section = container.querySelector("section");
      expect(section?.className).toMatch(/md:min-h-\[calc\(100svh-4rem\)\]/);
    });

    it("renders a scroll cue link pointing to the projects section", () => {
      render(<AboutSection profile={mockProfile} />);
      const cue = screen.getByTestId("scroll-cue");
      expect(cue).toHaveAttribute("href", "#projects-heading");
    });

    it("scroll cue has accessible label", () => {
      render(<AboutSection profile={mockProfile} />);
      const cue = screen.getByLabelText("Scroll down to explore selected work");
      expect(cue).toBeInTheDocument();
    });

    it("scroll cue contains visible text", () => {
      render(<AboutSection profile={mockProfile} />);
      expect(screen.getByText("Explore selected work")).toBeInTheDocument();
    });

    it("scroll cue is hidden from reduced motion animation but remains visible", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);
      const cue = container.querySelector('[data-testid="scroll-cue"]');
      expect(cue?.className).toMatch(/motion-reduce:animate-none/);
    });
  });

  // ---------------------------------------------------------------------------
  // Phase 3: Image sizes match class-based rendered dimensions
  // ---------------------------------------------------------------------------

  describe("image sizes accuracy", () => {
    it("profile image sizes match class-based dimensions (144px/192px/256px)", () => {
      render(<AboutSection profile={mockProfile} />);
      const img = screen.getByRole("img");
      // Classes: h-36 (144px) sm:h-48 (192px) md:h-64 (256px)
      expect(img).toHaveAttribute(
        "sizes",
        "(max-width: 640px) 144px, (max-width: 768px) 192px, 256px",
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Phase 3: No-JS integration — content visible without JavaScript
  // ---------------------------------------------------------------------------

  describe("progressive enhancement / no-JS fallback", () => {
    it("does not use Motion client components (CSS-only animation)", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);

      // AboutSection uses CSS animate-fadeInUp, not motion/react.
      // It should not have any data-framer attributes (Motion markers).
      const framerElements = container.querySelectorAll("[data-framer]");
      expect(framerElements.length).toBe(0);
    });

    it("content is immediately visible — no opacity-0 from Motion initial state", () => {
      const { container } = render(<AboutSection profile={mockProfile} />);

      // The hero wrapper uses animate-fadeInUp (CSS), not Motion.
      // Without JS, there should be no hidden/opacity-0 elements.
      const hiddenElements = container.querySelectorAll(
        "[style*='opacity: 0'], [style*='opacity:0']",
      );
      expect(hiddenElements.length).toBe(0);
    });

    it("profile name and role are rendered in the DOM immediately", () => {
      render(<AboutSection profile={mockProfile} />);

      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.role)).toBeInTheDocument();
    });
  });
});
