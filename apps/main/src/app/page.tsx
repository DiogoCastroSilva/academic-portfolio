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
      />
      <ContentCardSection
        heading="Publications"
        headingId="publications-heading"
        items={publications}
        hrefPrefix="/publications"
      />
      <ContentCardSection
        heading="Blog"
        headingId="blog-heading"
        items={blogPosts}
        hrefPrefix="/blog"
      />
    </div>
  );
}
