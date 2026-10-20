/**
 * @vitest-environment happy-dom
 */

import "@testing-library/jest-dom";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Breadcrumb } from "./Breadcrumb.js";

describe("Breadcrumb", () => {
  it("renders all items with chevron separators", () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects/" },
          { label: "My Project" },
        ]}
      />,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("My Project")).toBeInTheDocument();

    // Chevron separators (aria-hidden SVGs)
    const chevrons = container.querySelectorAll("svg");
    expect(chevrons).toHaveLength(2);
  });

  it("marks the last item as aria-current page", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Projects", href: "/projects/" },
          { label: "My Project" },
        ]}
      />,
    );

    const current = screen.getByText("My Project");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("renders links for items with href, plain text for the last", () => {
    render(
      <Breadcrumb
        items={[{ label: "Projects", href: "/projects/" }, { label: "Detail" }]}
      />,
    );

    const link = screen.getByRole("link", { name: "Projects" });
    expect(link).toHaveAttribute("href", "/projects/");
  });

  it("has an accessible nav label", () => {
    const { container } = render(<Breadcrumb items={[{ label: "Home" }]} />);
    const nav = container.querySelector("nav");
    expect(nav).toHaveAttribute("aria-label", "Breadcrumb");
  });
});
