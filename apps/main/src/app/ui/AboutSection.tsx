import type { ProfileData } from "@academic-portfolio/content";

import { ContentImage } from "./ContentImage";

type AboutSectionProps = {
  profile: ProfileData;
};

export const AboutSection = ({ profile }: AboutSectionProps) => {
  return (
    <section className="mx-4 rounded-2xl bg-white p-6 sm:p-12 dark:bg-sky-50">
      <div className="animate-fadeInUp flex flex-col gap-4 motion-reduce:animate-none md:flex-row">
        <div className="flex flex-4 flex-col items-center gap-2 md:flex-6">
          <ContentImage
            src={profile.imageSrc}
            alt={`Profile picture of ${profile.name}`}
            className="h-32 w-32 rounded-full sm:h-40 sm:w-40 md:h-48 md:w-48"
            sizes="(max-width: 640px) 140px, (max-width: 768px) 180px, 200px"
            priority
          />
          <div className="flex flex-col items-center justify-center text-wrap">
            <h1 className="profile-name">
              {profile.name}
            </h1>
            <p className="text-center text-lg leading-relaxed text-gray-600">{profile.role}</p>
          </div>
        </div>
        <div className="flex flex-12 flex-col gap-2 pt-2">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">About Me</h2>
          <div
            dangerouslySetInnerHTML={{ __html: profile.biography }}
            className="prose prose-sm prose-p:leading-6 prose-p:my-4 prose-headings:font-bold prose-a:break-words max-w-none text-gray-800"
          />
        </div>
      </div>
    </section>
  );
};
