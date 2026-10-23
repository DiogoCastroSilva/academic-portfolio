"use client";
import type { EducationEntry } from "@academic-portfolio/content";
import { motion, useReducedMotion } from "motion/react";

export type EducationTimelineProps = {
  items: EducationEntry[];
};

export const EducationTimeline = ({ items }: EducationTimelineProps) => {
  const shouldReduceMotion = useReducedMotion();
  const MotionDiv = shouldReduceMotion ? "div" : motion.div;

  return (
    <section className="bg-surface-card text-text-primary mx-4 rounded-2xl p-12 shadow-sm">
      <MotionDiv
        {...(shouldReduceMotion
          ? {}
          : {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              transition: { duration: 0.6 },
              viewport: { once: true },
            })}
      >
        <h2 className="font-display text-text-secondary mb-8 text-2xl font-normal md:text-3xl">
          Education
        </h2>

        <div className="space-y-8">
          {items.map((edu, index) => (
            <MotionDiv
              key={edu.degree}
              className="flex gap-6 pb-8 last:pb-0"
              {...(shouldReduceMotion
                ? {}
                : {
                    initial: { opacity: 0, x: -20 },
                    whileInView: { opacity: 1, x: 0 },
                    transition: { duration: 0.4, delay: index * 0.15 },
                    viewport: { once: true },
                  })}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <MotionDiv
                  className="bg-accent h-4 w-4 rounded-full"
                  {...(shouldReduceMotion
                    ? {}
                    : {
                        whileInView: { scale: 1.2 },
                        transition: { duration: 0.3 },
                        viewport: { once: true },
                      })}
                />
                {index < items.length - 1 && (
                  <div className="bg-border mt-2 h-16 w-0.5" />
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
        </div>
      </MotionDiv>
    </section>
  );
};
