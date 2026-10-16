import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createContentLibrary,
  type ContentLibraryConfig,
  type ContentMeta,
} from "./create-content-library.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

interface TempFixtures {
  tmpDir: string;
  cwd: string;
  fixturesDir: string;
}

function createTempFixtures(
  files: Record<string, string>,
  opts: { images?: Record<string, Buffer> } = {},
): TempFixtures {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-lib-test-"));
  const cwd = path.join(tmpDir, "apps", "main");
  fs.mkdirSync(cwd, { recursive: true });

  const fixturesDir = path.join(
    tmpDir,
    "libs",
    "content",
    "src",
    "test",
    "fixtures",
  );
  fs.mkdirSync(fixturesDir, { recursive: true });

  for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(fixturesDir, filename), content);
  }

  for (const [filename, content] of Object.entries(opts.images ?? {})) {
    fs.writeFileSync(path.join(fixturesDir, filename), content);
  }

  // The content library resolves mdDir as path.join(process.cwd(), '../../', mdDir).
  // We mock process.cwd() to return <tmpDir>/apps/main so '../../' resolves
  // to <tmpDir> and mdDir resolves to the fixtures directory inside tmpDir.
  vi.spyOn(process, "cwd").mockReturnValue(cwd);

  return { tmpDir, cwd, fixturesDir };
}

function cleanupTempFixtures(fixtures: TempFixtures): void {
  try {
    fs.rmSync(fixtures.tmpDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

function makeLibrary(
  config: Partial<ContentLibraryConfig> & {
    _files?: Record<string, string>;
    _images?: Record<string, Buffer>;
  } = {},
): {
  lib: ReturnType<typeof createContentLibrary>;
  cleanup: () => void;
  fixtures: TempFixtures;
} {
  const files = config._files ?? {};
  const images = config._images ?? {};
  const fixtures = createTempFixtures(files, { images });

  const lib = createContentLibrary({
    mdDir: "libs/content/src/test/fixtures",
    publicPrefix: "/test",
    placeholderFilename: "placeholder.svg",
    ...config,
  });

  return {
    lib,
    cleanup: () => cleanupTempFixtures(fixtures),
    fixtures,
  };
}

const VALID_META = `---
title: 'Test Project'
date: '2024-06-10'
excerpt: 'A test project.'
tags: ['test', 'demo']
team: 'Test Author'
---

# Hello World

This is test content.
`;

// ---------------------------------------------------------------------------
// getAll()
// ---------------------------------------------------------------------------

describe("createContentLibrary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("getAll()", () => {
    it("reads markdown files and parses frontmatter", () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post-one.md": VALID_META },
      });

      const all = lib.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].title).toBe("Test Project");
      expect(all[0].date).toBe("2024-06-10");
      expect(all[0].excerpt).toBe("A test project.");
      expect(all[0].tags).toEqual(["test", "demo"]);
      expect(all[0].team).toBe("Test Author");

      cleanup();
    });

    it("derives slugs from filenames", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "my-awesome-project.md": VALID_META,
          "another-post.mdx": VALID_META,
        },
      });

      const all = lib.getAll();
      const slugs = all.map((p: ContentMeta) => p.slug).sort();
      expect(slugs).toEqual(["another-post", "my-awesome-project"]);

      cleanup();
    });

    it("returns items sorted newest-first by date", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "old.md": VALID_META.replace(
            "date: '2024-06-10'",
            "date: '2023-01-15'",
          ),
          "new.md": VALID_META.replace(
            "date: '2024-06-10'",
            "date: '2025-03-20'",
          ),
          "middle.md": VALID_META,
        },
      });

      const all = lib.getAll();
      expect(all.map((p: ContentMeta) => p.slug)).toEqual([
        "new",
        "middle",
        "old",
      ]);

      cleanup();
    });

    it("returns an empty array for a missing content directory", () => {
      const { lib, cleanup } = makeLibrary({
        mdDir: "libs/content/src/test/nonexistent",
      });

      expect(lib.getAll()).toEqual([]);

      cleanup();
    });

    it("returns an empty array for an empty directory", () => {
      const { lib, cleanup } = makeLibrary({ _files: {} });

      expect(lib.getAll()).toEqual([]);

      cleanup();
    });

    it("includes imageSrc with publicPrefix (placeholder when no image)", () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post.md": VALID_META },
      });

      const all = lib.getAll();
      expect(all[0].imageSrc).toBe("/test/placeholder.svg");

      cleanup();
    });

    it("uses image file matching slug + extension", () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post.md": VALID_META },
        _images: { "post.png": Buffer.from("fake-png") },
      });

      const all = lib.getAll();
      expect(all[0].imageSrc).toBe("/test/post.png");

      cleanup();
    });
  });

  // ---------------------------------------------------------------------------
  // getBySlug()
  // ---------------------------------------------------------------------------

  describe("getBySlug()", () => {
    it("retrieves metadata by slug", () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post.md": VALID_META },
      });

      const meta = lib.getBySlug("post");
      expect(meta).toBeDefined();
      expect(meta!.title).toBe("Test Project");
      expect(meta!.slug).toBe("post");

      cleanup();
    });

    it("returns undefined for an unknown slug", () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post.md": VALID_META },
      });

      expect(lib.getBySlug("nonexistent")).toBeUndefined();

      cleanup();
    });

    it("returns undefined for an empty-string slug", () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post.md": VALID_META },
      });

      expect(lib.getBySlug("")).toBeUndefined();

      cleanup();
    });

    it("returns undefined for a whitespace-only slug", () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post.md": VALID_META },
      });

      expect(lib.getBySlug("   ")).toBeUndefined();

      cleanup();
    });
  });

  // ---------------------------------------------------------------------------
  // getContentBySlug()
  // ---------------------------------------------------------------------------

  describe("getContentBySlug()", () => {
    it("returns full content with rendered HTML body", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post.md": VALID_META },
      });

      const content = await lib.getContentBySlug("post");
      expect(content).toBeDefined();
      expect(content!.slug).toBe("post");
      expect(content!.title).toBe("Test Project");
      expect(content!.body).toContain("<h1>Hello World</h1>");
      expect(content!.body).toContain("This is test content.");

      cleanup();
    });

    it("returns undefined for an unknown slug", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post.md": VALID_META },
      });

      expect(await lib.getContentBySlug("nonexistent")).toBeUndefined();

      cleanup();
    });

    it("returns undefined for an empty-string slug", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post.md": VALID_META },
      });

      expect(await lib.getContentBySlug("")).toBeUndefined();

      cleanup();
    });

    it("returns undefined for a whitespace-only slug", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post.md": VALID_META },
      });

      expect(await lib.getContentBySlug("   ")).toBeUndefined();

      cleanup();
    });
  });

  // ---------------------------------------------------------------------------
  // DEPLOYMENT_URL substitution (regression test for P0.1)
  // ---------------------------------------------------------------------------

  describe("DEPLOYMENT_URL substitution", () => {
    it("replaces DEPLOYMENT_URL placeholder with the deployment URL", async () => {
      vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_URL", "https://example.com");

      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n[Kathleen Miller](DEPLOYMENT_URL)`,
        },
      });

      const content = await lib.getContentBySlug("post");

      // The placeholder must NOT survive into the rendered HTML
      expect(content!.body).not.toContain("DEPLOYMENT_URL");
      // The href must be the deployment URL, not prefixed with a content path
      expect(content!.body).toContain('href="https://example.com"');
      // The deployment URL must NOT be prefixed with /test/ or basePath
      expect(content!.body).not.toContain("/test/DEPLOYMENT_URL");
      expect(content!.body).not.toMatch(/href="\/[^"]*DEPLOYMENT_URL"/);

      cleanup();
    });

    it("leaves DEPLOYMENT_URL placeholder intact when no deployment URL is configured", async () => {
      vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_URL", "");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
      vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", "");

      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n[Link](DEPLOYMENT_URL)`,
        },
      });

      const content = await lib.getContentBySlug("post");
      // Without a deployment URL, the placeholder is left as-is
      expect(content!.body).toContain("DEPLOYMENT_URL");

      cleanup();
    });

    it("works correctly with a basePath when deployment URL is set", async () => {
      vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_URL", "https://example.com");
      vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");

      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n[Team](DEPLOYMENT_URL) and [relative](/relative-page)`,
        },
      });

      const content = await lib.getContentBySlug("post");

      // DEPLOYMENT_URL is replaced with the full deployment URL
      expect(content!.body).not.toContain("DEPLOYMENT_URL");
      expect(content!.body).toContain('href="https://example.com"');
      // Relative link is rewritten with basePath + prefix
      expect(content!.body).toContain('href="/subpath/test/relative-page"');

      cleanup();
    });
  });

  // ---------------------------------------------------------------------------
  // Relative link and image path handling
  // ---------------------------------------------------------------------------

  describe("relative path handling", () => {
    it("rewrites relative image paths with baseURL and prefix", async () => {
      vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");

      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n![Alt](image.png)`,
        },
        _images: { "image.png": Buffer.from("fake") },
      });

      const content = await lib.getContentBySlug("post");
      expect(content!.body).toContain('src="/subpath/test/image.png"');

      cleanup();
    });

    it("rewrites relative links with baseURL and prefix", async () => {
      vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");

      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n[Read more](other-post)`,
        },
      });

      const content = await lib.getContentBySlug("post");
      expect(content!.body).toContain('href="/subpath/test/other-post"');

      cleanup();
    });

    it("does not rewrite absolute URLs", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n[External](https://example.com/page)`,
        },
      });

      const content = await lib.getContentBySlug("post");
      expect(content!.body).toContain('href="https://example.com/page"');

      cleanup();
    });

    it("does not rewrite anchor links", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n[Jump](#section)`,
        },
      });

      const content = await lib.getContentBySlug("post");
      expect(content!.body).toContain('href="#section"');

      cleanup();
    });

    it("does not rewrite mailto links", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n[Email](mailto:person@example.com)`,
        },
      });

      const content = await lib.getContentBySlug("post");
      expect(content!.body).toContain('href="mailto:person@example.com"');

      cleanup();
    });

    it("works without a baseUrl", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n[More](other-page)`,
        },
      });

      const content = await lib.getContentBySlug("post");
      expect(content!.body).toContain('href="/test/other-page"');

      cleanup();
    });
  });

  // ---------------------------------------------------------------------------
  // External link security attributes
  // ---------------------------------------------------------------------------

  describe("external link security attributes", () => {
    it('adds target="_blank" and rel="noopener noreferrer" to external links', async () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n[External](https://example.com/page)`,
        },
      });

      const content = await lib.getContentBySlug("post");
      expect(content!.body).toContain('target="_blank"');
      expect(content!.body).toContain('rel="noopener noreferrer"');
      expect(content!.body).toContain('class="external-link"');

      cleanup();
    });

    it("does not add security attributes to relative links", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n[Relative](other-page)`,
        },
      });

      const content = await lib.getContentBySlug("post");
      expect(content!.body).not.toContain('target="_blank"');
      expect(content!.body).not.toContain('rel="noopener noreferrer"');

      cleanup();
    });
  });

  // ---------------------------------------------------------------------------
  // Image fallback behavior
  // ---------------------------------------------------------------------------

  describe("image fallback", () => {
    it("uses placeholder when no image field is present", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\nContent`,
        },
      });

      const all = lib.getAll();
      expect(all[0].imageSrc).toBe("/test/placeholder.svg");

      cleanup();
    });

    it("uses placeholder when image field is null", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\nimage:\n---\nContent`,
        },
      });

      const all = lib.getAll();
      expect(all[0].imageSrc).toBe("/test/placeholder.svg");

      cleanup();
    });

    it("uses placeholder when referenced image file is missing", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\nimage: non-existent.png\n---\nContent`,
        },
      });

      const all = lib.getAll();
      expect(all[0].imageSrc).toBe("/test/placeholder.svg");

      cleanup();
    });

    it("prefers image frontmatter over slug-based filename", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\nimage: custom-cover.png\n---\nContent`,
        },
        _images: {
          "post.png": Buffer.from("auto"),
          "custom-cover.png": Buffer.from("custom"),
        },
      });

      const all = lib.getAll();
      expect(all[0].imageSrc).toBe("/test/custom-cover.png");

      cleanup();
    });
  });

  // ---------------------------------------------------------------------------
  // Markdown rendering and raw HTML
  // ---------------------------------------------------------------------------

  describe("markdown rendering", () => {
    it("renders markdown body as HTML", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n# Heading\n\nParagraph with **bold** and *italic* text.`,
        },
      });

      const content = await lib.getContentBySlug("post");
      expect(content!.body).toContain("<h1>Heading</h1>");
      expect(content!.body).toContain("<strong>bold</strong>");
      expect(content!.body).toContain("<em>italic</em>");

      cleanup();
    });

    it("preserves raw HTML from markdown", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n<div class="custom">Raw HTML content</div>`,
        },
      });

      const content = await lib.getContentBySlug("post");
      expect(content!.body).toContain(
        '<div class="custom">Raw HTML content</div>',
      );

      cleanup();
    });

    it("renders markdown lists as HTML lists", async () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\n---\n- Item 1\n- Item 2\n- Item 3`,
        },
      });

      const content = await lib.getContentBySlug("post");
      expect(content!.body).toContain("<ul>");
      expect(content!.body).toContain("<li>Item 1</li>");
      expect(content!.body).toContain("<li>Item 3</li>");

      cleanup();
    });
  });

  // ---------------------------------------------------------------------------
  // Frontmatter validation
  // ---------------------------------------------------------------------------

  describe("frontmatter validation", () => {
    it("accepts valid frontmatter with all required fields", () => {
      const { lib, cleanup } = makeLibrary({
        _files: { "post.md": VALID_META },
      });

      const all = lib.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].title).toBe("Test Project");
      expect(all[0].date).toBe("2024-06-10");

      cleanup();
    });

    it("accepts valid frontmatter with slug in frontmatter", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "my-slug.md": `---\ntitle: 'With Slug'\ndate: '2024-06-10'\nslug: custom-slug\n---\nContent`,
        },
      });

      const all = lib.getAll();
      expect(all[0].slug).toBe("custom-slug");

      cleanup();
    });

    it("uses filename when slug is absent in frontmatter", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "filename-slug.md": `---\ntitle: 'No Slug Field'\ndate: '2024-06-10'\n---\nContent`,
        },
      });

      const all = lib.getAll();
      expect(all[0].slug).toBe("filename-slug");

      cleanup();
    });

    it("rejects empty frontmatter (missing title)", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ndate: '2024-06-10'\n---\nContent`,
        },
      });

      expect(() => lib.getAll()).toThrow(/Invalid frontmatter in "post\.md"/);
      expect(() => lib.getAll()).toThrow(/`title` is required/);

      cleanup();
    });

    it("rejects frontmatter missing date", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'No Date'\n---\nContent`,
        },
      });

      expect(() => lib.getAll()).toThrow(/`date` is required/);

      cleanup();
    });

    it("rejects frontmatter with invalid date format", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Bad Date'\ndate: 'not-a-date'\n---\nContent`,
        },
      });

      expect(() => lib.getAll()).toThrow(/`date` must be in YYYY-MM-DD format/);

      cleanup();
    });

    it("rejects frontmatter with non-string title", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 12345\ndate: '2024-06-10'\n---\nContent`,
        },
      });

      expect(() => lib.getAll()).toThrow(/`title` must be a string/);

      cleanup();
    });

    it("rejects frontmatter with non-string date", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: 12345\n---\nContent`,
        },
      });

      expect(() => lib.getAll()).toThrow(/`date` must be a string/);

      cleanup();
    });

    it("rejects frontmatter with non-string slug", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ntitle: 'Test'\ndate: '2024-06-10'\nslug: 12345\n---\nContent`,
        },
      });

      expect(() => lib.getAll()).toThrow(/`slug` must be a string/);

      cleanup();
    });

    it("aggregates multiple validation errors", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "post.md": `---\ndate: 'bad-format'\n---\nContent`,
        },
      });

      expect(() => lib.getAll()).toThrow(/`title` is required/);
      expect(() => lib.getAll()).toThrow(/`date` must be in YYYY-MM-DD format/);

      cleanup();
    });

    it("validation errors include the filename", () => {
      const { lib, cleanup } = makeLibrary({
        _files: {
          "specific-file.md": `---\ndate: '2024-06-10'\n---\nContent`,
        },
      });

      expect(() => lib.getAll()).toThrow(/specific-file\.md/);

      cleanup();
    });
  });
});
