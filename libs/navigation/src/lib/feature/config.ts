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
