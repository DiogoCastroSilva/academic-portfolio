import { notFound } from "next/navigation";

import { getAllProjects } from "@katie-portfolio/projects";

import { paginate, parsePageParam, PAGE_SIZE } from "../../lib/pagination";
import { ContentCardSection } from "../../ui/ContentCardSection";
import { Pagination } from "../../ui/Pagination";

/** Generate static page routes at build time for all pagination pages. */
export async function generateStaticParams() {
  const projects = getAllProjects();
  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  // Pages 2..totalPages get static HTML; page 1 is served by /projects/page.tsx.
  // Only generate pagination routes when there are multiple pages.
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

interface ProjectsPageProps {
  params: Promise<{ page?: string }>;
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { page: pageParam } = await params;
  const currentPage = parsePageParam(pageParam, 1);

  const projects = getAllProjects();
  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));

  // Page 1 is served by /projects/page.tsx — redirect /projects/page/1/ there.
  if (currentPage === 1) {
    const destination = "/projects/";
    return <meta httpEquiv="refresh" content={`0;url=${destination}`} />;
  }

  if (currentPage > totalPages) {
    notFound();
  }

  const { items: pageItems } = paginate(projects, currentPage);

  return (
    <div className="flex grow flex-col gap-4">
      <ContentCardSection
        heading="Projects"
        headingId={`projects-page-${currentPage}-heading`}
        items={pageItems}
        hrefPrefix="/projects"
        emptyMessage="Projects are coming soon."
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/projects"
      />
    </div>
  );
}
