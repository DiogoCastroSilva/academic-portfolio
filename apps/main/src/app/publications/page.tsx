import { getAllPublications } from '@katie-portfolio/publications';

import { ContentCardSection } from '../ui/ContentCardSection';

export const metadata = {
  title: 'Publications | Kathleen Miller',
  description: 'Research publications by Kathleen Miller.',
};

export default function PublicationsPage() {
  const publications = getAllPublications();

  return (
    <main className="flex grow flex-col gap-4 py-8">
      <ContentCardSection
        heading="Publications"
        headingId="publications-heading"
        items={publications}
        hrefPrefix="/publications"
        emptyMessage="Publications are coming soon."
      />
    </main>
  );
}
