"use client";
import type { ProfileData } from "@katie-portfolio/content";
import { motion } from "motion/react";

import { ContentImage } from "./ContentImage";

type AboutSectionProps = {
  profile: ProfileData;
};

export const AboutSection = ({ profile }: AboutSectionProps) => {
  return (
    <section className="mx-4 rounded-2xl p-6 sm:p-12 dark:bg-sky-50">
      <motion.div
        className="flex flex-col gap-4 md:flex-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-4 flex-col items-center gap-2 md:flex-6">
          <ContentImage
            src={profile.imageSrc}
            alt={`Profile picture of ${profile.name}`}
            className="h-42 w-42 rounded-full sm:h-62 sm:w-62 md:h-30 md:w-30 lg:h-62 lg:w-62"
            sizes="(max-width: 640px) 160px, 120px"
            priority
          />
          <div className="flex flex-col items-center justify-center text-wrap">
            <h1 className="text-2xl font-bold lg:text-3xl">{profile.name}</h1>
            <p className="items-center text-center text-lg text-gray-600 dark:text-gray-700">
              {profile.role}
            </p>
          </div>
        </div>
        <div className="flex flex-12 flex-col gap-2 pt-2">
          <h2 className="text-xl font-bold lg:text-2xl">About Me</h2>
          <div
            dangerouslySetInnerHTML={{ __html: profile.biography }}
            className="prose prose-sm dark:prose-invert prose-p:leading-6 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline prose-a:hover:underline mt-4 max-w-none text-gray-800 dark:text-gray-700"
          />
        </div>
      </motion.div>
    </section>
  );
};
