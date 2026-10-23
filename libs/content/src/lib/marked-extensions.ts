import {
  Marked,
  type MarkedOptions,
  type RendererObject,
  type Token,
  type Tokens,
} from "marked";

import { DEPLOYMENT_PLACEHOLDER, withPublicBasePath } from "./constants";

/**
 * Configuration for the content renderer extensions.
 */
export interface ContentRendererConfig {
  /** Public URL prefix for content assets, e.g. `/projects`. */
  publicPrefix: string;
  /** Optional deployment URL for the DEPLOYMENT_URL placeholder. */
  deploymentUrl?: string;
}

// ---------------------------------------------------------------------------
// Helper predicates
// ---------------------------------------------------------------------------

const EXTERNAL_URL_RE = /^https?:\/\//i;
const ANCHOR_RE = /^#/;
const MAILTO_RE = /^mailto:/i;
const ABSOLUTE_PATH_RE = /^\//;

function isExternalUrl(href: string): boolean {
  return EXTERNAL_URL_RE.test(href);
}

function isAnchor(href: string): boolean {
  return ANCHOR_RE.test(href);
}

function isMailto(href: string): boolean {
  return MAILTO_RE.test(href);
}

function isAbsoluteImagePath(href: string): boolean {
  return ABSOLUTE_PATH_RE.test(href);
}

// ---------------------------------------------------------------------------
// HTML escaping for attribute values
// ---------------------------------------------------------------------------

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// URL resolution
// ---------------------------------------------------------------------------

/**
 * Resolve a relative or placeholder href to its final URL.
 *
 * - DEPLOYMENT_URL placeholder → deployment URL (or left as placeholder)
 * - Empty href → deployment URL (or left empty)
 * - External URLs, anchors, and mailto links → returned unchanged
 * - Absolute image paths (starting with `/`) → returned unchanged
 * - Relative paths → prefixed with the base path + public prefix
 */
export function resolveHref(
  href: string,
  config: ContentRendererConfig,
  type: "image" | "link",
): string {
  // DEPLOYMENT_URL placeholder
  if (href === DEPLOYMENT_PLACEHOLDER) {
    return config.deploymentUrl ?? href;
  }

  // Empty href → deployment URL
  if (href === "") {
    return config.deploymentUrl ?? href;
  }

  // Don't modify external URLs, anchors, or mailto links
  if (isExternalUrl(href) || isAnchor(href) || isMailto(href)) {
    return href;
  }

  // For images, absolute paths (starting with /) are preserved as-is
  if (type === "image" && isAbsoluteImagePath(href)) {
    return href;
  }

  // Resolve relative path: strip leading slashes, prepend prefix.
  // config.publicPrefix already starts with "/" (e.g. "/test"), so we
  // use it directly without prepending another "/".
  const cleanPath = href.replace(/^\/+/, "");
  const prefixed = config.publicPrefix?.trim()
    ? `${config.publicPrefix}/${cleanPath}`
    : `/${cleanPath}`;
  return withPublicBasePath(prefixed);
}

// ---------------------------------------------------------------------------
// Image renderer — wraps images in <figure> with optional <figcaption>
// ---------------------------------------------------------------------------

interface RendererWithParser {
  parser: { parseInline: (tokens: Token[]) => string };
}

/**
 * Render an image token as a semantic `<figure>` with optional `<figcaption>`.
 *
 * The caption is derived from the image `title` (preferred) or the `alt` text.
 * If neither is present, no `<figcaption>` is emitted.
 */
function renderFigure(
  token: Tokens.Image,
  config: ContentRendererConfig,
): string {
  const href = resolveHref(token.href || "", config, "image");
  const title = token.title || null;
  // Alt text: prefer token.text; fall back to title for a11y when alt is
  // missing but a title is present (e.g. `![](img.png "A chart")`).
  const alt =
    token.text && token.text.trim() !== ""
      ? token.text
      : title && title.trim() !== ""
        ? title
        : "";

  let out = `<figure><img src="${escapeHtmlAttr(href)}" alt="${escapeHtmlAttr(alt)}"`;
  if (title) {
    out += ` title="${escapeHtmlAttr(title)}"`;
  }
  out += ">";

  // Caption: prefer explicit title, fall back to non-empty alt text
  const caption =
    title && title.trim() !== ""
      ? title
      : alt && alt.trim() !== ""
        ? alt
        : null;
  if (caption) {
    out += `<figcaption>${escapeHtmlAttr(caption)}</figcaption>`;
  }

  out += "</figure>";
  return out;
}

// ---------------------------------------------------------------------------
// Link renderer — adds external link security attributes
// ---------------------------------------------------------------------------

/**
 * Render a link token, adding `target="_blank" rel="noopener noreferrer"` and
 * `class="external-link"` for external URLs.
 */
function renderLink(this: RendererWithParser, token: Tokens.Link): string {
  const href = token.href || "";
  const isExternal = isExternalUrl(href);
  const text = this.parser.parseInline(token.tokens ?? []);

  let out = `<a href="${escapeHtmlAttr(href)}"`;
  if (token.title) {
    out += ` title="${escapeHtmlAttr(token.title)}"`;
  }
  if (isExternal) {
    out += ' class="external-link" target="_blank" rel="noopener noreferrer"';
  }
  out += `>${text}</a>`;
  return out;
}

// ---------------------------------------------------------------------------
// Paragraph renderer — gallery detection
// ---------------------------------------------------------------------------

/**
 * Render a paragraph token, detecting galleries of consecutive images.
 *
 * If a paragraph contains multiple image tokens (markdown images on adjacent
 * lines), it is wrapped in `<div class="gallery">` instead of `<p>`.
 */
function renderParagraph(
  this: RendererWithParser,
  token: Tokens.Paragraph,
): string {
  const inlineTokens = token.tokens ?? [];
  const images = inlineTokens.filter((t) => t.type === "image");

  if (images.length > 1) {
    const rendered = this.parser.parseInline(inlineTokens);
    return `<div class="gallery">${rendered}</div>`;
  }

  const body = this.parser.parseInline(inlineTokens);
  return `<p>${body}</p>\n`;
}

// ---------------------------------------------------------------------------
// Heading renderer — shifts levels down by 1
// ---------------------------------------------------------------------------

/**
 * Markdown content is always rendered below a page-level H1 (e.g. the post
 * title in ContentDetail, or the person's name in AboutHero/AboutSection).
 *
 * To enforce the heading-hierarchy rule — "Markdown content headings start
 * at H2 (since H1 is reserved for the page title)" — this renderer shifts
 * every heading level down by 1:
 *
 * - `#`  (h1) → `<h2>`
 * - `##` (h2) → `<h3>`
 * - `###` (h3) → `<h4>`
 * - ... capped at `<h6>`
 *
 * This prevents duplicate H1s and keeps the document outline sequential
 * (h1 → h2 → h3 → …) with no skipped levels.
 */
function renderHeading(token: Tokens.Heading): string {
  const shiftedDepth = Math.min(token.depth + 1, 6);
  return `<h${shiftedDepth}>${token.text}</h${shiftedDepth}>`;
}

// ---------------------------------------------------------------------------
// walkTokens — resolve hrefs on image and link tokens
// ---------------------------------------------------------------------------

/**
 * Resolve URL references on `image` and `link` tokens before rendering.
 *
 * This replaces the regex-based href rewriting with a token-aware approach
 * that handles DEPLOYMENT_URL placeholders, empty hrefs, and relative paths.
 */
export function createWalkTokens(
  config: ContentRendererConfig,
): (token: Token) => void {
  return (token: Token): void => {
    if (token.type === "image") {
      (token as Tokens.Image).href = resolveHref(
        token.href || "",
        config,
        "image",
      );
    } else if (token.type === "link") {
      (token as Tokens.Link).href = resolveHref(
        token.href || "",
        config,
        "link",
      );
    }
  };
}

// ---------------------------------------------------------------------------
// postprocess hook — handle raw HTML (not covered by walkTokens)
// ---------------------------------------------------------------------------

// Match DEPLOYMENT_URL in raw HTML href attributes
const RAW_DEPLOYMENT_RE = /href=(["'])DEPLOYMENT_URL\1/g;
// Match empty href attributes in raw HTML
const RAW_EMPTY_HREF_RE = /href=(["'])\1/g;
// Match relative href/src attributes (NOT starting with /, http, mailto, #, //, or DEPLOYMENT_URL)
const RAW_RELATIVE_ATTR_RE =
  /(href|src)=(["'])(?!https?:|mailto:|#|\/|DEPLOYMENT_URL)([^"']+)\2/g;
// Match external <a> tags in raw HTML
const RAW_EXTERNAL_LINK_RE = /<a\s+href=(["'])(https?:\/\/[^"']+)\1([^>]*)>/gi;

function postprocessRawHtml(
  html: string,
  config: ContentRendererConfig,
): string {
  let out = html;

  // 1. Replace DEPLOYMENT_URL placeholder in raw HTML href attributes
  if (config.deploymentUrl) {
    out = out.replace(
      RAW_DEPLOYMENT_RE,
      `href="${escapeHtmlAttr(config.deploymentUrl)}"`,
    );

    // Replace empty href attributes with deployment URL
    out = out.replace(
      RAW_EMPTY_HREF_RE,
      `href="${escapeHtmlAttr(config.deploymentUrl)}"`,
    );
  }

  // 2. Prefix relative href/src paths in raw HTML.
  //    Markdown-rendered hrefs are already resolved by walkTokens (start with /),
  //    so the negative lookahead (?!\/) avoids double-processing them.
  out = out.replace(RAW_RELATIVE_ATTR_RE, (_match, attr, _q, value) => {
    const cleanPath = value.replace(/^\/+/, "");
    const prefixed = config.publicPrefix?.trim()
      ? `${config.publicPrefix}/${cleanPath}`
      : `/${cleanPath}`;
    const resolved = withPublicBasePath(prefixed);
    return `${attr}="${escapeHtmlAttr(resolved)}"`;
  });

  // 3. Add external link attributes to raw HTML <a> tags
  out = out.replace(RAW_EXTERNAL_LINK_RE, (match) => {
    if (match.includes("external-link")) return match;
    return match.replace(
      />$/,
      ' class="external-link" target="_blank" rel="noopener noreferrer">',
    );
  });

  // 4. Wrap every <table> in a horizontally scrollable container so that
  //    wide tables don't cause horizontal overflow on narrow viewports.
  //    marked/GFM never produces nested <table> elements, so a simple
  //    non-greedy regex is safe and reliable here. The wrapper div is
  //    transparent when the table fits within its container.
  out = out.replace(
    /<table([^>]*)>([\s\S]*?)<\/table>/g,
    '<div class="overflow-x-auto">\n<table$1>$2</table>\n</div>',
  );

  return out;
}

// ---------------------------------------------------------------------------
// Public factory
// ---------------------------------------------------------------------------

/**
 * Create marked extension objects (renderer, walkTokens, hooks) for content
 * rendering. These can be passed to a `new Marked(...)` instance.
 *
 * @example
 * ```typescript
 * const { walkTokens, renderer, hooks } = createContentRenderer(config);
 * const instance = new Marked({ gfm: true, walkTokens, renderer, hooks });
 * const html = instance.parse(markdown);
 * ```
 */
export function createContentRenderer(config: ContentRendererConfig): {
  walkTokens: (token: Token) => void;
  renderer: RendererObject;
  hooks: { postprocess: (html: string) => string };
} {
  const walkTokens = createWalkTokens(config);

  const renderer: RendererObject = {
    image: (token: Tokens.Image) => renderFigure(token, config),
    link: renderLink as RendererObject["link"],
    paragraph: renderParagraph as RendererObject["paragraph"],
    heading: renderHeading as RendererObject["heading"],
  };

  const hooks = {
    postprocess(html: string): string {
      return postprocessRawHtml(html, config);
    },
  };

  return { walkTokens, renderer, hooks };
}

/**
 * Create a ready-to-use `Marked` instance pre-configured with content renderer
 * extensions (walkTokens, custom renderers, and hooks).
 *
 * This centralises the `gfm: true` option and extension wiring so that callers
 * only need to provide a `ContentRendererConfig`.
 *
 * @example
 * ```typescript
 * const instance = createMarkedInstance({ publicPrefix: "/projects" });
 * const html = instance.parse(markdown);
 * ```
 */
export function createMarkedInstance(config: ContentRendererConfig): Marked {
  const { walkTokens, renderer, hooks } = createContentRenderer(config);
  return new Marked({
    gfm: true,
    walkTokens,
    renderer: renderer as unknown as MarkedOptions["renderer"],
    hooks: hooks as unknown as MarkedOptions["hooks"],
  });
}
