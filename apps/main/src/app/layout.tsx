import { getAllBlogPosts } from "@academic-portfolio/blog";
import {
  getNavigation,
  NavBar,
  themeInitScript,
} from "@academic-portfolio/navigation";
import "./global.css";
import { CloudflareAnalytics } from "../components/CloudflareAnalytics";
import { Footer } from "../components/Footer";

import { withPublicBasePath } from "@academic-portfolio/content";

import { siteConfig } from "../configs/site-config";
import { ogImageRef } from "./lib/og-image";

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description ?? `Portfolio of ${siteConfig.name}.`,
  // metadataBase enables Next.js to resolve relative OG image URLs and canonical links.
  metadataBase: siteConfig.deploymentUrl
    ? new URL(siteConfig.deploymentUrl)
    : undefined,
  icons: {
    icon: [
      { url: withPublicBasePath("/favicon.svg"), type: "image/svg+xml" },
      { url: withPublicBasePath("/favicon.ico") },
    ],
    apple: {
      url: withPublicBasePath("/favicon.svg"),
      type: "image/svg+xml",
    },
  },
  manifest: withPublicBasePath("/manifest.json"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: getSiteUrl(),
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description ?? `Portfolio of ${siteConfig.name}.`,
    images: [
      {
        url: ogImageRef("home.svg"),
        alt: `${siteConfig.name} — Portfolio`,
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: siteConfig.deploymentUrl
    ? { canonical: getSiteUrl() }
    : undefined,
  ...(siteConfig.googleSiteVerification
    ? {
        googleSiteVerification: siteConfig.googleSiteVerification,
      }
    : {}),
};

function getSiteUrl(path = ""): string | undefined {
  const base = siteConfig.deploymentUrl;
  if (!base) return undefined;
  return `${base}${path}`;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Compute navigation server-side: hide Blog when no published blog posts exist.
  const hasBlogPosts = getAllBlogPosts().length > 0;
  const navItems = getNavigation(hasBlogPosts);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Inline theme-init script: reads localStorage and sets [data-theme]
          on <html> synchronously before first paint to prevent FOUC.
          Not a client component — pure JS string injected via dangerouslySetInnerHTML.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full bg-stone-100 dark:bg-slate-800"
      >
        <div className="flex min-h-full flex-col">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:text-slate-900 focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-sky-600"
          >
            Skip to main content
          </a>
          <NavBar name={siteConfig.name} items={navItems} />
          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <CloudflareAnalytics />
        <link
          rel="preload"
          as="image"
          href={withPublicBasePath("/images/profile.svg")}
          type="image/svg+xml"
        />
      </body>
    </html>
  );
}
