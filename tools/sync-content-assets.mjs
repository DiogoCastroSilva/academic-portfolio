/**
 * Sync content assets to the public directory.
 *
 * Copies images from library markdown directories to the app's public folder,
 * and generates WebP versions for JPEG and PNG files to reduce bandwidth.
 * Also resizes images to a maximum width of 1200px to reduce bandwidth
 * while preserving full resolution for detail pages.
 *
 * Environment variables:
 * - SKIP_WEBP_CONVERSION — set to "true" to skip WebP generation (e.g., in dev)
 * - SKIP_IMAGE_RESIZE — set to "true" to skip image resizing (e.g., in dev)
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const CONTENT_SOURCES = [
  {
    src: "libs/projects/src/md",
    dest: "apps/main/public/projects",
  },
  {
    src: "libs/publications/src/md",
    dest: "apps/main/public/publications",
  },
  {
    src: "libs/blog/src/md",
    dest: "apps/main/public/blog",
  },
  {
    src: "libs/content/src/md",
    dest: "apps/main/public/images",
    // The images/ directory also contains static assets (e.g., og-image.svg)
    // that are not content images. Skip cleanup to avoid deleting them.
    cleanup: false,
  },
];

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
]);

const CONVERTIBLE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

function isContentImage(filename) {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function isConvertable(filename) {
  return CONVERTIBLE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function hasCwebp() {
  return spawnSync("which", ["cwebp"]).status === 0;
}

function convertToWebpSync(inputPath, outputPath) {
  // Try cwebp first (fast, native)
  if (hasCwebp()) {
    const result = spawnSync(
      "cwebp",
      ["-q", "85", inputPath, "-o", outputPath],
      {
        encoding: "utf-8",
      },
    );
    return result.status === 0;
  }

  // Fall back to sharp CLI via npx
  const result = spawnSync(
    "npx",
    ["--yes", "sharp", inputPath, "--webp", "--output", outputPath],
    {
      encoding: "utf-8",
      cwd: root,
    },
  );
  return result.status === 0;
}

async function convertToWebp(inputPath, outputPath) {
  // Try cwebp first (fast, native)
  if (hasCwebp()) {
    return convertToWebpSync(inputPath, outputPath);
  }

  // Fall back to sharp library (async)
  try {
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default || sharpModule;
    await sharp(inputPath).webp({ quality: 85 }).toFile(outputPath);
    return true;
  } catch (err) {
    console.warn(`  Sharp conversion failed: ${err?.message || err}`);
    return false;
  }
}

/**
 * Resize an image to MAX_IMAGE_WIDTH while preserving aspect ratio.
 * Uses sharp (already a project dependency).
 */
async function resizeImage(inputPath, outputPath) {
  try {
    const sharpModule = await import("sharp");
    const sharp = sharpModule.default || sharpModule;
    await sharp(inputPath)
      .rotate()
      .resize({
        width: MAX_IMAGE_WIDTH,
        withoutEnlargement: true,
      })
      .toFile(outputPath);
    return true;
  } catch (err) {
    console.warn(`  Sharp resize failed: ${err?.message || err}`);
    return false;
  }
}

const MAX_IMAGE_WIDTH = 1200;
const skipWebp = process.env.SKIP_WEBP_CONVERSION === "true";
const skipResize = process.env.SKIP_IMAGE_RESIZE === "true";

async function syncDirectory(srcDir, destDir, opts = { cleanup: true }) {
  fs.mkdirSync(destDir, { recursive: true });

  if (!fs.existsSync(srcDir)) {
    return new Set();
  }

  const expectedFiles = new Set(); // relative paths of all expected output files (originals + webp)
  const copied = new Set();

  /**
   * Recursively walk srcDir, copying image files to destDir while
   * preserving the relative directory structure.
   */
  async function walkSrc(dir, relativeDir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(dir, entry.name);
      const relPath = relativeDir
        ? path.posix.join(relativeDir, entry.name)
        : entry.name;

      if (entry.isDirectory()) {
        // Skip hidden directories (._template, .git) and template dirs.
        if (entry.name.startsWith("_") || entry.name.startsWith(".")) {
          continue;
        }
        await walkSrc(srcPath, relPath);
      } else if (entry.isFile() && isContentImage(entry.name)) {
        const destPath = path.join(destDir, relPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });

        // Resize large images to reduce bandwidth (skip for SVG)
        if (!skipResize && isConvertable(entry.name)) {
          if (!(await resizeImage(srcPath, destPath))) {
            // Fall back to direct copy if resize fails
            fs.copyFileSync(srcPath, destPath);
          } else {
            console.log(`  Resized: ${relPath}`);
          }
        } else {
          fs.copyFileSync(srcPath, destPath);
        }

        expectedFiles.add(relPath);
        copied.add(relPath);

        // Generate WebP version
        if (!skipWebp && isConvertable(entry.name)) {
          const ext = path.extname(entry.name).toLowerCase();
          const baseName = path.basename(entry.name, ext);
          const relDir = path.posix.dirname(relPath);
          const webpRelPath =
            relDir !== "."
              ? path.posix.join(relDir, `${baseName}.webp`)
              : `${baseName}.webp`;
          const outputPath = path.join(destDir, webpRelPath);

          if (await convertToWebp(destPath, outputPath)) {
            console.log(`  Generated WebP: ${webpRelPath}`);
            expectedFiles.add(webpRelPath);
            copied.add(webpRelPath);
          } else {
            console.warn(
              `  WebP conversion failed for ${relPath}, keeping original`,
            );
          }
        }
      }
    }
  }

  await walkSrc(srcDir, "");

  // Clean up orphaned files (including old WebP) from the destination
  if (opts.cleanup) {
    const allExtensions = new Set([...IMAGE_EXTENSIONS, ".webp"]);

    function cleanDest(dir, relativeDir) {
      if (!fs.existsSync(dir)) return;

      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        const relPath = relativeDir
          ? path.posix.join(relativeDir, entry.name)
          : entry.name;

        if (entry.isDirectory()) {
          cleanDest(fullPath, relPath);
          // Remove empty directories after cleanup
          try {
            if (fs.readdirSync(fullPath).length === 0) {
              fs.rmdirSync(fullPath);
            }
          } catch {}
        } else if (entry.isFile()) {
          if (entry.name === ".gitkeep") continue;

          const ext = path.extname(entry.name).toLowerCase();
          if (allExtensions.has(ext) && !expectedFiles.has(relPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
    }

    cleanDest(destDir, "");
  }

  return copied;
}

async function main() {
  for (const { src, dest, ...opts } of CONTENT_SOURCES) {
    const srcDir = path.join(root, src);
    const destDir = path.join(root, dest);

    const copied = await syncDirectory(srcDir, destDir, opts);
    const names = [...copied].sort().join(", ") || "(none)";
    console.log(`Synced ${path.relative(root, destDir)}: ${names}`);
  }

  generateManifest();
}

/**
 * Generate manifest.json with base-path-aware URLs.
 *
 * Next.js does not prepend `basePath` to manifest.json file contents or
 * to `metadata.icons`/`metadata.manifest` URLs. The static file in
 * `public/manifest.json` serves as a root-site template; this function
 * overwrites it at build time with the correct base path so that
 * repository-site deployments (`/<repo>/`) get correct asset URLs.
 */
function generateManifest() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const manifest = {
    name: "Academic Portfolio",
    short_name: "Portfolio",
    description: "Academic portfolio.",
    start_url: `${basePath}/`,
    display: "standalone",
    background_color: "#1e293b",
    theme_color: "#028468",
    icons: [
      {
        src: `${basePath}/favicon.ico`,
        sizes: "32x32",
        type: "image/x-icon",
      },
      {
        src: `${basePath}/favicon.svg`,
        sizes: "100x100",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };

  const manifestPath = path.join(root, "apps/main/public/manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Generated manifest.json (basePath: "${basePath || "(root)"}")`);
}

main();
