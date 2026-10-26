/** @vitest-environment happy-dom */
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ContentMeta } from "@academic-portfolio/content";
import { expectNoA11yViolations } from "@academic-portfolio/utils/test-helpers/a11y";

import {
  FeaturedProjectsSection,
  sectionVariants,
} from "./FeaturedProjectsSection.js";

const leadProject: ContentMeta = {
  slug: "lead-project",
  href: "/projects/lead-project",
  title: "Lead Research Project",
  date: "2024-06-15",
  tags: ["research", "visualization"],
  excerpt: "A groundbreaking analysis of environmental patterns.",
  imageSrc: "/projects/lead-project/cover.webp",
  imageType: "cover",
  selected: true,
};

const supportingProject: ContentMeta = {
  slug: "supporting-project",
  href: "/projects/supporting-project",
  title: "Supporting Study",
  date: "2023-09-01",
  tags: ["analysis"],
  excerpt: "A companion analysis.",
  imageSrc: "/projects/supporting-project/cover.webp",
  imageType: "cover",
  selected: true,
};

const thirdProject: ContentMeta = {
  slug: "third-project",
  href: "/projects/third-project",
  title: "Third Featured Project",
  date: "2023-01-15",
  tags: ["methods"],
  imageSrc: "/projects/third-project/cover.webp",
  imageType: "cover",
  selected: true,
};

const fourthProject: ContentMeta = {
  slug: "fourth-project",
  href: "/projects/fourth-project",
  title: "Fourth Featured Project",
  date: "2022-06-10",
  tags: ["extra"],
  imageSrc: "/projects/fourth-project/cover.webp",
  imageType: "cover",
  selected: true,
};

describe("FeaturedProjectsSection accessibility", () => {
  it("has no accessibility violations with lead + supporting items", async () => {
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject, supportingProject]}
        hrefPrefix="/projects"
      />,
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with single item", async () => {
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject]}
        hrefPrefix="/projects"
      />,
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with three items (max)", async () => {
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject, supportingProject, thirdProject]}
        hrefPrefix="/projects"
      />,
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations with items missing optional fields", async () => {
    const minimalItem: ContentMeta = {
      slug: "minimal",
      href: "/projects/minimal",
      title: "Minimal Project",
      date: "2024-01-01",
      imageSrc: "/projects/minimal/cover.webp",
      imageType: "cover",
      selected: true,
    };
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[minimalItem]}
        hrefPrefix="/projects"
      />,
    );
    await expectNoA11yViolations(container);
  });
});

describe("FeaturedProjectsSection rendering", () => {
  it("returns null when items is empty", () => {
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[]}
        hrefPrefix="/projects"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the heading with correct text and id", () => {
    render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject]}
        hrefPrefix="/projects"
      />,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Featured");
    expect(heading).toHaveAttribute("id", "featured-projects-heading");
  });

  it("renders lead project title", () => {
    render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject]}
        hrefPrefix="/projects"
      />,
    );
    expect(screen.getByText("Lead Research Project")).toBeInTheDocument();
  });

  it("renders lead project excerpt", () => {
    render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject]}
        hrefPrefix="/projects"
      />,
    );
    expect(
      screen.getByText("A groundbreaking analysis of environmental patterns."),
    ).toBeInTheDocument();
  });

  it("renders lead project year from date", () => {
    render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject]}
        hrefPrefix="/projects"
      />,
    );
    expect(screen.getByText("2024")).toBeInTheDocument();
  });

  it("does not render excerpt when absent", () => {
    const noExcerpt = { ...leadProject };
    delete noExcerpt.excerpt;
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[noExcerpt]}
        hrefPrefix="/projects"
      />,
    );
    expect(container.textContent).not.toContain("A groundbreaking analysis");
  });

  it("does not render year when date is absent", () => {
    const noDate = { ...leadProject };
    delete noDate.date;
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[noDate]}
        hrefPrefix="/projects"
      />,
    );
    expect(container.textContent).not.toContain("2024");
  });

  it("renders supporting project titles", () => {
    render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject, supportingProject]}
        hrefPrefix="/projects"
      />,
    );
    expect(screen.getByText("Supporting Study")).toBeInTheDocument();
  });

  it("limits supporting projects to 2 (ignores extras)", () => {
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject, supportingProject, thirdProject, fourthProject]}
        hrefPrefix="/projects"
      />,
    );
    // Lead + 2 supporting = 3 articles total; 4th is ignored
    const articles = container.querySelectorAll("article");
    expect(articles).toHaveLength(3);
    // Fourth project title should NOT be rendered
    expect(container.textContent).not.toContain("Fourth Featured Project");
  });

  it("renders link to project detail page", () => {
    render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject]}
        hrefPrefix="/projects"
      />,
    );
    const link = screen.getByLabelText("View project: Lead Research Project");
    expect(link).toHaveAttribute("href", "/projects/lead-project/");
  });
});

describe("FeaturedProjectsSection progressive enhancement", () => {
  it("applies motion-item-initial class to the section for no-JS fallback", () => {
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject]}
        hrefPrefix="/projects"
      />,
    );
    const section = container.querySelector("section");
    expect(section).toHaveClass("motion-item-initial");
  });

  it("does not apply inline opacity-0 from Motion initial state", () => {
    const { container } = render(
      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={[leadProject]}
        hrefPrefix="/projects"
      />,
    );
    const section = container.querySelector("section");
    expect(section).not.toHaveStyle({ opacity: "0" });
    expect(section).not.toHaveStyle({ opacity: 0 });
  });

  it("exports sectionVariants whose visible state sets opacity:1 to override CSS motion-item-initial", () => {
    // Regression guard: sectionVariants.visible MUST include `opacity: 1`
    // so that Motion's `whileInView` applies an inline style overriding the
    // CSS `.motion-item-initial` opacity-0 (under html[data-js]).
    // Previously `visible` only had `transition` — no opacity reset — which
    // left the section invisible to any user with JS enabled.
    expect(sectionVariants.visible).toHaveProperty("opacity", 1);
    expect(sectionVariants.visible).toHaveProperty("y", 0);
  });
});
