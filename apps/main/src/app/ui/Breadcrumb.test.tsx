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

  it("applies truncation classes to breadcrumb items for long titles", () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          {
            label:
              "Very Long Blog Post Title That Would Overflow On Mobile Screens",
            href: "/blog/long",
          },
        ]}
      />,
    );

    const items = container.querySelectorAll("li");
    items.forEach((li) => {
      // min-w-0 allows the flex child to shrink below content min-width
      expect(li.className).toMatch(/min-w-0/);
    });

    // All links and spans should have truncate + responsive max-width
    const links = container.querySelectorAll("a, span[aria-current='page']");
    links.forEach((el) => {
      expect(el.className).toMatch(/truncate/);
      expect(el.className).toMatch(/max-w-/);
    });
  });

  it("shows full title when it fits (truncate only hides overflow)", () => {
    render(
      <Breadcrumb
        items={[{ label: "Short", href: "/" }, { label: "Project" }]}
      />,
    );

    const current = screen.getByText("Project");
    // truncate is present so long titles will be cut with ellipsis
    expect(current.className).toMatch(/truncate/);
    expect(current.textContent).toBe("Project");
    // aria-current still set
    expect(current).toHaveAttribute("aria-current", "page");
  });
});
