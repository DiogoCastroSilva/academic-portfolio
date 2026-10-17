import {
  getAllPublications,
  getPublicationContentBySlug,
} from "@katie-portfolio/publications";
import { getDeploymentUrl } from "@katie-portfolio/content";
import { notFound } from "next/navigation";
import { ContentDetail } from "../../ui/ContentDetail";

const EMPTY_SLUG = "NON-EXISTENT-SLUG";

interface PublicationPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const publications = getAllPublications();

  if (publications.length === 0) {
    return [{ slug: EMPTY_SLUG }];
  }

  return publications.map((publication) => ({
    slug: publication.slug,
  }));
}

export async function generateMetadata({ params }: PublicationPageProps) {
  const { slug } = await params;
  const publication = await getPublicationContentBySlug(slug);

  if (!publication) {
    return {
      title: "Publication Not Found",
      description: "The requested publication does not exist.",
    };
  }

  const description =
    publication.excerpt || `Publication: ${publication.title}`;
  const deploymentUrl = getDeploymentUrl();
  const canonical = deploymentUrl
    ? `${deploymentUrl}/publications/${publication.slug}/`
    : undefined;
  const fullImageUrl = deploymentUrl
    ? `${deploymentUrl}${publication.imageSrc}`
    : publication.imageSrc;

  return {
    title: publication.title,
    description,
    openGraph: {
      title: publication.title,
      description,
      type: "article",
      publishedTime: publication.date,
      url: canonical,
      images: [
        {
          url: fullImageUrl,
          alt: publication.title,
        },
      ],
    },
    alternates: {
      canonical,
    },
  };
}

export default async function PublicationPage({
  params,
}: PublicationPageProps) {
  const { slug } = await params;
  const publication = await getPublicationContentBySlug(slug);

  if (!publication) {
    notFound();
  }

  return (
    <main className="mx-4 flex grow flex-col rounded-2xl dark:bg-sky-50">
      <ContentDetail content={publication} />
    </main>
  );
}
