import type { ProfileData } from "@academic-portfolio/content";

import { ContentImage } from "@academic-portfolio/design-system";

export type AboutSectionProps = {
  profile: ProfileData;
};

export const AboutSection = ({ profile }: AboutSectionProps) => {
  return (
    <section className="mx-4 p-6 sm:p-10 lg:p-12">
      <div className="animate-fadeInUp flex flex-col gap-10 motion-reduce:animate-none md:flex-row-reverse md:items-start">
        <div className="flex justify-center md:w-64 md:justify-end">
          <ContentImage
            src={profile.imageSrc}
            alt={`Profile picture of ${profile.name}`}
            className="h-32 w-32 rounded-full sm:h-40 sm:w-40 md:h-48 md:w-48"
            sizes="(max-width: 640px) 140px, (max-width: 768px) 180px, 200px"
            priority
          />
        </div>
        <div className="flex flex-1 flex-col md:pr-8 lg:pr-12">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="text-text-secondary mt-2 text-xl leading-relaxed">
            {profile.role}
          </p>
          {/*
            Uses prose-sm (~17px) rather than prose-lg (~19px) because this is
            a condensed homepage preview; the full About page (AboutHero) uses
            prose-lg for the complete biography. See global.css for token values.
          */}
          <div
            dangerouslySetInnerHTML={{ __html: profile.biography }}
            className="prose prose-sm prose-headings:text-text-primary prose-headings:font-bold prose-a:text-link prose-a:break-words prose-strong:text-text-primary prose-a:no-underline prose-a:hover:underline prose-code:bg-code-bg prose-code:text-text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-pre-bg prose-pre:text-pre-text prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-li:my-2 prose-img:max-w-full prose-img:rounded-lg prose-img:my-6 text-text-primary mt-8 max-w-none"
          />
        </div>
      </div>
    </section>
  );
};
