import { getAllProjects } from "@academic-portfolio/projects";
import { getAllPublications } from "@academic-portfolio/publications";
import { getAllBlogPosts } from "@academic-portfolio/blog";
import { getProfile } from "@academic-portfolio/content";

import { AboutSection } from "../features/content/AboutSection";
import { ContentCardSection } from "../features/content/ContentCardSection";
import { PublicationRowSection } from "../features/content/PublicationRowSection";
import { JsonLd } from "../lib/JsonLd";
import {
  buildWebSiteSchema,
  buildSiteAuthorSchema,
} from "./lib/structured-data";

export default function Index() {
  const allProjects = getAllProjects();
  const publications = getAllPublications();
  const blogPosts = getAllBlogPosts();
  const profile = getProfile();

  // Homepage project selection: if any projects are explicitly selected,
  // show only those. Otherwise, fall back to the three most recent projects.
  // getAllProjects() returns items sorted newest-first, so the slice gives
  // the three most recent. If fewer than three exist, slice returns all.
  const selectedProjects = allProjects.filter((p) => p.selected);
  const homeProjects =
    selectedProjects.length > 0 ? selectedProjects : allProjects.slice(0, 3);

  // Homepage publication selection: same pattern as projects — show only
  // explicitly selected publications, falling back to the three most
  // recent when none are selected.
  const selectedPublications = publications.filter((p) => p.selected);
  const homePublications =
    selectedPublications.length > 0
      ? selectedPublications
      : publications.slice(0, 3);

  return (
    <div className="mx-auto flex max-w-7xl grow flex-col gap-4">
      <JsonLd data={buildWebSiteSchema()} />
      <JsonLd data={buildSiteAuthorSchema(profile.name, profile.imageSrc)} />
      <AboutSection profile={profile} />
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={homeProjects}
        hrefPrefix="/projects"
        limit={6}
        viewAllHref="/projects"
        viewAllLabel="View all projects"
      />
      <PublicationRowSection
        heading="Publications"
        headingId="publications-heading"
        items={homePublications}
        hrefPrefix="/publications"
        limit={6}
        viewAllHref="/publications"
        viewAllLabel="View all publications"
        emptyMessage="Publications will be added as they are published."
      />
      {blogPosts.length > 0 && (
        <ContentCardSection
          heading="Blog"
          headingId="blog-heading"
          items={blogPosts}
          hrefPrefix="/blog"
          limit={6}
          viewAllHref="/blog"
          viewAllLabel="View all posts"
          emptyMessage="New posts coming soon."
        />
      )}
    </div>
  );
}
