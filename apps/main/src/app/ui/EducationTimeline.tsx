"use client";
import { motion } from "motion/react";

const EDUCATION = [
  {
    degree: "PhD in Earth & Atmospheric Sciences",
    institution: "Cornell University",
    period: "2024 - Present",
    focus: "Remote sensing and environmental analysis",
    details: [
      "Focus on Earth observation applications for agricultural monitoring and climate solutions",
      "Working with hyperspectral and multispectral satellite imagery",
      "Collaboration with NASA DEVELOP program",
    ],
  },
  {
    degree: "BSc in Science",
    institution: "University",
    period: "Completed",
    focus: "Foundation in environmental science and quantitative methods",
    details: [
      "Strong background in analytical methods and data analysis",
      "Development of research and communication skills",
      "Interdisciplinary approach to environmental challenges",
    ],
  },
];

export const EducationTimeline = () => {
  return (
    <section className="mx-4 rounded-2xl bg-white p-12 text-slate-900 shadow-sm dark:bg-sky-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="mb-8 text-2xl font-bold md:text-3xl">Education</h2>

        <div className="space-y-8">
          {EDUCATION.map((edu, index) => (
            <motion.div
              key={edu.degree}
              className="flex gap-6 pb-8 last:pb-0"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <motion.div
                  className="h-4 w-4 rounded-full bg-sky-600"
                  whileInView={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                  viewport={{ once: true }}
                />
                {index < EDUCATION.length - 1 && (
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
                  <p className="text-sm text-slate-600 dark:text-slate-500">
                    {edu.period}
                  </p>
                  <p className="mt-2 text-slate-700 dark:text-gray-400">
                    {edu.focus}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {edu.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex gap-2 text-sm text-slate-700 dark:text-gray-400"
                      >
                        <span className="mt-1 text-sky-600">→</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
