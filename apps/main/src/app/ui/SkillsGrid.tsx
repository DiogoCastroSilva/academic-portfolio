"use client";
import type { SkillCategory } from "@katie-portfolio/content";
import { motion } from "motion/react";

type SkillsGridProps = {
  categories: SkillCategory[];
};

export const SkillsGrid = ({ categories }: SkillsGridProps) => {
  return (
    <section className="mx-4 rounded-2xl bg-white p-12 text-slate-900 shadow-sm dark:bg-sky-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="mb-8 text-2xl font-bold md:text-3xl">Skills & Tools</h2>

        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          viewport={{ once: true }}
        >
          {categories.map((category, catIndex) => (
            <motion.div
              key={category.category}
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: catIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {category.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 dark:border-zinc-400 dark:bg-white dark:text-slate-700"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: catIndex * 0.1 + skillIndex * 0.03,
                    }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, backgroundColor: "#e0f2fe" }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};
