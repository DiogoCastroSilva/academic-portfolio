import { getAllProjects } from "@academic-portfolio/projects";

import { siteConfig } from "../../configs/site-config";
import { paginate, PAGE_SIZE } from "../lib/pagination";
import { ogImageRef } from "../lib/og-image";
import { ContentCardSection } from "../../features/content/ContentCardSection";
import { Pagination } from "@academic-portfolio/design-system";

export const metadata = {
  title: "Projects",
  description: `Projects by ${siteConfig.name}.`,
  openGraph: {
    title: `Projects | ${siteConfig.name}`,
    description: `Projects by ${siteConfig.name}.`,
    type: "website",
    images: [
      {
        url: ogImageRef("projects.svg"),
        alt: `Projects — ${siteConfig.name}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const currentPage = 1;
  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const { items: pageItems } = paginate(projects, currentPage);

  return (
    <div className="mx-auto flex max-w-7xl grow flex-col gap-4">
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
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
