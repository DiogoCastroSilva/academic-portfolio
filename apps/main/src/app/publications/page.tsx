import { getAllPublications } from "@katie-portfolio/publications";

import { ContentCardSection } from "../ui/ContentCardSection";

export const metadata = {
  title: "Publications | Kathleen Miller",
  description: "Research publications by Kathleen Miller.",
  openGraph: {
    title: "Publications | Kathleen Miller",
    description: "Research publications by Kathleen Miller.",
    type: "website",
  },
};

export default function PublicationsPage() {
  const publications = getAllPublications();

  return (
    <div className="flex grow flex-col gap-4">
      <ContentCardSection
        heading="Publications"
        headingId="publications-heading"
        items={publications}
        hrefPrefix="/publications"
        emptyMessage="Publications are coming soon."
      />
    </div>
  );
}
