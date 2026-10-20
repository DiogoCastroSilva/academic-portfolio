import {
  getAllProjects,
  getProjectContentBySlug,
} from "@academic-portfolio/projects";
import { getFullAssetUrl, getFullUrl } from "@academic-portfolio/content";
import { notFound } from "next/navigation";
import { Breadcrumb } from "../../ui/Breadcrumb";
import { ContentDetail } from "../../ui/ContentDetail";
import { ogImageRef } from "../../lib/og-image";

const EMPTY_SLUG = "NON-EXISTENT-SLUG";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = getAllProjects();

  if (projects.length === 0) {
    return [{ slug: EMPTY_SLUG }];
  }

  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectContentBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project does not exist.",
    };
  }

  const description = project.excerpt || `Project: ${project.title}`;
  const canonical = getFullUrl(`${project.href}/`);
  const fullImageUrl =
    project.imageType === "cover"
      ? getFullAssetUrl(project.imageSrc)
      : undefined;

  return {
    title: project.title,
    description,
    openGraph: {
      title: project.title,
      description,
      type: "article",
      publishedTime: project.date,
      url: canonical,
      images: [
        {
          url: fullImageUrl ?? ogImageRef(`project-${project.slug}.svg`),
          alt: project.title,
        },
      ],
    },
    alternates: {
      canonical,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectContentBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-4 flex grow flex-col rounded-2xl dark:bg-sky-50">
      <Breadcrumb
        items={[
          { label: "Projects", href: "/projects/" },
          { label: project.title },
        ]}
      />
      <ContentDetail content={project} />
    </div>
  );
}
