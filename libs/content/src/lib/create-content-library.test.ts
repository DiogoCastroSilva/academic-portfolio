import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createContentLibrary,
  type ContentLibraryConfig,
} from "./create-content-library.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

interface TempFixtures {
  tmpDir: string;
  cwd: string;
  fixturesDir: string;
}

const cleanupFns: Array<() => void> = [];

afterEach(() => {
  while (cleanupFns.length > 0) {
    const fn = cleanupFns.pop()!;
    fn();
  }
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

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
    const filePath = path.join(fixturesDir, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }

  for (const [filename, content] of Object.entries(opts.images ?? {})) {
    const filePath = path.join(fixturesDir, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }

  vi.spyOn(process, "cwd").mockReturnValue(cwd);

  return { tmpDir, cwd, fixturesDir };
}

function cleanupTempFixtures(tmpDir: string): void {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

function makeLibrary(
  config: ContentLibraryConfig & {
    _files: Record<string, string>;
    _images?: Record<string, Buffer>;
  },
) {
  const { _files, _images, ...libConfig } = config;
  const { tmpDir, fixturesDir } = createTempFixtures(_files, {
    images: _images,
  });
  cleanupFns.push(() => cleanupTempFixtures(tmpDir));

  const lib = createContentLibrary({
    ...libConfig,
    mdDir: path.relative(tmpDir, fixturesDir),
  });

  return { lib, fixturesDir, cleanup: () => cleanupTempFixtures(tmpDir) };
}

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const VALID_META = `---
title: "My Post"
date: "2024-06-10"
---
Content`;

const VALID_META_NEWER = `---
title: "Newer Post"
date: "2024-08-15"
---
Even newer content`;

const VALID_META_OLDER = `---
title: "Older Post"
date: "2024-05-05"
---
Older content`;

// ---------------------------------------------------------------------------
// getAll()
// ---------------------------------------------------------------------------

describe("getAll()", () => {
  it("reads markdown files and parses frontmatter", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post-one/README.md": `---
title: "First Post"
date: "2024-01-01"
---
Body one`,
        "post-two/README.md": `---
title: "Second Post"
date: "2024-02-01"
---
Body two`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items).toContainEqual(
      expect.objectContaining({
        slug: "post-one",
        title: "First Post",
        date: "2024-01-01",
      }),
    );
    expect(items).toContainEqual(
      expect.objectContaining({
        slug: "post-two",
        title: "Second Post",
        date: "2024-02-01",
      }),
    );

    cleanup();
  });

  it("derives slugs from directory names", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "my-awesome-project/README.md": `---
title: "Awesome Project"
date: "2024-01-01"
---
Content`,
        "another-post/README.mdx": `---
title: "Another Post"
date: "2024-02-01"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items.map((i) => i.slug)).toEqual([
      "another-post",
      "my-awesome-project",
    ]);

    cleanup();
  });

  it("uses slug from frontmatter when present", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "dir-name/README.md": `---
title: "Custom Slug"
date: "2024-01-01"
slug: "custom-slug"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items[0].slug).toBe("custom-slug");
    expect(items[0].href).toBe("/test/custom-slug");

    cleanup();
  });

  it("returns items sorted newest-first by date", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "old/README.md": VALID_META_OLDER,
        "middle/README.md": VALID_META,
        "new/README.md": VALID_META_NEWER,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items.map((i) => i.date)).toEqual([
      "2024-08-15",
      "2024-06-10",
      "2024-05-05",
    ]);

    cleanup();
  });

  it("uses slug as a deterministic tie-breaker for items with the same date", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "zebra/README.md": `---\ntitle: "Zebra"\ndate: "2024-06-10"\n---\nContent`,
        "apple/README.md": `---\ntitle: "Apple"\ndate: "2024-06-10"\n---\nContent`,
        "mango/README.md": `---\ntitle: "Mango"\ndate: "2024-06-10"\n---\nContent`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    // Same date for all three — ordering must be deterministic by slug.
    expect(items.map((i) => i.slug)).toEqual(["apple", "mango", "zebra"]);

    cleanup();
  });

  it("returns an empty array for a missing content directory", () => {
    // Point to a non-existent directory
    const tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "content-lib-missing-"),
    );
    vi.spyOn(process, "cwd").mockReturnValue(path.join(tmpDir, "apps", "main"));

    const lib = createContentLibrary({
      mdDir: "does-not-exist",
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(lib.getAll()).toEqual([]);

    cleanupTempFixtures(tmpDir);
  });

  it("includes imageSrc with publicPrefix when no image is present", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items[0].imageSrc).toBe("/test/placeholder.svg");
    expect(items[0].imageType).toBe("placeholder");

    cleanup();
  });

  it("uses image file matching slug + extension", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      _images: {
        "post/post.png": Buffer.from("fake-png"),
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items[0].imageSrc).toBe("/test/post/post.png");
    expect(items[0].imageType).toBe("cover");

    cleanup();
  });

  it("prefers image frontmatter over slug-based filename", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
image: custom-cover.png
---
Content`,
      },
      _images: {
        "post/post.png": Buffer.from("auto"),
        "post/custom-cover.png": Buffer.from("custom"),
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items[0].imageSrc).toBe("/test/post/custom-cover.png");
    expect(items[0].imageType).toBe("cover");

    cleanup();
  });

  it("excludes items with draft: true", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "published/README.md": VALID_META,
        "draft/README.md": `---
title: "Draft"
date: "2024-06-10"
draft: true
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items.map((i) => i.slug)).toEqual(["published"]);

    cleanup();
  });

  it("ignores directories starting with underscore", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
        "_template/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items.map((i) => i.slug)).toEqual(["post"]);

    cleanup();
  });

  it("ignores hidden directories", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
        ".cache/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items.map((i) => i.slug)).toEqual(["post"]);

    cleanup();
  });

  it("throws when duplicate slugs are found in different directories", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "dir-a/README.md":
          '---\ntitle: "Post A"\ndate: "2024-06-10"\nslug: "collision"\n---\nContent A',
        "dir-b/README.md":
          '---\ntitle: "Post B"\ndate: "2024-06-10"\nslug: "collision"\n---\nContent B',
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/Duplicate slug/);

    cleanup();
  });
});

// ---------------------------------------------------------------------------
// getBySlug()
// ---------------------------------------------------------------------------

describe("getBySlug()", () => {
  it("retrieves metadata by slug", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("post");
    expect(item).toEqual(
      expect.objectContaining({
        slug: "post",
        title: "My Post",
        date: "2024-06-10",
      }),
    );

    cleanup();
  });

  it("returns undefined for an unknown slug", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(lib.getBySlug("nonexistent")).toBeUndefined();

    cleanup();
  });

  it("returns undefined for an empty-string slug", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(lib.getBySlug("")).toBeUndefined();

    cleanup();
  });

  it("returns undefined for a whitespace-only slug", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
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
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
# Hello World

This is **bold** text.`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content).toEqual(
      expect.objectContaining({
        slug: "post",
        title: "My Post",
        date: "2024-06-10",
      }),
    );
    expect(content!.body).toContain("<h1>Hello World</h1>");
    expect(content!.body).toContain("<strong>bold</strong>");

    cleanup();
  });

  it("returns undefined for an unknown slug", async () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("nonexistent");
    expect(content).toBeUndefined();

    cleanup();
  });

  it("returns undefined for an empty-string slug", async () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("");
    expect(content).toBeUndefined();

    cleanup();
  });

  it("returns undefined for a whitespace-only slug", async () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("   ");
    expect(content).toBeUndefined();

    cleanup();
  });
});

describe("DEPLOYMENT_URL substitution", () => {
  it("replaces DEPLOYMENT_URL placeholder with the deployment URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_URL", "https://example.com");

    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
[Deployed link](DEPLOYMENT_URL)`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain('href="https://example.com"');
    expect(content!.body).not.toContain("DEPLOYMENT_URL");

    cleanup();
  });

  it("leaves DEPLOYMENT_URL placeholder intact when no deployment URL is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_URL", "");

    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
[Deployed link](DEPLOYMENT_URL)`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    // When no deployment URL is configured, the placeholder remains as a literal.
    expect(content!.body).toContain("DEPLOYMENT_URL");

    cleanup();
  });

  it("resolves relative links correctly when deployment URL is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_URL", "https://example.com");

    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
[Relative page](relative-page)`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain('href="/test/post/relative-page"');

    cleanup();
  });
});

// ---------------------------------------------------------------------------
// Relative path handling
// ---------------------------------------------------------------------------

describe("relative path handling", () => {
  it("rewrites relative image paths with baseURL and prefix", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");

    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
![Alt text](image.png)`,
      },
      _images: {
        "post/image.png": Buffer.from("fake-png"),
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain('src="/subpath/test/post/image.png"');

    cleanup();
  });

  it("rewrites relative links with baseURL and prefix", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");

    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
[Other post](other-post)`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain('href="/subpath/test/post/other-post"');

    cleanup();
  });

  it("does not rewrite absolute URLs", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");

    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
[External link](https://example.com)

![External image](https://example.com/image.png)`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain('href="https://example.com"');
    expect(content!.body).toContain('src="https://example.com/image.png"');

    cleanup();
  });

  it("does not rewrite anchor links", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");

    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
[Jump to section](#section-id)`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain('href="#section-id"');

    cleanup();
  });

  it("does not rewrite mailto links", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");

    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
[Email me](mailto:test@example.com)`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain('href="mailto:test@example.com"');

    cleanup();
  });

  it("works without a baseUrl", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");

    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
[Other page](other-page)`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain('href="/test/post/other-page"');

    cleanup();
  });
});

// ---------------------------------------------------------------------------
// External link security attributes
// ---------------------------------------------------------------------------

describe("external link security attributes", () => {
  it('adds target="_blank" and rel="noopener noreferrer" to external links', async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");

    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
[External link](https://example.com)`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain('href="https://example.com"');
    expect(content!.body).toContain('target="_blank"');
    expect(content!.body).toContain('rel="noopener noreferrer"');

    cleanup();
  });

  it("does not add security attributes to relative links", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/subpath");

    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "My Post"
date: "2024-06-10"
---
[Relative link](relative-page)`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).not.toContain('target="_blank"');
    expect(content!.body).not.toContain('rel="noopener noreferrer"');

    cleanup();
  });
});

// ---------------------------------------------------------------------------
// Image fallback
// ---------------------------------------------------------------------------

describe("image fallback", () => {
  it("uses placeholder when no image field is present", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("post");
    expect(item!.imageSrc).toBe("/test/placeholder.svg");
    expect(item!.imageType).toBe("placeholder");

    cleanup();
  });

  it("uses placeholder when image field is null", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
image: null
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("post");
    expect(item!.imageSrc).toBe("/test/placeholder.svg");
    expect(item!.imageType).toBe("placeholder");

    cleanup();
  });

  it("throws when referenced image file is missing", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
image: nonexistent.png
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getBySlug("post")).toThrow(
      /Invalid frontmatter[\s\S]*nonexistent\.png/,
    );

    cleanup();
  });

  it("prefers image frontmatter over slug-based filename", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
image: custom-cover.png
---
Content`,
      },
      _images: {
        "post/post.png": Buffer.from("auto"),
        "post/custom-cover.png": Buffer.from("custom"),
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("post");
    expect(item!.imageSrc).toBe("/test/post/custom-cover.png");
    expect(item!.imageType).toBe("cover");

    cleanup();
  });
});

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------

describe("markdown rendering", () => {
  it("renders markdown body as HTML", async () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
---
# Heading

Paragraph with **bold** and *italic* text.`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
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
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
---
<div class="custom">Raw HTML</div>`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain('<div class="custom">Raw HTML</div>');

    cleanup();
  });

  it("renders markdown lists as HTML lists", async () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
---
- Item 1
- Item 2
- Item 3`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain("<ul>");
    expect(content!.body).toContain("<li>Item 1</li>");
    expect(content!.body).toContain("<li>Item 3</li>");

    cleanup();
  });
});

// ---------------------------------------------------------------------------
// Body image validation
// ---------------------------------------------------------------------------

describe("body image validation", () => {
  it("throws when an inline image file is missing", async () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
---
![Figure 1](missing.png "Caption")`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    await expect(lib.getContentBySlug("post")).rejects.toThrow(
      /Image not found.*missing\.png/,
    );
    cleanup();
  });

  it("passes when an inline image file exists", async () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
---
![Figure 1](plot.png "Caption")`,
      },
      _images: {
        "post/plot.png": Buffer.from("fake-png"),
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain("<figure");
    cleanup();
  });

  it("skips external URLs in inline images", async () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
---
![External](https://example.com/img.png "Caption")`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    expect(content!.body).toContain("https://example.com/img.png");
    cleanup();
  });

  it("skips anchor links in inline images", async () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
---
![Anchor](#section)`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const content = await lib.getContentBySlug("post");
    // Anchor "images" are not real images but should not cause validation errors
    expect(content).toBeDefined();
    cleanup();
  });

  it("throws when an inline image path escapes the entry directory", async () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
---
![Bad](../../etc/passwd "Caption")`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    await expect(lib.getContentBySlug("post")).rejects.toThrow(
      /etc\/passwd.*outside the entry directory/,
    );
    cleanup();
  });
});

// ---------------------------------------------------------------------------
// Frontmatter validation
// ---------------------------------------------------------------------------

describe("frontmatter validation", () => {
  it("accepts valid frontmatter with all required fields", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("My Post");
    expect(items[0].date).toBe("2024-06-10");

    cleanup();
  });

  it("accepts valid frontmatter with slug in frontmatter", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "dir-name/README.md": `---
title: "Custom Slug"
date: "2024-06-10"
slug: "custom-slug"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    // getBySlug uses the directory name; the slug from frontmatter is
    // returned in the metadata.
    const item = lib.getBySlug("dir-name");
    expect(item).toBeDefined();
    expect(item!.slug).toBe("custom-slug");
    expect(item!.href).toBe("/test/custom-slug");

    cleanup();
  });

  it("uses directory name when slug is absent in frontmatter", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("post");
    expect(item).toBeDefined();
    expect(item!.slug).toBe("post");
    expect(item!.href).toBe("/test/post");

    cleanup();
  });

  it("rejects empty frontmatter (missing title)", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
date: "2024-06-10"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(
      /Invalid frontmatter in "README\.md" \(entry slug: "post"\)/,
    );
    expect(() => lib.getAll()).toThrow(/`title` is required/);

    cleanup();
  });

  it("rejects frontmatter missing date", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "No Date"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/`date` is required/);

    cleanup();
  });

  it("rejects frontmatter with invalid date format", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Bad Date"
date: "not-a-date"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(
      /`date` must be a valid calendar date in YYYY-MM-DD format/,
    );

    cleanup();
  });

  it("rejects frontmatter with invalid calendar date (Feb 30)", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Bad Calendar Date"
date: "2025-02-30"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(
      /`date` must be a valid calendar date in YYYY-MM-DD format/,
    );

    cleanup();
  });

  it("rejects frontmatter with invalid calendar date (month 13)", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Bad Month"
date: "2024-13-01"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(
      /`date` must be a valid calendar date in YYYY-MM-DD format/,
    );

    cleanup();
  });

  it("rejects frontmatter with invalid calendar date (day 00)", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Bad Day"
date: "2024-06-00"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(
      /`date` must be a valid calendar date in YYYY-MM-DD format/,
    );

    cleanup();
  });

  it("rejects frontmatter with non-string title", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: 12345
date: "2024-06-10"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/`title` must be a string/);

    cleanup();
  });

  it("rejects frontmatter with non-string date", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: 12345
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/`date` must be a string/);

    cleanup();
  });

  it("rejects frontmatter with non-string slug", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
slug: 12345
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/`slug` must be a string/);

    cleanup();
  });

  it("aggregates multiple validation errors", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
date: "bad-format"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/`title` is required/);
    expect(() => lib.getAll()).toThrow(
      /`date` must be a valid calendar date in YYYY-MM-DD format/,
    );

    cleanup();
  });

  it("validation errors include the entry slug", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "specific-entry/README.md": `---
date: "2024-06-10"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(
      /Invalid frontmatter in "README\.md" \(entry slug: "specific-entry"\)/,
    );

    cleanup();
  });

  it("rejects non-string image field", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
image: 123
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/`image` must be a string/);

    cleanup();
  });

  it("rejects non-array tags field", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
tags: "not-an-array"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/`tags` must be an array/);

    cleanup();
  });

  it("rejects non-array links field", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
links: "not-an-array"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/`links` must be an array/);

    cleanup();
  });

  it("rejects non-string-non-array authors field", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
authors: 12345
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(
      /`authors` must be a string or an array/,
    );

    cleanup();
  });

  it("rejects non-string venue field", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
venue: 12345
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/`venue` must be a string/);

    cleanup();
  });

  it("rejects non-string doi field", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
doi: 12345
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/`doi` must be a string/);

    cleanup();
  });

  it("rejects non-string paperUrl field", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
paperUrl: 12345
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getAll()).toThrow(/`paperUrl` must be a string/);

    cleanup();
  });
});

// ---------------------------------------------------------------------------
// Publication-specific fields
// ---------------------------------------------------------------------------

describe("publication-specific fields", () => {
  it("parses authors array", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "pub/README.md": `---
title: "Test"
date: "2024-06-10"
authors: ["John Doe", "Jane Smith"]
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("pub");
    expect(item!.authors).toEqual(["John Doe", "Jane Smith"]);

    cleanup();
  });

  it("parses single author as array", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "pub/README.md": `---
title: "Test"
date: "2024-06-10"
authors: "John Doe"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("pub");
    expect(item!.authors).toEqual(["John Doe"]);

    cleanup();
  });

  it("parses venue string", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "pub/README.md": `---
title: "Test"
date: "2024-06-10"
venue: "Journal of Examples"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("pub");
    expect(item!.venue).toBe("Journal of Examples");

    cleanup();
  });

  it("parses doi string", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "pub/README.md": `---
title: "Test"
date: "2024-06-10"
doi: "10.1000/123456"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("pub");
    expect(item!.doi).toBe("10.1000/123456");

    cleanup();
  });

  it("parses paperUrl string", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "pub/README.md": `---
title: "Test"
date: "2024-06-10"
paperUrl: "https://example.com/paper"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("pub");
    expect(item!.paperUrl).toBe("https://example.com/paper");

    cleanup();
  });

  it("omits optional fields when not present", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "pub/README.md": VALID_META,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("pub");
    expect(item!.authors).toBeUndefined();
    expect(item!.venue).toBeUndefined();
    expect(item!.doi).toBeUndefined();
    expect(item!.paperUrl).toBeUndefined();

    cleanup();
  });

  it("parses all publication fields together", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "pub/README.md": `---
title: "Test"
date: "2024-06-10"
authors: ["John Doe", "Jane Smith"]
venue: "Journal of Examples"
doi: "10.1000/123456"
paperUrl: "https://example.com/paper"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("pub");
    expect(item!.title).toBe("Test");
    expect(item!.authors).toEqual(["John Doe", "Jane Smith"]);
    expect(item!.venue).toBe("Journal of Examples");
    expect(item!.doi).toBe("10.1000/123456");
    expect(item!.paperUrl).toBe("https://example.com/paper");

    cleanup();
  });
});

// ---------------------------------------------------------------------------
// Nested image resolution
// ---------------------------------------------------------------------------

describe("nested image resolution", () => {
  it("resolves nested image relative to entry directory", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
image: images/cover.jpeg
---
Content`,
      },
      _images: {
        "post/images/cover.jpeg": Buffer.from("fake-jpeg"),
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const item = lib.getBySlug("post");
    expect(item!.imageSrc).toBe("/test/post/images/cover.jpeg");
    expect(item!.imageType).toBe("cover");

    cleanup();
  });

  it("throws when nested image file is missing", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
image: images/missing.jpeg
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getBySlug("post")).toThrow(
      /Invalid frontmatter[\s\S]*images\/missing\.jpeg/,
    );

    cleanup();
  });
});

// ---------------------------------------------------------------------------
// Filename collision prevention
// ---------------------------------------------------------------------------

describe("filename collision prevention", () => {
  it("two entries with the same image filename do not collide", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post-a/README.md": `---
title: "Post A"
date: "2024-01-01"
image: photo.png
---
Content A`,
        "post-b/README.md": `---
title: "Post B"
date: "2024-02-01"
image: photo.png
---
Content B`,
      },
      _images: {
        "post-a/photo.png": Buffer.from("photo-a"),
        "post-b/photo.png": Buffer.from("photo-b"),
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    const postA = items.find((i) => i.slug === "post-a");
    const postB = items.find((i) => i.slug === "post-b");

    expect(postA!.imageSrc).toBe("/test/post-a/photo.png");
    expect(postB!.imageSrc).toBe("/test/post-b/photo.png");
    expect(postA!.imageSrc).not.toBe(postB!.imageSrc);

    cleanup();
  });

  it("two entries with same slug-based auto-discovered image do not collide", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "alpha/README.md": `---
title: "Alpha"
date: "2024-01-01"
---
Content`,
        "beta/README.md": `---
title: "Beta"
date: "2024-02-01"
---
Content`,
      },
      _images: {
        "alpha/alpha.png": Buffer.from("alpha-image"),
        "beta/beta.png": Buffer.from("beta-image"),
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    const alpha = items.find((i) => i.slug === "alpha");
    const beta = items.find((i) => i.slug === "beta");

    // Different slug-based filenames resolve to different URLs
    expect(alpha!.imageSrc).toBe("/test/alpha/alpha.png");
    expect(beta!.imageSrc).toBe("/test/beta/beta.png");

    cleanup();
  });
});

// ---------------------------------------------------------------------------
// Path traversal prevention
// ---------------------------------------------------------------------------

describe("path traversal prevention", () => {
  it("rejects image path that escapes the entry directory", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
image: ../../etc/passwd
---
Content`,
      },
      _images: {
        "post/../../etc/passwd": Buffer.from("should-not-find"),
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getBySlug("post")).toThrow(
      /Invalid frontmatter[\s\S]*image/,
    );

    cleanup();
  });

  it("rejects image path with encoded traversal sequence", () => {
    const { lib, cleanup } = makeLibrary({
      _files: {
        "post/README.md": `---
title: "Test"
date: "2024-06-10"
image: ..%2F..%2Fetc%2Fpasswd
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    expect(() => lib.getBySlug("post")).toThrow(
      /Invalid frontmatter[\s\S]*image/,
    );

    cleanup();
  });

  it("ignores directories named with traversal patterns", () => {
    // A directory named "etc" should be picked up as an entry if it has README.md,
    // but a directory named ".." should never exist in readdirSync results.
    // This test verifies that normal-looking directory names are not falsely rejected.
    const { lib, cleanup } = makeLibrary({
      _files: {
        "normal/README.md": `---
title: "Normal"
date: "2024-06-10"
---
Content`,
      },
      publicPrefix: "/test",
      placeholderFilename: "placeholder.svg",
    });

    const items = lib.getAll();
    expect(items.map((i) => i.slug)).toEqual(["normal"]);

    cleanup();
  });
});
