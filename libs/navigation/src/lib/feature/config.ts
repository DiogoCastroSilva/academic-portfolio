export type NavigationItem = {
  name: string;
  href: string;
};

/** Base navigation items (always shown — excludes Blog, which is conditional). */
export const baseNavigation: NavigationItem[] = [
  { name: "Projects", href: "/projects" },
  { name: "Publications", href: "/publications" },
  { name: "About", href: "/about" },
];

/** Blog navigation item — only shown when published blog posts exist. */
export const blogNavigationItem: NavigationItem = {
  name: "Blog",
  href: "/blog",
};

/** Full navigation (includes Blog) — used by default for backwards compatibility. */
export const navigation: NavigationItem[] = [
  baseNavigation[0],
  baseNavigation[1],
  blogNavigationItem,
  baseNavigation[2],
];

/**
 * Compute navigation items, including Blog only when published posts exist.
 *
 * @param hasBlogPosts - Whether any non-draft blog posts are available.
 * @returns The navigation array to use for the NavBar.
 */
export function getNavigation(hasBlogPosts: boolean): NavigationItem[] {
  return hasBlogPosts ? navigation : baseNavigation;
}

/**
 * Determine whether a navigation item is "active" for the given current path.
 *
 * Uses segment-aware prefix matching: the current path must either be an
 * exact match or start with the item's href followed by a `/` separator.
 * This prevents false positives like `/projects-archive/` matching `/projects`.
 *
 * @example
 * isPathActive("/projects/example-project", "/projects")  // true
 * isPathActive("/projects", "/projects")                   // true
 * isPathActive("/projects-archive", "/projects")          // false
 * isPathActive("/blog/my-post", "/blog")                  // true
 */
export function isPathActive(
  currentPath: string | undefined,
  itemHref: string,
): boolean {
  if (!currentPath) return false;
  if (currentPath === itemHref) return true;
  return currentPath.startsWith(itemHref + "/");
}
