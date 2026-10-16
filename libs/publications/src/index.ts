import {
  createContentLibrary,
  type ContentItemMeta,
  type ContentMeta,
} from "@katie-portfolio/content";

export type PublicationMeta = ContentMeta;
export type PublicationItemMeta = ContentItemMeta;

const publications = createContentLibrary({
  mdDir: "libs/publications/src/md",
  publicPrefix: "/publications",
  placeholderFilename: "publication-placeholder.svg",
});

export const getAllPublications = publications.getAll;
export const getPublicationBySlug = publications.getBySlug;
export const getPublicationContentBySlug = publications.getContentBySlug;
