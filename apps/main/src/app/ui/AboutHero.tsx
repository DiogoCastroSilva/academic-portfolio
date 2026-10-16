"use client";
import { motion } from "motion/react";
import Image from "next/image";

import profileImage from "../../assets/profile.jpeg";

const PROFILE_PIC_SIZE = 500;

type AboutHeroProps = {
  email: string;
};

export const AboutHero = ({ email }: AboutHeroProps) => {
  return (
    <section className="mx-4 rounded-2xl p-6 sm:p-12 dark:bg-sky-50">
      <motion.div
        className="flex flex-col gap-8 md:gap-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Hero Header */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Image
                src={profileImage}
                alt="Profile picture of Kathleen Miller"
                width={PROFILE_PIC_SIZE}
                height={PROFILE_PIC_SIZE}
                loading="eager"
                className="h-48 w-48 rounded-full sm:h-64 sm:w-64 md:h-56 md:w-56"
              />
            </motion.div>
            <motion.div
              className="flex flex-col gap-4 text-center md:text-left"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div>
                <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                  Kathleen Miller
                </h1>
                <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
                  PhD Researcher | Earth Observation | Climate Solutions
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                <a
                  href={`mailto:${email}`}
                  className="rounded-full border-2 border-sky-600 px-6 py-2 font-medium text-sky-600 transition-all hover:bg-sky-600 hover:text-white dark:text-sky-600"
                >
                  Get in Touch
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Bio */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold md:text-3xl">About Me</h2>
          <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-400">
            I&apos;m a PhD researcher passionate about leveraging Earth
            observation technology and data-driven approaches to address
            critical environmental challenges. My work bridges remote sensing,
            geospatial analysis, and climate science to develop scalable
            solutions for climate change mitigation and adaptation.
          </p>
          <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-400">
            With expertise in hyperspectral and multispectral imagery analysis,
            machine learning applications in environmental monitoring, and
            collaborative research with interdisciplinary teams, I&apos;m
            focused on translating complex Earth observation data into
            actionable insights that support environmental sustainability and
            decision-making.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};
