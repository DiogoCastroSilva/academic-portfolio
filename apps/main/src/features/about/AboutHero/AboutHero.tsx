"use client";
import type { ProfileData } from "@academic-portfolio/content";
import { motion, useReducedMotion } from "motion/react";

import { ContentImage } from "@academic-portfolio/design-system";

export type AboutHeroProps = {
  profile: ProfileData;
};

export const AboutHero = ({ profile }: AboutHeroProps) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionDiv = shouldReduceMotion ? "div" : motion.div;

  return (
    <section className="mx-4 p-6 sm:p-10 lg:p-12">
      <MotionDiv
        className="flex flex-col gap-8 md:gap-12"
        {...(shouldReduceMotion
          ? {}
          : {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.8 },
            })}
      >
        {/* Hero Header */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
            <MotionDiv
              {...(shouldReduceMotion
                ? {}
                : {
                    initial: { scale: 0.8, opacity: 0 },
                    animate: { scale: 1, opacity: 1 },
                    transition: { duration: 0.6, delay: 0.2 },
                  })}
            >
              <ContentImage
                src={profile.imageSrc}
                alt={`Profile picture of ${profile.name}`}
                className="h-48 w-48 rounded-full sm:h-64 sm:w-64 md:h-56 md:w-56"
                sizes="(max-width: 640px) 200px, 240px"
                priority
              />
            </MotionDiv>
            <MotionDiv
              className="flex flex-col gap-4 text-center md:text-left"
              {...(shouldReduceMotion
                ? {}
                : {
                    initial: { opacity: 0, x: 20 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.6, delay: 0.3 },
                  })}
            >
              <div>
                <h1 className="profile-name">{profile.name}</h1>
                <p className="text-text-secondary mt-2 text-xl">
                  {profile.role}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                {profile.email ? (
                  <a
                    href={`mailto:${profile.email}`}
                    className="border-accent text-accent hover:bg-accent hover:text-text-on-accent focus-visible:outline-focus rounded-full border-2 px-6 py-2 font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    Get in Touch
                  </a>
                ) : null}
                {profile.cvUrl ? (
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View CV (PDF)"
                    className="border-accent text-accent hover:bg-accent hover:text-text-on-accent focus-visible:outline-focus rounded-full border-2 px-6 py-2 font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    View CV (PDF)
                  </a>
                ) : null}
              </div>
            </MotionDiv>
          </div>
        </div>

        {/* Main Bio */}
        <MotionDiv
          className="space-y-4"
          {...(shouldReduceMotion
            ? {}
            : {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { duration: 0.6, delay: 0.4 },
              })}
        >
          <h2 className="font-display text-text-secondary mb-4 text-2xl font-normal md:text-3xl">
            About Me
          </h2>
          <div
            dangerouslySetInnerHTML={{ __html: profile.biography }}
            className="prose prose-lg prose-headings:text-text-primary prose-headings:font-bold prose-a:text-link prose-a:break-words prose-strong:text-text-primary prose-a:no-underline prose-img:max-w-full prose-img:rounded-lg prose-img:my-6 text-text-primary max-w-none"
          />
        </MotionDiv>
      </MotionDiv>
    </section>
  );
};
