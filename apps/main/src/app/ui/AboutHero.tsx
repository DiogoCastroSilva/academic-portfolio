"use client";
import type { ProfileData } from "@katie-portfolio/content";
import { motion, useReducedMotion } from "motion/react";

import { ContentImage } from "./ContentImage";

type AboutHeroProps = {
  profile: ProfileData;
};

export const AboutHero = ({ profile }: AboutHeroProps) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionDiv = shouldReduceMotion ? "div" : motion.div;

  return (
    <section className="mx-4 rounded-2xl p-6 sm:p-12 dark:bg-sky-50">
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
                <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                  {profile.name}
                </h1>
                <p className="mt-2 text-xl text-gray-700 dark:text-gray-700">
                  {profile.role}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                <a
                  href={`mailto:${profile.email}`}
                  className="rounded-full border-2 border-sky-600 px-6 py-2 font-medium text-sky-600 transition-all hover:bg-sky-600 hover:text-white dark:text-sky-600"
                >
                  Get in Touch
                </a>
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
          <h2 className="text-2xl font-bold md:text-3xl">About Me</h2>
          <div
            dangerouslySetInnerHTML={{ __html: profile.biography }}
            className="prose prose-lg dark:prose-invert prose-p:leading-7 prose-p:my-4 prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline prose-a:hover:underline max-w-none text-gray-800 dark:text-gray-700"
          />
        </MotionDiv>
      </MotionDiv>
    </section>
  );
};
