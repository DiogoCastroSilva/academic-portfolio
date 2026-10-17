import { getProfile, type ProfileData } from "@katie-portfolio/content";

// Load personal data from profile.md at module load time.
// Falls back to hardcoded defaults if the profile file is unavailable.
let profile: ProfileData | null = null;
try {
  profile = getProfile();
} catch {
  // Profile file not found or invalid — use fallback defaults below.
}

export const siteConfig = {
  name: profile?.name ?? "Kathleen Miller",
  role:
    profile?.role ?? "PhD Researcher | Earth Observation | Climate Solutions",
  email: profile?.email ?? "katie.miller6572@gmail.com",
  linkedInUrl:
    profile?.linkedInUrl ?? "https://www.linkedin.com/in/kathleen-rose-miller/",
  githubUrl: profile?.githubUrl ?? "https://github.com/kathleen-miller",
  contentLicenseName: "CC BY-NC-ND 4.0",
  contentLicenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
  repoLicenseName: "MIT",
  repoLicenseUrl: "https://opensource.org/licenses/MIT",
  /** Canonical deployment URL. Set by CI from GITHUB_REPOSITORY. */
  deploymentUrl: process.env.NEXT_PUBLIC_DEPLOYMENT_URL || undefined,
  analytics: {
    cloudflare: {
      token:
        process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN ??
        "613324dfdf5043a19a5a8f040a7b180b",
      enabled: process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_DISABLED !== "true",
    },
  },
};
