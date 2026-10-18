/**
 * Dynamic Open Graph image generator for static export.
 *
 * Generates 1200×630 SVG images with customizable title, subtitle, and
 * optional background image. Used in Next.js `generateMetadata` to produce
 * per-page OG images for social sharing.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG
 * @see https://opengraph.com/
 */

/** Characters that need XML escaping in SVG `<text>` content. */
const XML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

/** Maximum characters before wrapping to a new line. */
const MAX_CHARS_PER_LINE = 34;

/** Maximum number of title lines before reducing font size. */
const MAX_TITLE_LINES = 3;

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPE_MAP[char] ?? char);
}

/**
 * Split a string into lines no longer than `maxChars` by breaking on word
 * boundaries. If a single word exceeds `maxChars`, it gets its own line.
 */
export function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
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

  // If too many lines, merge last two to fit
  if (lines.length > MAX_TITLE_LINES) {
    const last = lines.pop()!;
    const secondLast = lines.pop()!;
    lines.push(`${secondLast} ${last}`.slice(0, maxChars));
  }

  return lines;
}

export interface OgImageParams {
  /** Large heading text — typically the page title or person's name. */
  title: string;
  /** Smaller text below the title — e.g. role, excerpt, or tagline. */
  subtitle?: string;
  /** Width in pixels (default 1200). */
  width?: number;
  /** Height in pixels (default 630). */
  height?: number;
}

/**
 * Generate an SVG string for use as an Open Graph image.
 *
 * The SVG uses a soft blue gradient background with left-aligned text.
 * Titles longer than `MAX_CHARS_PER_LINE` are automatically wrapped.
 */
export function generateOgImageSvg({
  title,
  subtitle,
  width = 1200,
  height = 630,
}: OgImageParams): string {
  const lines = wrapText(title, MAX_CHARS_PER_LINE);
  const lineCount = lines.length;

  // Scale font size down for multi-line titles
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

/**
 * Convert an SVG string to a base64 data URI suitable for use as an
 * Open Graph image URL.
 */
export function generateOgImageUri(svg: string): string {
  const base64 = Buffer.from(svg, "utf-8").toString("base64");
  return `data:image/svg+xml;charset=utf-8;base64,${base64}`;
}

/**
 * Convenience: generate an OG image data URI in one call.
 */
export function generateOgImage(params: OgImageParams): string {
  return generateOgImageUri(generateOgImageSvg(params));
}
