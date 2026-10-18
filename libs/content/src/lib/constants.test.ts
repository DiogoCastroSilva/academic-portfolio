import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getDeploymentUrl,
  getFullAssetUrl,
  getFullUrl,
  getPublicBasePath,
  withPublicBasePath,
} from "./constants.js";

describe("getDeploymentUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns NEXT_PUBLIC_DEPLOYMENT_URL when set", () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_URL", "https://example.com");
    expect(getDeploymentUrl()).toBe("https://example.com");
  });

  it("returns NEXT_PUBLIC_SITE_URL as fallback", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://site.example.com");
    expect(getDeploymentUrl()).toBe("https://site.example.com");
  });

  it("returns undefined when no env is set", () => {
    expect(getDeploymentUrl()).toBeUndefined();
  });
});

describe("getPublicBasePath", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns normalized base path", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/my-repo");
    expect(getPublicBasePath()).toBe("/my-repo");
  });

  it("returns empty string when not set", () => {
    expect(getPublicBasePath()).toBe("");
  });

  it("normalizes trailing slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/my-repo/");
    expect(getPublicBasePath()).toBe("/my-repo");
  });
});

describe("withPublicBasePath", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prepends base path to absolute path", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/repo");
    expect(withPublicBasePath("/projects/my-project")).toBe(
      "/repo/projects/my-project",
    );
  });

  it("returns path unchanged if not absolute", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/repo");
    expect(withPublicBasePath("relative/path")).toBe("relative/path");
  });

  it("returns path unchanged when no base path", () => {
    expect(withPublicBasePath("/projects/my-project")).toBe(
      "/projects/my-project",
    );
  });
});

describe("getFullUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("combines deployment URL with path", () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_URL", "https://example.com/repo");
    expect(getFullUrl("/projects/my-project/")).toBe(
      "https://example.com/repo/projects/my-project/",
    );
  });

  it("returns undefined when no deployment URL", () => {
    expect(getFullUrl("/projects/my-project/")).toBeUndefined();
  });
});

describe("getFullAssetUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("strips base path from asset path to avoid duplication", () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_URL", "https://example.com/repo");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/repo");
    // imageSrc already has base path: /repo/projects/image.webp
    expect(getFullAssetUrl("/repo/projects/image.webp")).toBe(
      "https://example.com/repo/projects/image.webp",
    );
  });

  it("handles asset paths without base path", () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_URL", "https://example.com");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");
    expect(getFullAssetUrl("/projects/image.webp")).toBe(
      "https://example.com/projects/image.webp",
    );
  });

  it("returns undefined when no deployment URL", () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/repo");
    expect(getFullAssetUrl("/repo/projects/image.webp")).toBeUndefined();
  });

  it("handles paths shorter than base path", () => {
    vi.stubEnv("NEXT_PUBLIC_DEPLOYMENT_URL", "https://example.com/repo");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/repo");
    expect(getFullAssetUrl("/other/path")).toBe(
      "https://example.com/repo/other/path",
    );
  });
});
