/**
 * Generate robots.txt and sitemap.xml after static build.
 *
 * Usage: node tools/generate-sitemap.mjs
 *
 * Environment variables:
 * - NEXT_PUBLIC_DEPLOYMENT_URL — base URL for canonical links (e.g., https://user.github.io/repo)
 *
 * Excludes from the sitemap:
 * - Error pages: /404/, /_not-found/
 * - Redirect-only pages: /{collection}/page/1/ (page 1 of any paginated collection
 *   is a `<meta http-equiv="refresh">` redirect stub to the collection root; it is
 *   not a content page and should not appear in the sitemap)
 * - Draft content (excluded at build time, never generates HTML)
 * - Non-existent slug pages (404 fallback routes)
 */

import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const publicDir = path.join(cwd, "public");
const baseUrl = process.env.NEXT_PUBLIC_DEPLOYMENT_URL || "";

/** Routes to exclude from the sitemap (error pages, placeholders) */
const EXCLUDE_ROUTES = new Set([
  "404",
  "_not-found",
  "NON-EXISTENT-SLUG",
  "non-existent-slug",
]);

/**
 * Detects redirect-only page routes that should be excluded from the sitemap.
 *
 * In this app, page 1 of any paginated collection (`/{collection}/page/1/`)
 * is a `<meta http-equiv="refresh">` redirect stub to the collection root
 * (`/{collection}/`). It has no canonical content and should not appear in
 * the sitemap.
 */
function isRedirectRoute(route) {
  const segments = route.split("/");
  return (
    segments.length >= 2 &&
    segments[segments.length - 1] === "1" &&
    segments[segments.length - 2] === "page"
  );
}

function collectRoutes(dir, routes = []) {
  if (!fs.existsSync(dir)) return routes;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      collectRoutes(fullPath, routes);
    } else if (
      entry.isFile() &&
      entry.name === "index.html" &&
      !fullPath.includes("__next")
    ) {
      const relPath = path.relative(publicDir, path.dirname(fullPath));
      const cleanRoute = relPath.split(path.sep).join("/");
      routes.push(cleanRoute);
    }
  }

  return routes;
}

function filterRoutes(routes) {
  return routes.filter((route) => {
    // Exclude error pages and non-content routes
    const segments = route.split("/");
    for (const segment of segments) {
      if (EXCLUDE_ROUTES.has(segment)) return false;
    }
    // Exclude page-1 redirect stubs from paginated collections
    if (isRedirectRoute(route)) return false;
    return true;
  });
}

function toFullUrl(route) {
  const cleanRoute = route.replace(/\/+$/, "");
  if (!cleanRoute) return `${baseUrl}/`;
  return `${baseUrl}/${cleanRoute}/`;
}

function generateRobotsTxt() {
  const sitemapUrl = `${toFullUrl("")}sitemap.xml`;
  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
}

function generateSitemap(routes) {
  const urls = routes
    .map((route) => {
      const fullUrl = toFullUrl(route);
      return `  <url>
    <loc>${fullUrl}</loc>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function main() {
  if (!fs.existsSync(publicDir)) {
    console.error("public/ directory not found. Run build first.");
    process.exit(1);
  }

  const allRoutes = collectRoutes(publicDir);
  const routes = filterRoutes(allRoutes);

  const robotsPath = path.join(publicDir, "robots.txt");
  fs.writeFileSync(robotsPath, generateRobotsTxt());
  console.log(`Generated ${robotsPath} (${routes.length} routes)`);

  const sitemapPath = path.join(publicDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, generateSitemap(routes));
  console.log(`Generated ${sitemapPath} (${routes.length} routes)`);
}

main();
