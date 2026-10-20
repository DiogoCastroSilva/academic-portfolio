import {
  getAllPublications,
  getPublicationContentBySlug,
} from "@academic-portfolio/publications";
import { getFullAssetUrl, getFullUrl } from "@academic-portfolio/content";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@academic-portfolio/design-system";
import { ContentDetail } from "../../../features/content/ContentDetail";
import { ogImageRef } from "../../lib/og-image";

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
  const fullImageUrl =
    publication.imageType === "cover"
      ? getFullAssetUrl(publication.imageSrc)
      : undefined;

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
            fullImageUrl ?? ogImageRef(`publication-${publication.slug}.svg`),
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
    <div className="mx-4 flex grow flex-col gap-4 rounded-2xl dark:bg-sky-50">
      <Breadcrumb
        items={[
          { label: "Publications", href: "/publications/" },
          { label: publication.title },
        ]}
      />
      <ContentDetail content={publication} />
    </div>
  );
}
