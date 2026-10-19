import {
  createContentLibrary,
  type ContentItemMeta,
  type ProjectMeta,
} from "@academic-portfolio/content";

export type { ProjectMeta };
export type ProjectItemMeta = ContentItemMeta;

const projects = createContentLibrary({
  mdDir: "libs/projects/src/md",
  publicPrefix: "/projects",
  placeholderFilename: "project-placeholder.svg",
});

export const getAllProjects = projects.getAll;
export const getProjectBySlug = projects.getBySlug;
export const getProjectContentBySlug = projects.getContentBySlug;
