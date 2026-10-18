import { siteConfig } from "../configs/site-config";

describe("site-config", () => {
  it("has a valid name", () => {
    expect(siteConfig.name).toBe("Kathleen Miller");
  });

  it("has social media URLs", () => {
    expect(siteConfig.linkedInUrl).toMatch(/^https:\/\/www\.linkedin\.com\//);
    expect(siteConfig.githubUrl).toMatch(/^https:\/\/github\.com\//);
  });

  it("has a valid email address", () => {
    expect(siteConfig.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("has content license information", () => {
    expect(siteConfig.contentLicenseName).toBeTruthy();
    expect(siteConfig.contentLicenseUrl).toMatch(/^https:\/\//);
  });

  it("has repo license information", () => {
    expect(siteConfig.repoLicenseName).toBeTruthy();
    expect(siteConfig.repoLicenseUrl).toMatch(/^https:\/\//);
  });

  it("has analytics configuration disabled by default (no token set)", () => {
    expect(siteConfig.analytics.cloudflare.enabled).toBe(false);
    expect(siteConfig.analytics.cloudflare.token).toBe("");
  });

  it("has a deployment URL field from environment", () => {
    // deploymentUrl is set from NEXT_PUBLIC_DEPLOYMENT_URL env var
    // It may be undefined in local dev, but the field should exist
    const type = typeof siteConfig.deploymentUrl;
    expect(["string", "undefined"]).toContain(type);
  });

  it("uses NEXT_PUBLIC_DEPLOYMENT_URL environment variable", () => {
    const configField = siteConfig.deploymentUrl;
    const envValue = process.env.NEXT_PUBLIC_DEPLOYMENT_URL;

    if (envValue) {
      expect(configField).toBe(envValue);
    } else {
      expect(configField).toBeUndefined();
    }
  });
});
