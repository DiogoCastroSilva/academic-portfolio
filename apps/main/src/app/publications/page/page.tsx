import { notFound } from "next/navigation";

import { getAllPublications } from "@katie-portfolio/publications";

import { paginate, parsePageParam, PAGE_SIZE } from "../../lib/pagination";
import { ContentCardSection } from "../../ui/ContentCardSection";
import { Pagination } from "../../ui/Pagination";

/** Generate static page routes at build time for all pagination pages. */
export async function generateStaticParams() {
  const publications = getAllPublications();
  const totalPages = Math.max(1, Math.ceil(publications.length / PAGE_SIZE));
  // Pages 2..totalPages get static HTML; page 1 is served by /publications/page.tsx.
  // Only generate pagination routes when there are multiple pages.
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

interface PublicationsPageProps {
  params: Promise<{ page?: string }>;
}

export default async function PublicationsPage({
  params,
}: PublicationsPageProps) {
  const { page: pageParam } = await params;
  const currentPage = parsePageParam(pageParam, 1);

  const publications = getAllPublications();
  const totalPages = Math.max(1, Math.ceil(publications.length / PAGE_SIZE));

  // Page 1 is served by /publications/page.tsx — redirect /publications/page/1/ there.
  if (currentPage === 1) {
    const destination = "/publications/";
    return <meta httpEquiv="refresh" content={`0;url=${destination}`} />;
  }

  if (currentPage > totalPages) {
    notFound();
  }

  const { items: pageItems } = paginate(publications, currentPage);

  return (
    <div className="flex grow flex-col gap-4">
      <ContentCardSection
        heading="Publications"
        headingId={`publications-page-${currentPage}-heading`}
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
