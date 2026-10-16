/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@katie-portfolio/utils/test-helpers/a11y";

import { Footer } from "./Footer.js";

// Mock the site config since it uses process.env
vi.mock("../../configs/site-config", () => ({
  siteConfig: {
    name: "Kathleen Miller",
    linkedInUrl: "https://www.linkedin.com/in/test",
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

describe("Footer accessibility", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<Footer />);
    await expectNoA11yViolations(container);
  });

  it("has a footer role", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("has accessible external links with proper attributes", () => {
    render(<Footer />);

    const linkedinLink = screen.getByRole("link", { name: "LinkedIn" });
    expect(linkedinLink).toHaveAttribute("target", "_blank");
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("has accessible email link", () => {
    render(<Footer />);

    const emailLink = screen.getByRole("link", { name: "Email" });
    expect(emailLink).toHaveAttribute("href", "mailto:test@example.com");
  });

  it("displays copyright with current year", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear}`)),
    ).toBeInTheDocument();
  });
});
