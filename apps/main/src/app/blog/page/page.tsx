import { notFound } from "next/navigation";

import { getAllBlogPosts } from "@katie-portfolio/blog";

import { paginate, parsePageParam, PAGE_SIZE } from "../../lib/pagination";
import { ContentCardSection } from "../../ui/ContentCardSection";
import { Pagination } from "../../ui/Pagination";

/** Generate static page routes at build time for all pagination pages. */
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  // Pages 2..totalPages get static HTML; page 1 is served by /blog/page.tsx.
  // Only generate pagination routes when there are multiple pages.
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

interface BlogPageProps {
  params: Promise<{ page?: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { page: pageParam } = await params;
  const currentPage = parsePageParam(pageParam, 1);

  const posts = getAllBlogPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));

  // Page 1 is served by /blog/page.tsx — redirect /blog/page/1/ there.
  if (currentPage === 1) {
    const destination = "/blog/";
    return <meta httpEquiv="refresh" content={`0;url=${destination}`} />;
  }

  if (currentPage > totalPages) {
    notFound();
  }

  const { items: pageItems } = paginate(posts, currentPage);

  return (
    <div className="flex grow flex-col gap-4">
      <ContentCardSection
        heading="Blog"
        headingId={`blog-page-${currentPage}-heading`}
        items={pageItems}
        hrefPrefix="/blog"
        emptyMessage="New posts coming soon."
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/blog"
      />
    </div>
  );
}
