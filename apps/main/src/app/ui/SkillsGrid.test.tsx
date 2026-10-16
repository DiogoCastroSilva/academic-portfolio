/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@katie-portfolio/utils/test-helpers/a11y";

import { SkillsGrid } from "./SkillsGrid.js";

describe("SkillsGrid accessibility", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<SkillsGrid />);
    await expectNoA11yViolations(container);
  });

  it("has section with heading", () => {
    render(<SkillsGrid />);

    const heading = screen.getByText("Skills & Tools");
    const section = heading.closest("section");
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe("SECTION");
  });

  it("has heading level 2 for main heading", () => {
    render(<SkillsGrid />);

    const mainHeading = screen.getByRole("heading", { level: 2 });
    expect(mainHeading).toHaveTextContent("Skills & Tools");
  });

  it("has heading level 3 for categories", () => {
    render(<SkillsGrid />);

    const categoryHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(categoryHeadings.length).toBeGreaterThan(0);
    expect(categoryHeadings[0]).toHaveTextContent(
      "Geospatial & Remote Sensing",
    );
  });

  it("renders all skill categories", () => {
    render(<SkillsGrid />);

    expect(screen.getByText("Geospatial & Remote Sensing")).toBeInTheDocument();
    expect(screen.getByText("Data Science & Analysis")).toBeInTheDocument();
    expect(screen.getByText("Scientific Communication")).toBeInTheDocument();
    expect(screen.getByText("Soft Skills")).toBeInTheDocument();
  });

  it("renders individual skills", () => {
    render(<SkillsGrid />);

    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
    expect(screen.getByText("Machine Learning")).toBeInTheDocument();
  });
});
