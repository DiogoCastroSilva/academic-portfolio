import {
  createContentLibrary,
  type ContentItemMeta,
} from "@academic-portfolio/content";

export type BlogPostItemMeta = ContentItemMeta;

const blog = createContentLibrary({
  mdDir: "libs/blog/src/md",
  publicPrefix: "/blog",
  placeholderFilename: "blog-placeholder.svg",
});

export const getAllBlogPosts = blog.getAll;
export const getBlogPostBySlug = blog.getBySlug;
export const getBlogPostContentBySlug = blog.getContentBySlug;
