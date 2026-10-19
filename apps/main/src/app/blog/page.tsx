import { getAllBlogPosts } from "@katie-portfolio/blog";

import { siteConfig } from "../../configs/site-config";
import { paginate, PAGE_SIZE } from "../lib/pagination";
import { ogImageRef } from "../lib/og-image";
import { ContentCardSection } from "../ui/ContentCardSection";
import { Pagination } from "../ui/Pagination";

export const metadata = {
  title: `Blog | ${siteConfig.name}`,
  description: `Science, nature-based solutions, and field notes by ${siteConfig.name}.`,
  openGraph: {
    title: `Blog | ${siteConfig.name}`,
    description: `Science, nature-based solutions, and field notes by ${siteConfig.name}.`,
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
