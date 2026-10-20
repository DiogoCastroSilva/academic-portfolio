import { getProfile, getFullUrl } from "@academic-portfolio/content";

import { siteConfig } from "../../configs/site-config";
import { AboutHero } from "../../features/about/AboutHero";
import { EducationTimeline } from "../../features/about/EducationTimeline";
import { ResearchInterests } from "../../features/about/ResearchInterests";
import { SkillsGrid } from "../../features/about/SkillsGrid";
import { JsonLd } from "../../lib/JsonLd";
import { buildPersonSchema } from "../lib/structured-data";
import { ogImageRef } from "../lib/og-image";

const aboutCanonical = getFullUrl("/about/");

export const metadata = {
  title: "About",
  description: `Learn more about ${siteConfig.name} and their background.`,
  openGraph: {
    title: `About | ${siteConfig.name}`,
    description: `Learn more about ${siteConfig.name} and their background.`,
    type: "website",
    images: [
      {
        url: ogImageRef("about.svg"),
        alt: `${siteConfig.name} — About`,
        width: 1200,
        height: 630,
      },
    ],
  },
  ...(aboutCanonical ? { alternates: { canonical: aboutCanonical } } : {}),
};

export default function AboutPage() {
  const profile = getProfile();

  return (
    <div className="flex grow flex-col gap-4">
      <JsonLd data={buildPersonSchema(profile)} />
      <AboutHero profile={profile} />
      <ResearchInterests items={profile.researchInterests} />
      <EducationTimeline items={profile.education} />
      <SkillsGrid categories={profile.skills} />
    </div>
  );
}
