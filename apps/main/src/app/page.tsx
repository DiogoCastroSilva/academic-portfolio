import { getAllProjects } from "@katie-portfolio/projects";
import { getAllPublications } from "@katie-portfolio/publications";
import { getAllBlogPosts } from "@katie-portfolio/blog";
import { getProfile } from "@katie-portfolio/content";

import { AboutSection } from "./ui/AboutSection";
import { ContentCardSection } from "./ui/ContentCardSection";
import { JsonLd } from "./ui/JsonLd";
import {
  buildWebSiteSchema,
  buildSiteAuthorSchema,
} from "./lib/structured-data";

export default function Index() {
  const projects = getAllProjects();
  const publications = getAllPublications();
  const blogPosts = getAllBlogPosts();
  const profile = getProfile();

  return (
    <div className="flex grow flex-col gap-4">
      <JsonLd data={buildWebSiteSchema()} />
      <JsonLd data={buildSiteAuthorSchema(profile.name, profile.imageSrc)} />
      <AboutSection profile={profile} />
      <ContentCardSection
        heading="Projects"
        headingId="projects-heading"
        items={projects}
        hrefPrefix="/projects"
        limit={6}
        viewAllHref="/projects"
        viewAllLabel="View all projects"
      />
      <ContentCardSection
        heading="Publications"
        headingId="publications-heading"
        items={publications}
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
