"use client";
import { motion } from "motion/react";

import profileImage from "../../assets/profile.jpeg";
import { ContentImage } from "./ContentImage";

const ABOUT_CONTENT = `Highly analytical and results-oriented professional with extensive experience in optimization and network modelling, strategy development, and data analysis. Demonstrated ability to define and implement innovative processes and solutions, collaborate with diverse stakeholders, and manage complex analytical models. Passionate about developing data-driven solutions to support climate change mitigation and adaptation strategies.`;

export const AboutSection = () => {
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
            src={profileImage}
            alt="Profile picture of Kathleen Miller"
            className="h-42 w-42 rounded-full sm:h-62 sm:w-62 md:h-30 md:w-30 lg:h-62 lg:w-62"
            sizes="(max-width: 640px) 160px, 120px"
            priority
          />
          <div className="flex flex-col items-center justify-center text-wrap">
            <h1 className="text-2xl font-bold lg:text-3xl">Kathleen Miller</h1>
            <p className="items-center text-center text-lg text-gray-600 dark:text-gray-400">
              Passionate about science and nature-based solutions
            </p>
          </div>
        </div>
        <div className="flex flex-12 flex-col gap-2 pt-2">
          <h2 className="text-xl font-bold lg:text-2xl">About Me</h2>
          <p className="mt-4 indent-4 text-lg/8 text-gray-800 dark:text-gray-400">
            {ABOUT_CONTENT}
          </p>
        </div>
      </motion.div>
    </section>
  );
};
