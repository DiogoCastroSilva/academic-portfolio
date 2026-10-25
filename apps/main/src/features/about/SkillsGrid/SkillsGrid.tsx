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
      staggerChildren: MOTION_STAGGER,
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
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

const skillVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.25, ease: MOTION_EASE_ENTER },
  },
};

export const SkillsGrid = ({ categories }: SkillsGridProps) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionDiv = shouldReduceMotion ? "div" : motion.div;
  const MotionSpan = shouldReduceMotion ? "span" : motion.span;

  return (
    <section className="mx-4 p-6 sm:p-10 lg:p-12">
      <MotionDiv
        {...(shouldReduceMotion
          ? {}
          : {
              variants: sectionVariants,
              initial: "hidden",
              whileInView: "visible",
              viewport: { once: true },
            })}
      >
        <h2 className="font-display text-text-secondary mb-8 text-2xl font-normal md:text-3xl">
          Skills &amp; Tools
        </h2>

        <MotionDiv
          className="grid grid-cols-1 gap-8 md:grid-cols-2"
          {...(shouldReduceMotion
            ? {}
            : {
                variants: {
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: MOTION_STAGGER },
                  },
                },
                initial: "hidden",
                animate: "visible",
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
                  <MotionSpan
                    key={skill}
                    className="bg-surface-tinted text-text-secondary rounded-full px-4 py-2 text-sm font-medium"
                    {...(shouldReduceMotion
                      ? {}
                      : {
                          variants: skillVariants,
                          whileHover: { scale: 1.03 },
                          transition: {
                            duration: 0.25,
                            ease: MOTION_EASE_ENTER,
                          },
                        })}
                  >
                    {skill}
                  </MotionSpan>
                ))}
              </div>
            </MotionDiv>
          ))}
        </MotionDiv>
      </MotionDiv>
    </section>
  );
};
