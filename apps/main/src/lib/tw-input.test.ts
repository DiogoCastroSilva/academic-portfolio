import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/*
 * Regression test: tw-input.css must include Tailwind @source directives
 * for all Markdown content directories, including the blog source.
 *
 * Without the blog source, Tailwind v4 will purge classes used in published
 * blog Markdown, causing them to be missing from production CSS.
 */
describe("tw-input.css content scanning", () => {
  const cssPath = path.resolve(__dirname, "../../tw-input.css");
  const content = fs.readFileSync(cssPath, "utf-8");

  it("scans blog Markdown content", () => {
    expect(content).toContain('@source "../../libs/blog/src/**/*.md";');
  });

  it("scans all known Markdown content sources", () => {
    expect(content).toContain('@source "../../libs/projects/src/**/*.md";');
    expect(content).toContain('@source "../../libs/publications/src/**/*.md";');
  });

  it("configures dark variant via [data-theme] selector for theme toggle", () => {
    expect(content).toMatch(
      /@custom-variant\s+dark\s*\(&:where\(\[data-theme=dark\]/,
    );
  });
});
