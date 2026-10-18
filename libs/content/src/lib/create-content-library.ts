import fs from "fs";
import matter from "gray-matter";
import path from "path";
import "server-only";
import { getDeploymentUrl, withPublicBasePath } from "./constants";
import { createMarkedInstance } from "./marked-extensions.js";

import {
  ContentItemMeta,
  ContentLibrary,
  ContentLibraryConfig,
  ContentMeta,
} from "./types";

// Re-export shared types so consumers (and tests) can import them
// from this module without knowing about the internal ./types file.
export type {
  ContentItemMeta,
  ContentLibrary,
  ContentLibraryConfig,
  ContentMeta,
  ProjectMeta,
  PublicationMeta,
} from "./types";

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
] as const;

/** Entry-point Markdown filename inside each content-entry directory. */
const ENTRY_FILENAME = "README.md";

function resolveContentPath(mdDir: string): string {
  return path.join(process.cwd(), "../../", mdDir);
}

function fileExistsInDir(contentPath: string, filename: string): boolean {
  const resolved = path.resolve(contentPath, filename);
  const root = path.resolve(contentPath);

  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return false;
  }

  return fs.existsSync(resolved) && fs.statSync(resolved).isFile();
}

/**
 * Resolve a cover-image filename to its public URL.
 *
 * The image is looked up relative to `entryDir` (the per-entry directory),
 * preserving nested paths like `images/cover.jpeg`.  If the image field
 * is unset or the file is missing, falls back to a file matching
 * `{slug}{ext}`, then to the shared `placeholderFilename` in `rootDir`.
 *
 * @param entryDir            Per-entry directory (e.g. `.../md/first-project/`)
 * @param rootDir             Root content directory (e.g. `.../md/`) — for placeholder lookup
 * @param entryPublicPrefix   Public URL prefix for this entry (e.g. `/projects/first-project`)
 * @param rootPublicPrefix    Public URL prefix for the root (e.g. `/projects`)
 * @param placeholderFilename Fallback image filename at rootDir level
 * @param slug                Entry slug
 * @param image               Cover image path from frontmatter
 * @returns An object with the resolved `src` URL and an `imageType` of
 *          `"cover"` or `"placeholder"`.
 */
function resolveImage(
  entryDir: string,
  rootDir: string,
  entryPublicPrefix: string,
  rootPublicPrefix: string,
  placeholderFilename: string,
  slug: string,
  image?: string,
): { src: string; imageType: "cover" | "placeholder" } {
  // 1. Explicit image field — resolve relative to the entry directory.
  if (image?.trim()) {
    const filename = image.trim();
    if (fileExistsInDir(entryDir, filename)) {
      return {
        src: withPublicBasePath(`${entryPublicPrefix}/${filename}`),
        imageType: "cover",
      };
    }
  }

  // 2. Auto-discover cover image by slug (e.g. `first-project.jpeg`).
  for (const ext of IMAGE_EXTENSIONS) {
    const filename = `${slug}${ext}`;
    if (fileExistsInDir(entryDir, filename)) {
      return {
        src: withPublicBasePath(`${entryPublicPrefix}/${filename}`),
        imageType: "cover",
      };
    }
  }

  // 3. Shared placeholder at rootDir level — URL lives at the
  //    publicPrefix root (e.g. /projects/placeholder.svg), not in the
  //    entry subdirectory, because the placeholder is synced once for
  //    the whole content type.
  return {
    src: withPublicBasePath(`${rootPublicPrefix}/${placeholderFilename}`),
    imageType: "placeholder",
  };
}

/**
 * Validate that a string is a calendar-valid date in `YYYY-MM-DD` format,
 * without any timezone-dependent conversions.
 */
function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    daysInMonth[1] = 29;
  }

  return day <= daysInMonth[month - 1];
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Validate that all inline image references in a Markdown body point to
 * files that exist relative to the entry directory.
 *
 * This catches broken references like `![alt](missing.png)` that would
 * render as broken images on the published site. Path traversal is also
 * rejected to prevent references outside the entry directory.
 *
 * External URLs (`https://`), anchors (`#`), and absolute paths
 * (`/...`) are skipped — they point to external resources.
 *
 * @param body       The raw Markdown body text.
 * @param entryDir   The per-entry directory (e.g. `.../md/first-project/`).
 * @param slug       The entry slug (for error messages).
 * @param filename   The filename being validated (for error messages).
 */
function validateBodyImages(
  body: string,
  entryDir: string,
  slug: string,
  filename: string,
): void {
  // Match Markdown image syntax: ![alt text](url "optional title")
  const IMAGE_TOKEN_RE = /!\[(?:[^\]\\]|\\.)*\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = IMAGE_TOKEN_RE.exec(body)) !== null) {
    const rawUrl = match[1].trim();

    // Extract the URL portion (strip optional title in quotes or parens)
    const urlPart = rawUrl.split('"')[0].split("'")[0].trim();
    const href = urlPart.split(/\s/)[0];

    // Skip external URLs, anchors, and absolute paths
    if (
      /^https?:\/\//i.test(href) ||
      href.startsWith("#") ||
      href.startsWith("/")
    ) {
      continue;
    }

    // Resolve relative to the entry directory and check traversal
    const resolved = path.resolve(entryDir, href);
    const entryRoot = path.resolve(entryDir);

    if (
      resolved !== entryRoot &&
      !resolved.startsWith(`${entryRoot}${path.sep}`)
    ) {
      throw new Error(
        `Image path "${href}" in "${filename}" (entry slug: "${slug}") ` +
          `references a path outside the entry directory.`,
      );
    }

    // Check file exists
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      throw new Error(
        `Image not found: "${href}" referenced in "${filename}" ` +
          `(entry slug: "${slug}"). Expected at: ${resolved}.`,
      );
    }
  }
}

function validateFrontmatter(
  slug: string,
  data: Record<string, unknown>,
): void {
  const errors: string[] = [];

  if (data.title === undefined) {
    errors.push("`title` is required");
  } else if (typeof data.title !== "string") {
    errors.push(`\`title\` must be a string, got ${typeof data.title}`);
  }

  if (data.date === undefined) {
    errors.push("`date` is required");
  } else if (typeof data.date !== "string") {
    errors.push(`\`date\` must be a string, got ${typeof data.date}`);
  } else if (!isValidCalendarDate(data.date)) {
    errors.push(
      `\`date\` must be a valid calendar date in YYYY-MM-DD format, got "${data.date}"`,
    );
  }

  if (data.slug !== undefined && typeof data.slug !== "string") {
    errors.push(`\`slug\` must be a string, got ${typeof data.slug}`);
  }

  if (
    data.image !== undefined &&
    typeof data.image !== "string" &&
    typeof data.image !== "object"
  ) {
    errors.push(`\`image\` must be a string, got ${typeof data.image}`);
  }

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push(`\`tags\` must be an array, got ${typeof data.tags}`);
  }

  if (data.links !== undefined && !Array.isArray(data.links)) {
    errors.push(`\`links\` must be an array, got ${typeof data.links}`);
  }

  if (
    data.authors !== undefined &&
    typeof data.authors !== "string" &&
    !Array.isArray(data.authors)
  ) {
    errors.push(
      `\`authors\` must be a string or an array, got ${typeof data.authors}`,
    );
  }

  if (data.venue !== undefined && typeof data.venue !== "string") {
    errors.push(`\`venue\` must be a string, got ${typeof data.venue}`);
  }

  if (data.doi !== undefined && typeof data.doi !== "string") {
    errors.push(`\`doi\` must be a string, got ${typeof data.doi}`);
  }

  if (data.paperUrl !== undefined && typeof data.paperUrl !== "string") {
    errors.push(`\`paperUrl\` must be a string, got ${typeof data.paperUrl}`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid frontmatter in "README.md" (entry slug: "${slug}"):\n  ${errors.join("\n  ")}`,
    );
  }
}

function normalizeAuthors(data: Record<string, unknown>): string[] | undefined {
  if (data.authors === undefined) return undefined;
  if (typeof data.authors === "string") {
    return [data.authors];
  }
  if (Array.isArray(data.authors)) {
    return data.authors.filter((a): a is string => typeof a === "string");
  }
  return undefined;
}

function toContentMeta(
  entryDir: string,
  rootDir: string,
  entryPublicPrefix: string,
  rootPublicPrefix: string,
  placeholderFilename: string,
  slug: string,
  data: Record<string, unknown>,
): ContentMeta {
  validateFrontmatter(slug, data);

  const image =
    typeof data.image === "string"
      ? data.image
      : typeof data.imageUrl === "string"
        ? data.imageUrl
        : undefined;

  const tags = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === "string")
    : undefined;
  const excerpt = typeof data.excerpt === "string" ? data.excerpt : undefined;
  const team = typeof data.team === "string" ? data.team : undefined;
  const authors = normalizeAuthors(data);
  const venue = typeof data.venue === "string" ? data.venue : undefined;
  const doi = typeof data.doi === "string" ? data.doi : undefined;
  const paperUrl =
    typeof data.paperUrl === "string" ? data.paperUrl : undefined;
  const links = Array.isArray(data.links)
    ? data.links.filter((l): l is string => typeof l === "string")
    : undefined;
  const draft = data.draft === true;

  const resolvedImage = resolveImage(
    entryDir,
    rootDir,
    entryPublicPrefix,
    rootPublicPrefix,
    placeholderFilename,
    slug,
    image,
  );

  // If an image was explicitly specified in frontmatter, validate that
  // the file exists. A missing explicitly-specified image indicates a typo
  // or missing asset, not an intentional placeholder fallback.
  if (image && !fileExistsInDir(entryDir, image)) {
    throw new Error(
      `Invalid frontmatter in "README.md" (entry slug: "${slug}"):\n` +
        `  \`image\` references "${image}" but the file was not found in "${entryDir}". ` +
        `Add the file or remove the \`image\` field to use the default placeholder.`,
    );
  }

  return {
    slug,
    href: entryPublicPrefix,
    title: data.title as string,
    date: data.date as string,
    ...(tags && tags.length > 0 && { tags }),
    ...(excerpt && { excerpt }),
    ...(team && { team }),
    ...(authors && authors.length > 0 && { authors }),
    ...(venue && { venue }),
    ...(doi && { doi }),
    ...(paperUrl && { paperUrl }),
    ...(links && links.length > 0 && { links }),
    ...(image && { image }),
    ...(draft && { draft }),
    imageSrc: resolvedImage.src,
    imageType: resolvedImage.imageType,
  };
}

export function createContentLibrary(
  config: ContentLibraryConfig,
): ContentLibrary {
  const contentPath = resolveContentPath(config.mdDir);

  function getAll(): ContentMeta[] {
    if (!fs.existsSync(contentPath)) {
      return [];
    }

    // Per-entry directory structure: each subdirectory is an entry
    // with its own README.md.  Flat .md files at the root level (such
    // as _template.md) are ignored.
    const items = fs
      .readdirSync(contentPath)
      .filter((entry) => {
        const fullPath = path.join(contentPath, entry);
        try {
          return fs.statSync(fullPath).isDirectory();
        } catch {
          return false;
        }
      })
      .filter((dir) => !dir.startsWith("_") && !dir.startsWith("."))
      .map((dir) => {
        const entryDir = path.join(contentPath, dir);
        const candidates = [
          path.join(entryDir, ENTRY_FILENAME),
          path.join(entryDir, "README.mdx"),
        ];
        const filePath = candidates.find((p) => fs.existsSync(p));
        if (!filePath) {
          return null;
        }
        return { entryDir, dir, filePath };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .map(({ entryDir, dir, filePath }) => {
        const content = fs.readFileSync(filePath, "utf-8");
        const { data } = matter(content);
        const slug =
          typeof data.slug === "string" && (data.slug as string).trim() !== ""
            ? (data.slug as string)
            : dir;

        return toContentMeta(
          entryDir,
          contentPath,
          `${config.publicPrefix}/${slug}`,
          config.publicPrefix,
          config.placeholderFilename,
          slug,
          data as Record<string, unknown>,
        );
      })
      .filter((item) => !item.draft);

    // Validate slug uniqueness — two entries with the same slug would
    // create conflicting static routes and broken canonical URLs.
    const seenSlugs = new Set<string>();
    const duplicates = new Set<string>();
    for (const item of items) {
      if (seenSlugs.has(item.slug)) {
        duplicates.add(item.slug);
      }
      seenSlugs.add(item.slug);
    }
    if (duplicates.size > 0) {
      throw new Error(
        `Duplicate slug(s) found in "${config.mdDir}": ` +
          `[${[...duplicates].join(", ")}]. Each entry must have a unique slug.`,
      );
    }

    return items.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }

  function getBySlug(slug: string): ContentMeta | undefined {
    if (!slug?.trim() || typeof slug !== "string") {
      return undefined;
    }

    const entryDir = path.join(contentPath, slug);
    const filePath = path.join(entryDir, ENTRY_FILENAME);
    const extAlt = ENTRY_FILENAME.replace(/\.md$/, ".mdx");
    const filePathAlt = path.join(entryDir, extAlt);

    for (const currentPath of [filePath, filePathAlt]) {
      if (!fs.existsSync(currentPath)) {
        continue;
      }
      const content = fs.readFileSync(currentPath, "utf-8");
      const { data } = matter(content);
      const resolvedSlug =
        typeof data.slug === "string" && (data.slug as string).trim() !== ""
          ? (data.slug as string)
          : slug;

      return toContentMeta(
        entryDir,
        contentPath,
        `${config.publicPrefix}/${resolvedSlug}`,
        config.publicPrefix,
        config.placeholderFilename,
        resolvedSlug,
        data as Record<string, unknown>,
      );
    }
    return undefined;
  }

  function getContentBySlug(
    slug: string,
  ): Promise<ContentItemMeta | undefined> {
    return (async () => {
      if (!slug?.trimEnd() || typeof slug !== "string") {
        return undefined;
      }

      const entryDir = path.join(contentPath, slug);
      const filePath = path.join(entryDir, ENTRY_FILENAME);
      const extAlt = ENTRY_FILENAME.replace(/\.md$/, ".mdx");
      const filePathAlt = path.join(entryDir, extAlt);

      for (const currentPath of [filePath, filePathAlt]) {
        if (!fs.existsSync(currentPath)) {
          continue;
        }
        const content = fs.readFileSync(currentPath, "utf-8");
        const { data, content: body } = matter(content);
        const resolvedSlug =
          typeof data.slug === "string" && (data.slug as string).trim() !== ""
            ? (data.slug as string)
            : slug;

        // Use an entry-specific public prefix so body images resolve to
        // /projects/<slug>/<image> instead of /projects/<image>.
        const markedInstance = createMarkedInstance({
          publicPrefix: `${config.publicPrefix}/${resolvedSlug}`,
          deploymentUrl: getDeploymentUrl(),
        });

        const meta = toContentMeta(
          entryDir,
          contentPath,
          `${config.publicPrefix}/${resolvedSlug}`,
          config.publicPrefix,
          config.placeholderFilename,
          resolvedSlug,
          data as Record<string, unknown>,
        );

        // Validate inline image references before rendering.
        validateBodyImages(body, entryDir, resolvedSlug, ENTRY_FILENAME);

        const htmlBody = await markedInstance.parse(body);

        return { ...meta, body: htmlBody };
      }
      return undefined;
    })();
  }

  return { getAll, getBySlug, getContentBySlug };
}
