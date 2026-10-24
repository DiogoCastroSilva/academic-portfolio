/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@academic-portfolio/utils/test-helpers/a11y";
import type { EducationEntry } from "@academic-portfolio/content";

import { EducationTimeline } from "./EducationTimeline.js";

const mockEducation: EducationEntry[] = [
  {
    degree: "Ph.D. in Environmental Science",
    institution: "University of Example",
    period: "2020–2024",
    focus: "Remote sensing of vegetation dynamics",
    details: [
      "Developed novel NDVI analysis methods",
      "Published 3 peer-reviewed papers",
      "Teaching assistant for remote sensing course",
    ],
  },
  {
    degree: "M.S. in Geospatial Analysis",
    institution: "State University",
    period: "2018–2020",
    focus: "GIS and spatial statistics",
    details: [
      "Thesis on urban heat island effects",
      "GIS certification obtained",
    ],
  },
];

describe("EducationTimeline", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<EducationTimeline items={mockEducation} />);
    await expectNoA11yViolations(container);
  });

  it("renders all education items", () => {
    render(<EducationTimeline items={mockEducation} />);

    expect(
      screen.getByText("Ph.D. in Environmental Science"),
    ).toBeInTheDocument();
    expect(screen.getByText("University of Example")).toBeInTheDocument();
    expect(screen.getByText("2020–2024")).toBeInTheDocument();
    expect(screen.getByText("M.S. in Geospatial Analysis")).toBeInTheDocument();
    expect(screen.getByText("State University")).toBeInTheDocument();
  });

  it("has h2 for Education section", () => {
    render(<EducationTimeline items={mockEducation} />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Education");
  });

  it("renders degree as h3", () => {
    render(<EducationTimeline items={mockEducation} />);

    const degreeHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(degreeHeadings).toHaveLength(2);
    expect(degreeHeadings[0]).toHaveTextContent(
      "Ph.D. in Environmental Science",
    );
    expect(degreeHeadings[1]).toHaveTextContent("M.S. in Geospatial Analysis");
  });

  it("renders all detail items for each education entry", () => {
    render(<EducationTimeline items={mockEducation} />);

    expect(
      screen.getByText("Developed novel NDVI analysis methods"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Published 3 peer-reviewed papers"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Teaching assistant for remote sensing course"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Thesis on urban heat island effects"),
    ).toBeInTheDocument();
  });

  it("renders empty timeline when no items provided", () => {
    render(<EducationTimeline items={[]} />);

    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.queryByText("Ph.D.")).not.toBeInTheDocument();
  });

  it("uses semantic section element", () => {
    const { container } = render(<EducationTimeline items={mockEducation} />);
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });

  it("renders timeline dots with accent color", () => {
    const { container } = render(<EducationTimeline items={mockEducation} />);
    const dots = container.querySelectorAll(".bg-accent");
    expect(dots.length).toBeGreaterThan(0);
  });

  it("renders timeline connector lines between items", () => {
    const { container } = render(<EducationTimeline items={mockEducation} />);
    const connectors = container.querySelectorAll(".bg-border");
    // Should have connector between the two items
    expect(connectors.length).toBeGreaterThan(0);
  });

  it("uses text-text-secondary for period and details", () => {
    const { container } = render(<EducationTimeline items={mockEducation} />);
    const textSecondaryElements = container.querySelectorAll(
      ".text-text-secondary",
    );
    expect(textSecondaryElements.length).toBeGreaterThan(0);
  });

  it("uses text-accent for institution and arrow icons", () => {
    const { container } = render(<EducationTimeline items={mockEducation} />);
    const accentElements = container.querySelectorAll(".text-accent");
    expect(accentElements.length).toBeGreaterThan(0);
  });
});
