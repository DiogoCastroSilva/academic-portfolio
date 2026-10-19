import { notFound } from "next/navigation";

import { getAllBlogPosts } from "@katie-portfolio/blog";
import { withPublicBasePath } from "@katie-portfolio/content";

import { paginate, parsePageParam, PAGE_SIZE } from "../../../lib/pagination";
import { ContentCardSection } from "../../../ui/ContentCardSection";
import { Pagination } from "../../../ui/Pagination";

/**
 * Only pre-render routes that `generateStaticParams` returns.
 * Non-numeric or out-of-range page params fall through to `notFound()`.
 */
export const dynamicParams = false;

/** Generate static page routes at build time for all pagination pages. */
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  // Pages 1..totalPages get static HTML. Page 1 redirects to /blog/ for
  // canonical-URL correctness; pages 2..N render real content.
  // Next.js output:export requires at least one static param, so when
  // there is only one page we still emit page 1 (which redirects to the
  // collection root).
  if (totalPages === 1) return [{ page: "1" }];
  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
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
    const destination = withPublicBasePath("/blog/");
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
