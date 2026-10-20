/**
 * Generate static Open Graph image assets (SVG) during the build.
 *
 * Instead of embedding `data:image/svg+xml;base64,...` URIs in page metadata
 * (which social-preview crawlers do not reliably support), this script
 * generates real SVG files into `public/og/` and references them via
 * absolute HTTPS URLs resolved by Next.js `metadataBase`.
 *
 * The SVG generation logic mirrors the TypeScript implementation in
 * `apps/main/src/app/lib/og-image.ts`. The script is plain Node.js so it
 * can run without a TypeScript runtime.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const ogDir = path.join(publicDir, "og");

const MAX_CHARS_PER_LINE = 34;
const MAX_TITLE_LINES = 3;

const XML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPE_MAP[char] ?? char);
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  if (lines.length > MAX_TITLE_LINES) {
    const last = lines.pop();
    const secondLast = lines.pop();
    lines.push(`${secondLast} ${last}`.slice(0, maxChars));
  }

  return lines;
}

function generateOgSvg({ title, subtitle, width = 1200, height = 630 }) {
  const lines = wrapText(title, MAX_CHARS_PER_LINE);
  const lineCount = lines.length;

  const titleFontSize =
    lineCount === 1 ? 64 : Math.max(40, 56 - (lineCount - 1) * 4);
  const titleY = Math.max(220, 280 - (lineCount - 1) * 25);

  const titleElements = lines
    .map((line, i) => {
      const y = titleY + i * (titleFontSize + 12);
      return `<text x="80" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="${titleFontSize}" font-weight="700" fill="#0f172a">${escapeXml(line)}</text>`;
    })
    .join("\n    ");

  const subtitleY = titleY + lineCount * (titleFontSize + 12) + 20;
  const subtitleElement = subtitle
    ? `<text x="80" y="${subtitleY}" font-family="Inter, system-ui, sans-serif" font-size="32" fill="#64748b">${escapeXml(subtitle)}</text>`
    : "";

  const footerY = height - 70;
  const footerElement = `<text x="80" y="${footerY}" font-family="Inter, system-ui, sans-serif" font-size="24" fill="#94a3b8">Portfolio</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="og-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e0f2fe"/>
      <stop offset="1" stop-color="#f1f5f9"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#og-bg)"/>
  ${titleElements}
  ${subtitleElement}
  ${footerElement}
</svg>`;
}

function writeOgImage(filename, params) {
  const svg = generateOgSvg(params);
  const outputPath = path.join(ogDir, filename);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, svg, "utf-8");
  console.log(`  Generated OG: og/${filename}`);
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
const ENTRY_FILENAME = "README.md";

function readContentEntries(mdDir) {
  const contentPath = path.join(root, mdDir);
  if (!fs.existsSync(contentPath)) return [];

  const entries = fs.readdirSync(contentPath, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;

    const filePath = path.join(contentPath, entry.name, ENTRY_FILENAME);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(content);

    if (data.draft === true) continue;

    results.push({
      slug: data.slug || entry.name,
      title: data.title || entry.name,
      excerpt: data.excerpt || "",
    });
  }

  return results;
}

async function main() {
  fs.mkdirSync(ogDir, { recursive: true });

  const profilePath = path.join(root, "libs/content/src/md/profile.md");
  const profileContent = fs.readFileSync(profilePath, "utf-8");
  const { data: profileData } = matter(profileContent);
  const siteName = profileData.name || "Portfolio";
  const siteRole = profileData.role || "";

  writeOgImage("home.svg", {
    title: siteName,
    subtitle: siteRole,
  });

  writeOgImage("about.svg", {
    title: siteName,
    subtitle: siteRole,
  });

  const collections = [
    {
      dir: "libs/projects/src/md",
      type: "project",
      listingImage: "projects.svg",
      listingTitle: "Projects",
    },
    {
      dir: "libs/publications/src/md",
      type: "publication",
      listingImage: "publications.svg",
      listingTitle: "Publications",
    },
    {
      dir: "libs/blog/src/md",
      type: "blog",
      listingImage: "blog.svg",
      listingTitle: "Blog",
    },
  ];

  for (const { dir, type, listingImage, listingTitle } of collections) {
    const entries = readContentEntries(dir);

    writeOgImage(listingImage, {
      title: listingTitle,
      subtitle: `${siteName} — Field notes`,
    });

    for (const entry of entries) {
      writeOgImage(`${type}-${entry.slug}.svg`, {
        title: entry.title,
        subtitle: entry.excerpt,
      });
    }
  }

  console.log("OG images generated.");
}

main().catch(console.error);
