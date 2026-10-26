import { getAllProjects } from "@academic-portfolio/projects";

import { siteConfig } from "../../configs/site-config";
import { paginate, PAGE_SIZE } from "../lib/pagination";
import { ogImageRef } from "../lib/og-image";
import { ContentCardSection } from "../../features/content/ContentCardSection";
import { FeaturedProjectsSection } from "../../features/content/FeaturedProjectsSection";
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

  // Split into featured (selected) and regular (non-selected).
  // Featured projects get editorial treatment in the FeaturedProjectsSection;
  // they are excluded from the paginated regular grid so each project
  // appears only once.
  const featuredProjects = projects.filter((p) => p.selected);
  const regularProjects = projects.filter((p) => !p.selected);

  const currentPage = 1;
  const totalPages = Math.max(1, Math.ceil(regularProjects.length / PAGE_SIZE));
  const { items: pageItems } = paginate(regularProjects, currentPage);

  return (
    <div className="mx-auto flex max-w-7xl grow flex-col gap-4">
      {/* Page introduction — h1 + short context, not an oversized hero */}
      <div className="mx-4 p-6 sm:p-10 lg:p-12">
        <h1 className="font-display text-text-primary scroll-mt-16 text-3xl font-normal md:text-4xl">
          Projects
        </h1>
        <p className="text-text-secondary mt-4 max-w-2xl text-sm leading-relaxed">
          Research projects and technical work exploring data visualization,
          remote sensing, and spatial analysis methods.
        </p>
      </div>

      <FeaturedProjectsSection
        heading="Featured"
        headingId="featured-projects-heading"
        items={featuredProjects}
        hrefPrefix="/projects"
      />

      <ContentCardSection
        heading="All Projects"
        headingId="all-projects-heading"
        headingLevel="h2"
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
