import { describe, expect, it } from "vitest";

import {
  generateOgImage,
  generateOgImageSvg,
  generateOgImageUri,
  wrapText,
} from "./og-image";

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

describe("generateOgImageUri", () => {
  it("produces a base64 data URI with correct prefix", () => {
    const svg = generateOgImageSvg({ title: "Test" });
    const uri = generateOgImageUri(svg);

    expect(uri).toMatch(/^data:image\/svg\+xml;charset=utf-8;base64,/);
  });

  it("produces a decodable URI", () => {
    const svg = generateOgImageSvg({ title: "Decodable Test" });
    const uri = generateOgImageUri(svg);

    const base64 = uri.split(",")[1];
    const decoded = Buffer.from(base64, "base64").toString("utf-8");

    expect(decoded).toContain("Decodable Test");
    expect(decoded).toContain("<svg");
  });
});

describe("generateOgImage", () => {
  it("combines SVG generation and URI encoding", () => {
    const uri = generateOgImage({
      title: "Combined Test",
      subtitle: "Subtitle",
    });

    expect(uri).toMatch(/^data:image\/svg\+xml;charset=utf-8;base64,/);

    const base64 = uri.split(",")[1];
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    expect(decoded).toContain("Combined Test");
    expect(decoded).toContain("Subtitle");
  });
});
