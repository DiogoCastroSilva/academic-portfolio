import { getAllBlogPosts } from "@academic-portfolio/blog";

import { siteConfig } from "../../configs/site-config";
import { paginate, PAGE_SIZE } from "../lib/pagination";
import { ogImageRef } from "../lib/og-image";
import { ContentCardSection } from "../../features/content/ContentCardSection";
import { Pagination } from "@academic-portfolio/design-system";

export const metadata = {
  title: "Blog",
  description: `Field notes and updates by ${siteConfig.name}.`,
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description: `Field notes and updates by ${siteConfig.name}.`,
    type: "website",
    images: [
      {
        url: ogImageRef("blog.svg"),
        alt: `Blog — ${siteConfig.name}`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const currentPage = 1;
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const { items: pageItems } = paginate(posts, currentPage);

  return (
    <div className="flex grow flex-col gap-4">
      <ContentCardSection
        heading="Blog"
        headingId="blog-heading"
        headingLevel="h1"
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
