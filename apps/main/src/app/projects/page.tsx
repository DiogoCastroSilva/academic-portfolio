import { getAllProjects } from "@katie-portfolio/projects";

import { ContentCardSection } from "../ui/ContentCardSection";
import { ogImageRef } from "../lib/og-image";

export const metadata = {
  title: "Projects | Kathleen Miller",
  description: "Projects by Kathleen Miller.",
  openGraph: {
    title: "Projects | Kathleen Miller",
    description: "Projects by Kathleen Miller.",
    type: "website",
    images: [
      {
        url: ogImageRef("projects.svg"),
        alt: "Projects — Kathleen Miller",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="flex grow flex-col gap-4">
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={projects}
        hrefPrefix="/projects"
        emptyMessage="Projects are coming soon."
      />
    </div>
  );
}
