"use client";
import type { SkillCategory } from "@academic-portfolio/content";
import { motion, useReducedMotion } from "motion/react";

import {
  MOTION_DELAY_CHILDREN,
  MOTION_DURATION_CHILD,
  MOTION_DURATION_SECTION,
  MOTION_EASE_ENTER,
  MOTION_OFFSET,
  MOTION_STAGGER,
  MOTION_VIEWPORT_MARGIN,
} from "@/lib/motion-config.js";

export type SkillsGridProps = {
  categories: SkillCategory[];
};

const sectionVariants = {
  hidden: { opacity: 0, y: MOTION_OFFSET },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION_SECTION,
      ease: MOTION_EASE_ENTER,
      delayChildren: MOTION_DELAY_CHILDREN,
    },
  },
};

const categoryVariants = {
  hidden: { opacity: 0, y: MOTION_OFFSET / 2 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATION_CHILD,
      ease: MOTION_EASE_ENTER,
    },
  },
};

export const SkillsGrid = ({ categories }: SkillsGridProps) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionDiv = shouldReduceMotion ? "div" : motion.div;

  return (
    <section className="mx-4 p-6 sm:p-10 lg:p-12">
      <MotionDiv
        className="flex flex-col gap-8"
        {...(shouldReduceMotion
          ? {}
          : {
              variants: sectionVariants,
              initial: "hidden",
              whileInView: "visible",
              viewport: { once: true, margin: MOTION_VIEWPORT_MARGIN },
            })}
      >
        <h2 className="font-display text-text-secondary text-2xl font-normal md:text-3xl">
          Skills &amp; Tools
        </h2>

        <MotionDiv
          className="grid grid-cols-1 gap-8 md:grid-cols-2"
          {...(shouldReduceMotion
            ? {}
            : {
                variants: {
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: MOTION_STAGGER },
                  },
                },
              })}
        >
          {categories.map((category) => (
            <MotionDiv
              key={category.category}
              className="flex flex-col gap-4"
              {...(shouldReduceMotion
                ? {}
                : {
                    variants: categoryVariants,
                  })}
            >
              <h3 className="text-text-primary text-lg font-semibold">
                {category.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((skill) => (
                  <span
                    key={skill}
                    className="bg-surface-tinted text-text-secondary rounded-full px-4 py-2 text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </MotionDiv>
          ))}
        </MotionDiv>
      </MotionDiv>
    </section>
  );
};
