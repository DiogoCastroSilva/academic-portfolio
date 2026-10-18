import { getProfile, type ProfileData } from "@katie-portfolio/content";

// Load personal data from profile.md at module load time.
// If the profile is missing or invalid, fail the build with a clear error
// rather than silently falling back to hardcoded personal information.
const profile: ProfileData = getProfile();

export const siteConfig = {
  name: profile.name,
  role: profile.role,
  email: profile.email,
  linkedInUrl: profile.linkedInUrl,
  githubUrl: profile.githubUrl,
  contentLicenseName: "CC BY-NC-ND 4.0",
  contentLicenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
  repoLicenseName: "MIT",
  repoLicenseUrl: "https://opensource.org/licenses/MIT",
  /** Canonical deployment URL. Set by CI from GITHUB_REPOSITORY. */
  deploymentUrl: process.env.NEXT_PUBLIC_DEPLOYMENT_URL || undefined,
  analytics: {
    cloudflare: {
      // Analytics must be explicitly configured via environment variable.
      // No hardcoded fallback token to avoid CORS errors in local/dev.
      token: process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN ?? "",
      enabled:
        process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_DISABLED !== "true" &&
        Boolean(process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN),
    },
  },
};
