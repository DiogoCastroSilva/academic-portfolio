"use client";
import type { EducationEntry } from "@academic-portfolio/content";
import { motion, useReducedMotion } from "motion/react";

import {
  MOTION_DELAY_CHILDREN,
  MOTION_DURATION_CHILD,
  MOTION_DURATION_SECTION,
  MOTION_EASE_ENTER,
  MOTION_OFFSET,
  MOTION_STAGGER,
  MOTION_VIEWPORT,
} from "@/lib/motion-config.js";

export type EducationTimelineProps = {
  items: EducationEntry[];
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

const entryVariants = {
  hidden: { opacity: 0, x: -MOTION_OFFSET },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION_DURATION_CHILD,
      ease: MOTION_EASE_ENTER,
    },
  },
};

export const EducationTimeline = ({ items }: EducationTimelineProps) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionDiv = shouldReduceMotion ? "div" : motion.div;

  return (
    <section className="mx-4 p-6 sm:p-10 lg:p-12">
      <MotionDiv
        className="motion-item-initial flex flex-col gap-8"
        {...(shouldReduceMotion
          ? {}
          : {
              variants: sectionVariants,
              initial: false,
              whileInView: "visible",
              viewport: MOTION_VIEWPORT,
            })}
      >
        <h2 className="font-display text-text-secondary text-2xl font-normal md:text-3xl">
          Education
        </h2>

        {items.map((edu, index) => (
          <MotionDiv
            key={edu.degree}
            className="motion-item-initial flex gap-4"
            {...(shouldReduceMotion
              ? {}
              : {
                  variants: entryVariants,
                })}
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <MotionDiv className="bg-accent h-5 w-5 rounded-full" />
              {index < items.length - 1 && (
                <div className="bg-border mt-2 w-0.5 flex-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex flex-col gap-2">
                <h3 className="text-text-primary text-lg font-semibold">
                  {edu.degree}
                </h3>
                <p className="text-accent text-sm font-medium">
                  {edu.institution}
                </p>
                <p className="text-text-secondary text-sm">{edu.period}</p>
                <p className="text-text-secondary mt-2">{edu.focus}</p>
                <ul className="mt-3 space-y-1">
                  {edu.details.map((detail) => (
                    <li
                      key={detail}
                      className="text-text-secondary flex gap-2 text-sm"
                    >
                      <span className="text-accent mt-1">&rarr;</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </MotionDiv>
        ))}
      </MotionDiv>
    </section>
  );
};
