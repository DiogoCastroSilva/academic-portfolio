import { siteConfig } from "../../configs/site-config";
import { AboutHero } from "../ui/AboutHero";
import { EducationTimeline } from "../ui/EducationTimeline";
import { ResearchInterests } from "../ui/ResearchInterests";
import { SkillsGrid } from "../ui/SkillsGrid";

export const metadata = {
  title: "About | Kathleen Miller",
  description:
    "Learn more about Kathleen Miller, her research, and background.",
};

export default function AboutPage() {
  return (
    <main className="flex grow flex-col gap-6 py-8">
      <AboutHero email={siteConfig.email} />
      <ResearchInterests />
      <EducationTimeline />
      <SkillsGrid />
    </main>
  );
}
