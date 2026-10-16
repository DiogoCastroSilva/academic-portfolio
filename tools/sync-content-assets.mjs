/**
 * Sync content assets to the public directory.
 *
 * Copies images from library markdown directories to the app's public folder,
 * and generates WebP versions for JPEG and PNG files to reduce bandwidth.
 *
 * Environment variables:
 * - SKIP_WEBP_CONVERSION — set to "true" to skip WebP generation (e.g., in dev)
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

const skipWebp = process.env.SKIP_WEBP_CONVERSION === "true";

async function syncDirectory(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });

  if (!fs.existsSync(srcDir)) {
    return new Set();
  }

  const copied = new Set();

  for (const file of fs.readdirSync(srcDir)) {
    if (!isContentImage(file)) {
      continue;
    }

    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    copied.add(file);

    // Generate WebP version
    // Generate WebP version
    if (!skipWebp && isConvertable(file)) {
      const ext = path.extname(file).toLowerCase();
      const baseName = path.basename(file, ext);
      const webpFile = `${baseName}.webp`;
      const inputPath = path.join(destDir, file);
      const outputPath = path.join(destDir, webpFile);

      if (await convertToWebp(inputPath, outputPath)) {
        console.log(`  Generated WebP: ${webpFile}`);
        copied.add(webpFile);
      } else {
        console.warn(`  WebP conversion failed for ${file}, keeping original`);
      }
    }
  }

  // Clean up orphaned files (including old WebP)
  const allExtensions = new Set([...IMAGE_EXTENSIONS, ".webp"]);
  for (const file of fs.readdirSync(destDir)) {
    if (
      file === ".gitkeep" ||
      !allExtensions.has(path.extname(file).toLowerCase())
    ) {
      continue;
    }
    if (
      !copied.has(file) &&
      !copied.has(`${path.basename(file, ".webp")}.webp`)
    ) {
      fs.unlinkSync(path.join(destDir, file));
    }
  }

  return copied;
}

async function main() {
  for (const { src, dest } of CONTENT_SOURCES) {
    const srcDir = path.join(root, src);
    const destDir = path.join(root, dest);

    const copied = await syncDirectory(srcDir, destDir);
    const names = [...copied].sort().join(", ") || "(none)";
    console.log(`Synced ${path.relative(root, destDir)}: ${names}`);
  }
}

main();
