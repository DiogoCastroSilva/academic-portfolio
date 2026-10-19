import {
  baseNavigation,
  blogNavigationItem,
  getNavigation,
  isPathActive,
  navigation,
} from "./config.js";

describe("navigation config", () => {
  it("exports a non-empty array of navigation items", () => {
    expect(Array.isArray(navigation)).toBe(true);
    expect(navigation.length).toBeGreaterThan(0);
  });

  it("every item has a non-empty name and href", () => {
    for (const item of navigation) {
      expect(item.name).toMatch(/^\S+/);
      expect(item.href).toMatch(/^\/\S/);
    }
  });

  it("includes the core site sections", () => {
    const names = navigation.map((item) => item.name);
    expect(names).toEqual(
      expect.arrayContaining(["Projects", "Publications", "About"]),
    );
  });

  it("all hrefs are root-relative paths without query strings", () => {
    for (const item of navigation) {
      expect(item.href).toMatch(/^\/[a-z-]*$/);
    }
  });

  it("baseNavigation excludes Blog", () => {
    const names = baseNavigation.map((item) => item.name);
    expect(names).not.toContain("Blog");
  });

  it("navigation includes Blog by default", () => {
    const names = navigation.map((item) => item.name);
    expect(names).toContain("Blog");
    // Blog is between Publications and About
    const blogIndex = names.indexOf("Blog");
    expect(names[blogIndex - 1]).toBe("Publications");
    expect(names[blogIndex + 1]).toBe("About");
  });

  it("blogNavigationItem has correct name and href", () => {
    expect(blogNavigationItem).toEqual({ name: "Blog", href: "/blog" });
  });

  it("getNavigation(true) includes Blog", () => {
    const items = getNavigation(true);
    const names = items.map((item) => item.name);
    expect(names).toContain("Blog");
  });

  it("getNavigation(false) excludes Blog", () => {
    const items = getNavigation(false);
    const names = items.map((item) => item.name);
    expect(names).not.toContain("Blog");
  });

  it("getNavigation(false) equals baseNavigation", () => {
    expect(getNavigation(false)).toEqual(baseNavigation);
  });

  // ---------------------------------------------------------------------------
  // isPathActive — segment-aware prefix matching
  // ---------------------------------------------------------------------------

  it("isPathActive returns true for exact match", () => {
    expect(isPathActive("/projects", "/projects")).toBe(true);
    expect(isPathActive("/about", "/about")).toBe(true);
    expect(isPathActive("/blog", "/blog")).toBe(true);
  });

  it("isPathActive returns true for nested detail routes", () => {
    expect(isPathActive("/projects/example-project", "/projects")).toBe(true);
    expect(
      isPathActive("/projects/example-project/sub/page", "/projects"),
    ).toBe(true);
    expect(isPathActive("/blog/my-post", "/blog")).toBe(true);
    expect(isPathActive("/publications/my-paper", "/publications")).toBe(true);
  });

  it("isPathActive returns false for sibling routes with similar prefixes", () => {
    expect(isPathActive("/projects-archive", "/projects")).toBe(false);
    expect(isPathActive("/blogging", "/blog")).toBe(false);
    expect(isPathActive("/about-us", "/about")).toBe(false);
  });

  it("isPathActive returns false for root path on section pages", () => {
    expect(isPathActive("/", "/projects")).toBe(false);
    expect(isPathActive("", "/blog")).toBe(false);
  });

  it("isPathActive handles trailing slashes", () => {
    expect(isPathActive("/projects/", "/projects")).toBe(true);
    expect(isPathActive("/blog/", "/blog")).toBe(true);
  });
});
