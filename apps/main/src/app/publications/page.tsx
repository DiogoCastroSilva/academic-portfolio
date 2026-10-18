import { getAllPublications } from "@katie-portfolio/publications";

import { ContentCardSection } from "../ui/ContentCardSection";
import { ogImageRef } from "../lib/og-image";

export const metadata = {
  title: "Publications | Kathleen Miller",
  description: "Research publications by Kathleen Miller.",
  openGraph: {
    title: "Publications | Kathleen Miller",
    description: "Research publications by Kathleen Miller.",
    type: "website",
    images: [
      {
        url: ogImageRef("publications.svg"),
        alt: "Publications — Kathleen Miller",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function PublicationsPage() {
  const publications = getAllPublications();

  return (
    <div className="flex grow flex-col gap-4">
      <ContentCardSection
        heading="Publications"
        headingId="publications-heading"
        items={publications}
        hrefPrefix="/publications"
        emptyMessage="Publications are coming soon."
      />
    </div>
  );
}
