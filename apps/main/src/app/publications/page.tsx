import { getAllPublications } from "@katie-portfolio/publications";

import { siteConfig } from "../../configs/site-config";
import { paginate, PAGE_SIZE } from "../lib/pagination";
import { ogImageRef } from "../lib/og-image";
import { ContentCardSection } from "../ui/ContentCardSection";
import { Pagination } from "../ui/Pagination";

export const metadata = {
  title: `Publications | ${siteConfig.name}`,
  description: `Research publications by ${siteConfig.name}.`,
  openGraph: {
    title: `Publications | ${siteConfig.name}`,
    description: `Research publications by ${siteConfig.name}.`,
    type: "website",
    images: [
      {
        url: ogImageRef("publications.svg"),
        alt: `Publications — ${siteConfig.name}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function PublicationsPage() {
  const publications = getAllPublications();
  const currentPage = 1;
  const totalPages = Math.max(1, Math.ceil(publications.length / PAGE_SIZE));
  const { items: pageItems } = paginate(publications, currentPage);

  return (
    <div className="flex grow flex-col gap-4">
      <ContentCardSection
        heading="Publications"
        headingId="publications-heading"
        items={pageItems}
        hrefPrefix="/publications"
        emptyMessage="Publications are coming soon."
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/publications"
      />
    </div>
  );
}
