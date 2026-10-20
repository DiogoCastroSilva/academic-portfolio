import { getAllBlogPosts } from "@academic-portfolio/blog";
import { getNavigation, NavBar } from "@academic-portfolio/navigation";
import "./global.css";
import { CloudflareAnalytics } from "./ui/CloudflareAnalytics";
import { Footer } from "./ui/Footer";

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
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: {
      url: "/favicon.svg",
      type: "image/svg+xml",
    },
  },
  manifest: "/manifest.json",
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
      <body
        suppressHydrationWarning
        className="min-h-full bg-stone-100 dark:bg-slate-800"
      >
        <div className="flex min-h-full flex-col">
          <NavBar name={siteConfig.name} items={navItems} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CloudflareAnalytics />
        <link
          rel="preload"
          as="image"
          href="/images/profile.webp"
          type="image/webp"
        />
      </body>
    </html>
  );
}
