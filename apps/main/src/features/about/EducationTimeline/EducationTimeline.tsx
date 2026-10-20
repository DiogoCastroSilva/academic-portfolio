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
    <section className="mx-4 rounded-2xl bg-white p-12 text-slate-900 shadow-sm dark:bg-sky-50">
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
        <h2 className="mb-8 text-2xl font-bold md:text-3xl">Education</h2>

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
                  className="h-4 w-4 rounded-full bg-sky-600"
                  {...(shouldReduceMotion
                    ? {}
                    : {
                        whileInView: { scale: 1.2 },
                        transition: { duration: 0.3 },
                        viewport: { once: true },
                      })}
                />
                {index < items.length - 1 && (
                  <div className="mt-2 h-16 w-0.5 bg-zinc-200 dark:bg-zinc-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {edu.degree}
                  </h3>
                  <p className="text-sm font-medium text-sky-600">
                    {edu.institution}
                  </p>
                  <p className="text-sm text-slate-600">{edu.period}</p>
                  <p className="mt-2 text-slate-600">{edu.focus}</p>
                  <ul className="mt-3 space-y-1">
                    {edu.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex gap-2 text-sm text-slate-600"
                      >
                        <span className="mt-1 text-sky-600">&rarr;</span>
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
