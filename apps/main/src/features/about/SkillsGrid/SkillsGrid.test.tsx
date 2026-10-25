/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@academic-portfolio/utils/test-helpers/a11y";
import type { SkillCategory } from "@academic-portfolio/content";

import { SkillsGrid } from "./SkillsGrid.js";

const mockCategories: SkillCategory[] = [
  {
    category: "Geospatial & Remote Sensing",
    items: ["ENVI/IDL", "ArcGIS"],
  },
  {
    category: "Data Science & Analysis",
    items: ["Python", "R", "Machine Learning"],
  },
];

describe("SkillsGrid accessibility", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<SkillsGrid categories={mockCategories} />);
    await expectNoA11yViolations(container);
  });

  it("has section with heading", () => {
    render(<SkillsGrid categories={mockCategories} />);

    const heading = screen.getByText("Skills & Tools");
    const section = heading.closest("section");
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe("SECTION");
  });

  it("has heading level 2 for main heading", () => {
    render(<SkillsGrid categories={mockCategories} />);

    const mainHeading = screen.getByRole("heading", { level: 2 });
    expect(mainHeading).toHaveTextContent("Skills & Tools");
  });

  it("has heading level 3 for categories", () => {
    render(<SkillsGrid categories={mockCategories} />);

    const categoryHeadings = screen.getAllByRole("heading", {
      level: 3,
    });
    expect(categoryHeadings.length).toBeGreaterThan(0);
    expect(categoryHeadings[0]).toHaveTextContent(
      "Geospatial & Remote Sensing",
    );
  });

  it("renders all skill categories", () => {
    render(<SkillsGrid categories={mockCategories} />);

    expect(screen.getByText("Geospatial & Remote Sensing")).toBeInTheDocument();
    expect(screen.getByText("Data Science & Analysis")).toBeInTheDocument();
  });

  it("renders individual skills", () => {
    render(<SkillsGrid categories={mockCategories} />);

    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("R")).toBeInTheDocument();
    expect(screen.getByText("Machine Learning")).toBeInTheDocument();
  });

  it("renders skill chips as plain span elements (not interactive motion components)", () => {
    const { container } = render(<SkillsGrid categories={mockCategories} />);
    const chips = container.querySelectorAll(".rounded-full");
    expect(chips.length).toBeGreaterThan(0);
    // Chips should be span elements, not buttons or links
    chips.forEach((chip) => {
      expect(chip.tagName).toBe("SPAN");
    });
  });
});
