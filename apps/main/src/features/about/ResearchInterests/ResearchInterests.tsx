"use client";
import type { ResearchInterest } from "@academic-portfolio/content";
import { motion, useReducedMotion } from "motion/react";

import {
  MOTION_DELAY_CHILDREN,
  MOTION_DURATION_CHILD,
  MOTION_DURATION_SECTION,
  MOTION_EASE_ENTER,
  MOTION_OFFSET,
  MOTION_STAGGER,
} from "@/lib/motion-config.js";

export type ResearchInterestsProps = {
  items: ResearchInterest[];
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

const cardVariants = {
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

export const ResearchInterests = ({ items }: ResearchInterestsProps) => {
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
              viewport: { once: true },
            })}
      >
        <h2 className="font-display text-text-secondary text-2xl font-normal md:text-3xl">
          Research Interests &amp; Expertise
        </h2>

        <MotionDiv
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
              })}
        >
          {items.map((area) => (
            <MotionDiv
              key={area.title}
              className="bg-surface-elevated border-border flex flex-col gap-2 rounded-xl border p-6"
              {...(shouldReduceMotion
                ? {}
                : {
                    variants: cardVariants,
                  })}
            >
              {area.icon && <div className="text-2xl">{area.icon}</div>}
              <h3 className="text-text-primary text-lg font-semibold">
                {area.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {area.description}
              </p>
            </MotionDiv>
          ))}
        </MotionDiv>
      </MotionDiv>
    </section>
  );
};
