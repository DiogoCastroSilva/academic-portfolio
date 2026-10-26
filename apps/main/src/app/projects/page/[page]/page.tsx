import { notFound } from "next/navigation";

import { getAllProjects } from "@academic-portfolio/projects";
import { withPublicBasePath } from "@academic-portfolio/content";

import { paginate, parsePageParam, PAGE_SIZE } from "../../../lib/pagination";
import { ContentCardSection } from "../../../../features/content/ContentCardSection";
import { Pagination } from "@academic-portfolio/design-system";

/**
 * Only pre-render routes that `generateStaticParams` returns.
 * Non-numeric or out-of-range page params fall through to `notFound()`.
 */
export const dynamicParams = false;

/** Generate static page routes at build time for all pagination pages. */
export async function generateStaticParams() {
  const projects = getAllProjects();
  // Exclude featured (selected) projects — they appear in the editorial
  // section on page 1 only, never in the paginated grid.
  const regularProjects = projects.filter((p) => !p.selected);
  const totalPages = Math.max(1, Math.ceil(regularProjects.length / PAGE_SIZE));
  // Pages 1..totalPages get static HTML. Page 1 redirects to /projects/
  // for canonical-URL correctness; pages 2..N render real content.
  // Next.js output:export requires at least one static param, so when
  // there is only one page we still emit page 1 (which redirects to the
  // collection root).
  if (totalPages === 1) return [{ page: "1" }];
  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }));
}

interface ProjectsPageProps {
  params: Promise<{ page?: string }>;
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { page: pageParam } = await params;
  const currentPage = parsePageParam(pageParam, 1);

  const projects = getAllProjects();
  // Exclude featured (selected) projects from the paginated grid so they
  // only appear in the editorial section on the collection root page.
  const regularProjects = projects.filter((p) => !p.selected);
  const totalPages = Math.max(1, Math.ceil(regularProjects.length / PAGE_SIZE));

  // Page 1 is served by /projects/page.tsx — redirect /projects/page/1/ there.
  if (currentPage === 1) {
    const destination = withPublicBasePath("/projects/");
    return <meta httpEquiv="refresh" content={`0;url=${destination}`} />;
  }

  if (currentPage > totalPages) {
    notFound();
  }

  const { items: pageItems } = paginate(regularProjects, currentPage);

  return (
    <div className="mx-auto flex max-w-7xl grow flex-col gap-4">
      <ContentCardSection
        heading="All Projects"
        headingId={`all-projects-page-${currentPage}-heading`}
        headingLevel="h1"
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
