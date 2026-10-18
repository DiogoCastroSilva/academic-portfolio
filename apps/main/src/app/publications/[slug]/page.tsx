import {
  getAllPublications,
  getPublicationContentBySlug,
} from "@katie-portfolio/publications";
import { getFullAssetUrl, getFullUrl } from "@katie-portfolio/content";
import { notFound } from "next/navigation";
import { ContentDetail } from "../../ui/ContentDetail";
import { generateOgImage } from "../../lib/og-image";

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
  const canonical = getFullUrl(`${publication.href}/`);
  const fullImageUrl = getFullAssetUrl(publication.imageSrc);

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
          url:
            fullImageUrl ??
            generateOgImage({
              title: publication.title,
              subtitle: publication.excerpt,
            }),
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
    <div className="mx-4 flex grow flex-col rounded-2xl dark:bg-sky-50">
      <ContentDetail content={publication} />
    </div>
  );
}
