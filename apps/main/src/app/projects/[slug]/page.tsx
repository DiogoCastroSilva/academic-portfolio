import {
  getAllProjects,
  getProjectContentBySlug,
} from "@katie-portfolio/projects";
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
      title: "Project Not Found | Kathleen Miller",
    };
  }

  return {
    title: `${project.title} | Kathleen Miller`,
    description: project.excerpt || `Project: ${project.title}`,
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
