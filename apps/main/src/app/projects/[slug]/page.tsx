import {
  getAllProjects,
  getProjectContentBySlug,
} from "@katie-portfolio/projects";
import { getDeploymentUrl } from "@katie-portfolio/content";
import { notFound } from "next/navigation";
import { ContentDetail } from "../../ui/ContentDetail";

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
  const deploymentUrl = getDeploymentUrl();
  const canonical = `${deploymentUrl}/projects/${project.slug}/`;
  const fullImageUrl = deploymentUrl
    ? `${deploymentUrl}${project.imageSrc}`
    : project.imageSrc;

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
          url: fullImageUrl,
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
    <main className="mx-4 flex grow flex-col rounded-2xl dark:bg-sky-50">
      <ContentDetail content={project} />
    </main>
  );
}
