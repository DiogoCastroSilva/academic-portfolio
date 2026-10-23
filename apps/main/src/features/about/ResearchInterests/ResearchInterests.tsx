"use client";
import type { ResearchInterest } from "@academic-portfolio/content";
import { motion, useReducedMotion } from "motion/react";

export type ResearchInterestsProps = {
  items: ResearchInterest[];
};

export const ResearchInterests = ({ items }: ResearchInterestsProps) => {
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
        <h2 className="font-display mb-8 text-2xl font-bold md:text-3xl">
          Research Interests &amp; Expertise
        </h2>

        <MotionDiv
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          {...(shouldReduceMotion
            ? {}
            : {
                initial: { opacity: 0 },
                whileInView: { opacity: 1 },
                transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                viewport: { once: true },
              })}
        >
          {items.map((area, index) => (
            <MotionDiv
              key={area.title}
              className="bg-surface-elevated border-border flex flex-col gap-3 rounded-xl border p-6"
              {...(shouldReduceMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 10 },
                    whileInView: { opacity: 1, y: 0 },
                    transition: { duration: 0.4, delay: index * 0.1 },
                    viewport: { once: true },
                  })}
            >
              {area.icon && <div className="text-3xl">{area.icon}</div>}
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
