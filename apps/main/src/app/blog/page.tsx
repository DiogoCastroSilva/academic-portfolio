import { getAllBlogPosts } from "@katie-portfolio/blog";

import { siteConfig } from "../../configs/site-config";
import { ContentCardSection } from "../ui/ContentCardSection";
import { ogImageRef } from "../lib/og-image";

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

  return (
    <div className="flex grow flex-col gap-4">
      <ContentCardSection
        heading="Blog"
        headingId="blog-heading"
        items={posts}
        hrefPrefix="/blog"
        emptyMessage="New posts coming soon."
      />
    </div>
  );
}
