import { getProfile, getFullUrl } from "@katie-portfolio/content";

import { siteConfig } from "../../configs/site-config";
import { AboutHero } from "../ui/AboutHero";
import { EducationTimeline } from "../ui/EducationTimeline";
import { ResearchInterests } from "../ui/ResearchInterests";
import { SkillsGrid } from "../ui/SkillsGrid";
import { JsonLd } from "../ui/JsonLd";
import { buildPersonSchema } from "../lib/structured-data";

const aboutCanonical = getFullUrl("/about/");

export const metadata = {
  title: `About | ${siteConfig.name}`,
  description: `Learn more about ${siteConfig.name}, their research, and background.`,
  openGraph: {
    title: `About | ${siteConfig.name}`,
    description: `Learn more about ${siteConfig.name}, their research, and background.`,
    type: "website",
  },
  ...(aboutCanonical ? { alternates: { canonical: aboutCanonical } } : {}),
};

export default function AboutPage() {
  const profile = getProfile();

  return (
    <div className="flex grow flex-col gap-6 py-8">
      <JsonLd data={buildPersonSchema(profile)} />
      <AboutHero profile={profile} />
      <ResearchInterests items={profile.researchInterests} />
      <EducationTimeline items={profile.education} />
      <SkillsGrid categories={profile.skills} />
    </div>
  );
}
