import { getAllProjects } from "@katie-portfolio/projects";
import { getAllPublications } from "@katie-portfolio/publications";
import { getProfile } from "@katie-portfolio/content";

import { AboutSection } from "./ui/AboutSection";
import { ContentCardSection } from "./ui/ContentCardSection";

export default function Index() {
  const projects = getAllProjects();
  const publications = getAllPublications();
  const profile = getProfile();

  return (
    <main className="flex grow flex-col gap-4">
      <AboutSection profile={profile} />
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={projects}
        hrefPrefix="/projects"
      />
      <ContentCardSection
        heading="Publications"
        headingId="publications-heading"
        items={publications}
        hrefPrefix="/publications"
      />
    </main>
  );
}
