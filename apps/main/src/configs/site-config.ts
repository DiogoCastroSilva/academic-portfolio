export const siteConfig = {
  name: "Kathleen Miller",
  linkedInUrl: "https://www.linkedin.com/in/kathleen-rose-miller/",
  githubUrl: "https://github.com/kathleen-miller",
  email: "katie.miller6572@gmail.com",
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
