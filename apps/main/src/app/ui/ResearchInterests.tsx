"use client";
import { motion } from "motion/react";

const RESEARCH_AREAS = [
  {
    title: "Remote Sensing & Earth Observation",
    description:
      "Hyperspectral and multispectral imagery analysis for environmental monitoring and agricultural applications.",
    icon: "🛰️",
  },
  {
    title: "Machine Learning Applications",
    description:
      "Developing and implementing ML models (random forests, neural networks) for classification and predictive analysis of geospatial data.",
    icon: "🤖",
  },
  {
    title: "Climate Change Mitigation",
    description:
      "Nature-based solutions and sustainable strategies for addressing climate change through data-driven environmental assessment.",
    icon: "🌍",
  },
  {
    title: "Agricultural Innovation",
    description:
      "Using spectral analysis and EO data to improve crop monitoring, disease detection, and agricultural productivity.",
    icon: "🌾",
  },
  {
    title: "Data Visualization",
    description:
      "Transforming complex geospatial data into compelling visual insights for stakeholder communication and decision support.",
    icon: "📊",
  },
  {
    title: "Interdisciplinary Collaboration",
    description:
      "Working with agronomists, climatologists, and policy makers to bridge science and practical environmental solutions.",
    icon: "🤝",
  },
];

export const ResearchInterests = () => {
  return (
    <section className="mx-4 rounded-2xl bg-white p-12 text-slate-900 shadow-sm dark:bg-sky-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="mb-8 text-2xl font-bold md:text-3xl">
          Research Interests & Expertise
        </h2>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          viewport={{ once: true }}
        >
          {RESEARCH_AREAS.map((area, index) => (
            <motion.div
              key={area.title}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-6 dark:bg-white"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl">{area.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900">
                {area.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-700">
                {area.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
