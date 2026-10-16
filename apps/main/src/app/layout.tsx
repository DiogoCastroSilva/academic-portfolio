import { NavBar } from "@katie-portfolio/navigation";
import "./global.css";
import { CloudflareAnalytics } from "./ui/CloudflareAnalytics";
import { Footer } from "./ui/Footer";

import { siteConfig } from "../configs/site-config";

export const metadata = {
  title: {
    default: "Kathleen Miller",
    template: "%s | Kathleen Miller",
  },
  description:
    "Portfolio of Kathleen Miller — science, nature-based solutions, projects, and publications.",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: getSiteUrl(),
    siteName: siteConfig.name,
    title: siteConfig.name,
    description:
      "Portfolio of Kathleen Miller — science, nature-based solutions, projects, and publications.",
    images: [
      {
        url: getSiteUrl("/images/og-image.svg"),
        width: 1200,
        height: 630,
        alt: "Kathleen Miller — Portfolio",
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
  alternates: {
    canonical: getSiteUrl(),
  },
};

function getSiteUrl(path = ""): string {
  const base = siteConfig.deploymentUrl ?? "";
  return `${base}${path}`;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-full bg-stone-100 dark:bg-slate-800"
      >
        <div className="flex min-h-full flex-col">
          <NavBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CloudflareAnalytics />
      </body>
    </html>
  );
}
