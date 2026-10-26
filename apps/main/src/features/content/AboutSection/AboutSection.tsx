import type { ProfileData } from "@academic-portfolio/content";

import { ContentImage } from "@academic-portfolio/design-system";

export type AboutSectionProps = {
  profile: ProfileData;
};

export const AboutSection = ({ profile }: AboutSectionProps) => {
  return (
    <section className="mx-4 flex flex-col p-6 sm:p-10 md:min-h-[calc(100svh-4rem)] lg:p-12">
      <div className="animate-fadeInUp flex flex-1 flex-col gap-10 motion-reduce:animate-none md:flex-row-reverse md:items-center md:gap-12">
        <div className="flex justify-center md:w-64 md:justify-end">
          <ContentImage
            src={profile.imageSrc}
            alt={`Profile picture of ${profile.name}`}
            className="h-36 w-36 rounded-full sm:h-48 sm:w-48 md:h-64 md:w-64"
            sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 256px"
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
            className="prose prose-sm prose-headings:text-text-primary prose-headings:font-bold prose-a:text-link prose-a:break-words prose-strong:text-text-primary prose-a:no-underline prose-a:hover:underline prose-code:bg-code-bg prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-pre-bg prose-pre:text-pre-text prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-li:my-2 prose-img:max-w-full prose-img:rounded-lg prose-img:my-6 text-text-primary mt-8 max-w-2xl"
          />
        </div>
      </div>

      {/* Scroll cue — invites visitors to explore selected work below.
          Always a real link (not decorative); one-time CSS entrance after
          the hero content via animationDelay. Disabled for reduced-motion
          users (motion-reduce:animate-none leaves it statically visible). */}
      <a
        href="#projects-heading"
        className="animate-fadeInUp text-text-secondary hover:text-link focus-visible:outline-focus self-center text-sm no-underline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:animate-none"
        style={{ animationDelay: "300ms" }}
        aria-label="Scroll down to explore selected work"
        data-testid="scroll-cue"
      >
        <span className="flex items-center gap-2">
          <span>Explore selected work</span>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </a>
    </section>
  );
};
