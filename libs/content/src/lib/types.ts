export interface ContentMeta {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  excerpt?: string;
  /** Optional team or authors listed for the content. */
  team?: string;
  /** Optional array of related links (paper, presentation, etc.). */
  links?: string[];
  /** Cover image filename in the content `md` folder (same folder as the `.md` file). */
  image?: string;
  /** URL served by the Next app, set when content is loaded. */
  imageSrc: string;
  /** Internal flag — true if this item is a draft (excluded from `getAll`). */
  draft?: boolean;
}

export interface ContentItemMeta extends ContentMeta {
  body: string;
}

export interface ContentLibraryConfig {
  /** Workspace-relative path to markdown files, e.g. `libs/projects/src/md`. */
  mdDir: string;
  /** Public URL prefix, e.g. `/projects`. */
  publicPrefix: string;
  /** Fallback image filename in the md folder. */
  placeholderFilename: string;
}

export interface ContentLibrary {
  getAll: () => ContentMeta[];
  getBySlug: (slug: string) => ContentMeta | undefined;
  getContentBySlug: (slug: string) => Promise<ContentItemMeta | undefined>;
}
