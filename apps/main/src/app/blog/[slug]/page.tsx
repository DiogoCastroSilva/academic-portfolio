import {
  getAllBlogPosts,
  getBlogPostContentBySlug,
} from "@academic-portfolio/blog";
import { getFullAssetUrl, getFullUrl } from "@academic-portfolio/content";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@academic-portfolio/design-system";
import { ContentDetail } from "../../../features/content/ContentDetail";
import { ogImageRef } from "../../lib/og-image";

const EMPTY_SLUG = "NON-EXISTENT-SLUG";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getAllBlogPosts();

  if (posts.length === 0) {
    return [{ slug: EMPTY_SLUG }];
  }

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostContentBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post does not exist.",
    };
  }

  const description = post.excerpt || `Blog: ${post.title}`;
  const canonical = getFullUrl(`${post.href}/`);
  const fullImageUrl =
    post.imageType === "cover" ? getFullAssetUrl(post.imageSrc) : undefined;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.date,
      url: canonical,
      images: [
        {
          url: fullImageUrl ?? ogImageRef(`blog-${post.slug}.svg`),
          alt: post.title,
        },
      ],
    },
    alternates: {
      canonical,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostContentBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="dark:bg-slate-850 mx-4 flex grow flex-col gap-4 rounded-2xl">
      <Breadcrumb
        items={[{ label: "Blog", href: "/blog/" }, { label: post.title }]}
      />
      <ContentDetail content={post} />
    </div>
  );
}
