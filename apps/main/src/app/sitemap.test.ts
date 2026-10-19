import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * Tests for the sitemap generation script.
 *
 * These tests create temporary fixture directories with HTML files
 * and run the generate-sitemap.mjs script, then verify the output
 * files (sitemap.xml and robots.txt).
 */

const BASE_URL = "https://example.com/portfolio";
const SCRIPT_PATH = path.resolve(
  __dirname,
  "../../../../tools/generate-sitemap.mjs",
);

function createFixture() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sitemap-test-"));
  const publicDir = path.join(tmpDir, "public");
  fs.mkdirSync(publicDir, { recursive: true });

  return {
    tmpDir,
    publicDir,
    writeFile: (relativePath: string, content = "<html></html>") => {
      const fullPath = path.join(publicDir, relativePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content);
    },
  };
}

function runSitemap(baseUrl: string, tmpDir: string) {
  const env = { NEXT_PUBLIC_DEPLOYMENT_URL: baseUrl, ...process.env };

  const result = execSync(`node "${SCRIPT_PATH}"`, {
    cwd: tmpDir,
    env,
    encoding: "utf-8",
  });

  const sitemapPath = path.join(tmpDir, "public", "sitemap.xml");
  const robotsPath = path.join(tmpDir, "public", "robots.txt");

  return {
    sitemap: fs.readFileSync(sitemapPath, "utf-8"),
    robots: fs.readFileSync(robotsPath, "utf-8"),
    stdout: result,
  };
}

describe("generate-sitemap", () => {
  let fixture: ReturnType<typeof createFixture>;

  beforeEach(() => {
    fixture = createFixture();
  });

  afterEach(() => {
    fs.rmSync(fixture.tmpDir, { recursive: true, force: true });
  });

  it("generates sitemap.xml with correct URLs", () => {
    fixture.writeFile("index.html");
    fixture.writeFile("projects/index.html");

    const { sitemap } = runSitemap(BASE_URL, fixture.tmpDir);

    expect(sitemap).toContain("https://example.com/portfolio/");
    expect(sitemap).toContain("https://example.com/portfolio/projects/");
  });

  it("excludes error pages from sitemap", () => {
    fixture.writeFile("index.html");
    fixture.writeFile("404/index.html");
    fixture.writeFile("non-existent-slug/index.html");

    const { sitemap } = runSitemap(BASE_URL, fixture.tmpDir);

    expect(sitemap).not.toContain("/404/");
    expect(sitemap).not.toContain("/non-existent-slug/");
  });

  it("excludes page-1 redirect stubs from paginated collections", () => {
    fixture.writeFile("index.html");
    fixture.writeFile("projects/index.html");
    // Page 1 is a redirect stub (meta http-equiv="refresh") — not content
    fixture.writeFile("projects/page/1/index.html");
    // Page 2 has real content — should be included
    fixture.writeFile("projects/page/2/index.html");
    fixture.writeFile("blog/page/1/index.html");

    const { sitemap } = runSitemap(BASE_URL, fixture.tmpDir);
    const urls = sitemap.match(/<loc>([^<]*)<\/loc>/g) || [];

    // Redirect stubs excluded
    expect(urls).not.toContain(
      "<loc>https://example.com/portfolio/projects/page/1/</loc>",
    );
    expect(urls).not.toContain(
      "<loc>https://example.com/portfolio/blog/page/1/</loc>",
    );
    // Real content pages still included
    expect(urls).toContain(
      "<loc>https://example.com/portfolio/projects/</loc>",
    );
    expect(urls).toContain(
      "<loc>https://example.com/portfolio/projects/page/2/</loc>",
    );
  });

  it("generates robots.txt with correct directives", () => {
    fixture.writeFile("index.html");

    const { robots } = runSitemap(BASE_URL, fixture.tmpDir);

    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain(
      "Sitemap: https://example.com/portfolio/sitemap.xml",
    );
  });

  it("does not include lastmod (build date is not a content change date)", () => {
    fixture.writeFile("index.html");

    const { sitemap } = runSitemap(BASE_URL, fixture.tmpDir);

    expect(sitemap).not.toContain("<lastmod>");
  });

  it("includes valid XML structure", () => {
    fixture.writeFile("index.html");

    const { sitemap } = runSitemap(BASE_URL, fixture.tmpDir);

    // Check basic structure
    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(sitemap.trim().endsWith("</urlset>")).toBe(true);
  });

  it("handles trailing slash normalization", () => {
    fixture.writeFile("index.html");
    fixture.writeFile("about/index.html");

    const { sitemap } = runSitemap(BASE_URL, fixture.tmpDir);
    const urls = sitemap.match(/<loc>([^<]*)<\/loc>/g) || [];

    // Root should have trailing slash
    expect(urls).toContain("<loc>https://example.com/portfolio/</loc>");
    // Sub-paths should have trailing slash
    expect(urls).toContain("<loc>https://example.com/portfolio/about/</loc>");
  });
});
