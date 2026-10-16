/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@katie-portfolio/utils/test-helpers/a11y";

import { AboutHero } from "./AboutHero.js";

// Mock next/link for happy-dom environment
vi.mock("next/link", () => ({
  default: function MockLink({
    children,
    href,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: () => void;
  }) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  },
}));

// Mock the profile image
vi.mock("../../assets/profile.jpeg", () => ({
  default: "/assets/profile.jpeg",
}));

describe("AboutHero accessibility", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<AboutHero email="test@example.com" />);
    await expectNoA11yViolations(container);
  });

  it("has h1 with person name", () => {
    render(<AboutHero email="test@example.com" />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Kathleen Miller");
  });

  it("has h2 for About Me section", () => {
    render(<AboutHero email="test@example.com" />);

    const subheading = screen.getByRole("heading", { level: 2 });
    expect(subheading).toHaveTextContent("About Me");
  });

  it("has accessible contact link with mailto", () => {
    render(<AboutHero email="test@example.com" />);

    const contactLink = screen.getByRole("link", { name: "Get in Touch" });
    expect(contactLink).toHaveAttribute("href", "mailto:test@example.com");
  });

  it("has descriptive alt text for profile image", () => {
    render(<AboutHero email="test@example.com" />);

    const img = screen.getByAltText("Profile picture of Kathleen Miller");
    expect(img).toBeInTheDocument();
  });
});
