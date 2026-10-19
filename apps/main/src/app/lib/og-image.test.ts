import { describe, expect, it, vi } from "vitest";

import { generateOgImageSvg, ogImageRef, wrapText } from "./og-image";

vi.mock("@academic-portfolio/content", () => ({
  withPublicBasePath: (p: string) => p,
}));

describe("escapeXml", () => {
  it("escapes special XML characters in titles", () => {
    const svg = generateOgImageSvg({ title: "A & B < C > D" });
    expect(svg).toContain("A &amp; B &lt; C &gt; D");
    expect(svg).not.toContain("A & B");
  });

  it("escapes quotes and apostrophes", () => {
    const svg = generateOgImageSvg({ title: "\"quoted\" 'value'" });
    expect(svg).toContain("&quot;");
    expect(svg).toContain("&apos;");
  });
});

describe("wrapText", () => {
  it("returns short text as a single line", () => {
    const lines = wrapText("Short Title", 34);
    expect(lines).toEqual(["Short Title"]);
  });

  it("wraps long text at word boundaries", () => {
    const lines = wrapText(
      "This is a very long title that exceeds the limit",
      20,
    );
    expect(lines.length).toBeGreaterThan(1);
    lines.forEach((line) => {
      expect(line.length).toBeLessThanOrEqual(21); // word boundary can exceed by 1
    });
  });

  it("handles empty input gracefully", () => {
    const lines = wrapText("", 34);
    expect(lines).toEqual([]);
  });

  it("keeps single long word on its own line", () => {
    const lines = wrapText("supercalifragilisticexpialidocious", 20);
    expect(lines).toContain("supercalifragilisticexpialidocious");
  });
});

describe("generateOgImageSvg", () => {
  it("produces valid SVG with title text", () => {
    const svg = generateOgImageSvg({ title: "Test Title" });

    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(svg).toContain('<svg width="1200" height="630"');
    expect(svg).toContain("Test Title");
  });

  it("includes subtitle when provided", () => {
    const svg = generateOgImageSvg({
      title: "Main Title",
      subtitle: "A subtitle here",
    });

    expect(svg).toContain("A subtitle here");
  });

  it("omits subtitle section when not provided", () => {
    const svg = generateOgImageSvg({ title: "Only Title" });

    // Title should be present
    expect(svg).toContain("Only Title");
    // Should not contain empty subtitle text element
    expect(svg).not.toMatch(/<text[^>]*fill="#64748b">\s*<\/text>/);
  });

  it("uses custom dimensions when provided", () => {
    const svg = generateOgImageSvg({
      title: "Custom",
      width: 800,
      height: 400,
    });

    expect(svg).toContain('width="800" height="400"');
    expect(svg).toContain('viewBox="0 0 800 400"');
  });

  it("wraps long titles into multiple lines", () => {
    const longTitle =
      "A Very Long Title That Should Wrap Across Multiple Lines In The OG Image";
    const svg = generateOgImageSvg({ title: longTitle });

    // Should have multiple <text> elements for the title
    const textElements = svg.match(/<text[^>]*fill="#0f172a"/g);
    expect(textElements!.length).toBeGreaterThan(1);
  });

  it("includes gradient background definition", () => {
    const svg = generateOgImageSvg({ title: "Test" });
    expect(svg).toContain("linearGradient");
    expect(svg).toContain("#e0f2fe");
    expect(svg).toContain("#f1f5f9");
  });

  it("includes footer text", () => {
    const svg = generateOgImageSvg({ title: "Test" });
    expect(svg).toContain("Portfolio");
  });
});

describe("ogImageRef", () => {
  it("builds public path URL under /og/", () => {
    expect(ogImageRef("home.svg")).toBe("/og/home.svg");
    expect(ogImageRef("project-first-project.svg")).toBe(
      "/og/project-first-project.svg",
    );
  });

  it("handles multi-segment paths", () => {
    expect(ogImageRef("blog/post-slug.svg")).toBe("/og/blog/post-slug.svg");
  });
});
