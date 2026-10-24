/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@academic-portfolio/utils/test-helpers/a11y";
import type { ResearchInterest } from "@academic-portfolio/content";

import { ResearchInterests } from "./ResearchInterests.js";

const mockResearchInterests: ResearchInterest[] = [
  {
    title: "Remote Sensing",
    description:
      "Satellite data analysis for environmental monitoring and vegetation indices.",
    icon: "🛰️",
  },
  {
    title: "Machine Learning",
    description: "Applying ML algorithms to large-scale geospatial datasets.",
    icon: "🤖",
  },
  {
    title: "Climate Science",
    description:
      "Studying climate change impacts on ecosystems and water resources.",
    icon: "🌍",
  },
];

describe("ResearchInterests", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(
      <ResearchInterests items={mockResearchInterests} />,
    );
    await expectNoA11yViolations(container);
  });

  it("renders all research interest items", () => {
    render(<ResearchInterests items={mockResearchInterests} />);

    expect(screen.getByText("Remote Sensing")).toBeInTheDocument();
    expect(screen.getByText("Machine Learning")).toBeInTheDocument();
    expect(screen.getByText("Climate Science")).toBeInTheDocument();
  });

  it("has h2 for Research Interests section", () => {
    render(<ResearchInterests items={mockResearchInterests} />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Research Interests & Expertise");
  });

  it("renders icons when provided", () => {
    render(<ResearchInterests items={mockResearchInterests} />);

    expect(screen.getByText("🛰️")).toBeInTheDocument();
    expect(screen.getByText("🤖")).toBeInTheDocument();
    expect(screen.getByText("🌍")).toBeInTheDocument();
  });

  it("renders descriptions for each interest", () => {
    render(<ResearchInterests items={mockResearchInterests} />);

    expect(
      screen.getByText(
        "Satellite data analysis for environmental monitoring and vegetation indices.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Applying ML algorithms to large-scale geospatial datasets.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Studying climate change impacts on ecosystems and water resources.",
      ),
    ).toBeInTheDocument();
  });

  it("renders empty grid when no items provided", () => {
    render(<ResearchInterests items={[]} />);

    expect(
      screen.getByText("Research Interests & Expertise"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Remote Sensing")).not.toBeInTheDocument();
  });

  it("uses semantic section element", () => {
    const { container } = render(
      <ResearchInterests items={mockResearchInterests} />,
    );
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });

  it("renders items in a grid layout", () => {
    const { container } = render(
      <ResearchInterests items={mockResearchInterests} />,
    );
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders cards with surface-elevated background", () => {
    const { container } = render(
      <ResearchInterests items={mockResearchInterests} />,
    );
    const cards = container.querySelectorAll(".bg-surface-elevated");
    expect(cards.length).toBe(mockResearchInterests.length);
  });

  it("renders cards with border styling", () => {
    const { container } = render(
      <ResearchInterests items={mockResearchInterests} />,
    );
    const cards = container.querySelectorAll(".border-border");
    expect(cards.length).toBe(mockResearchInterests.length);
  });

  it("handles items without icons", () => {
    const itemsWithoutIcons: ResearchInterest[] = [
      {
        title: "Data Science",
        description: "Statistical analysis and data visualization.",
      },
    ];
    render(<ResearchInterests items={itemsWithoutIcons} />);

    expect(screen.getByText("Data Science")).toBeInTheDocument();
    expect(
      screen.getByText("Statistical analysis and data visualization."),
    ).toBeInTheDocument();
  });

  it("uses text-text-primary for titles", () => {
    const { container } = render(
      <ResearchInterests items={mockResearchInterests} />,
    );
    const titleElements = container.querySelectorAll(".text-text-primary");
    expect(titleElements.length).toBeGreaterThan(0);
  });

  it("uses text-text-secondary for descriptions", () => {
    const { container } = render(
      <ResearchInterests items={mockResearchInterests} />,
    );
    const descElements = container.querySelectorAll(".text-text-secondary");
    expect(descElements.length).toBeGreaterThan(0);
  });
});
