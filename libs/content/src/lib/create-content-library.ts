import fs from 'fs';
import matter from 'gray-matter';
import { marked } from 'marked';
import path from 'path';
import 'server-only';
import {
  DEPLOYMENT_PLACEHOLDER,
  getDeploymentUrl,
  withPublicBasePath,
} from './constants';

import {
  ContentItemMeta,
  ContentLibrary,
  ContentLibraryConfig,
  ContentMeta,
} from './types';

// Re-export shared types so consumers (and tests) can import them
// from this module without knowing about the internal ./types file.
export type {
  ContentItemMeta,
  ContentLibrary,
  ContentLibraryConfig,
  ContentMeta,
} from './types';

const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
] as const;

function resolveContentPath(mdDir: string): string {
  return path.join(process.cwd(), '../../', mdDir);
}

function fileExistsInDir(contentPath: string, filename: string): boolean {
  const resolved = path.resolve(contentPath, filename);
  const root = path.resolve(contentPath);

  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return false;
  }

  return fs.existsSync(resolved) && fs.statSync(resolved).isFile();
}

function resolveImage(
  contentPath: string,
  publicPrefix: string,
  placeholderFilename: string,
  slug: string,
  image?: string,
): string {
  if (image?.trim()) {
    const filename = path.basename(image.trim());
    if (fileExistsInDir(contentPath, filename)) {
      return withPublicBasePath(`${publicPrefix}/${filename}`);
    }
  }

  for (const ext of IMAGE_EXTENSIONS) {
    const filename = `${slug}${ext}`;
    if (fileExistsInDir(contentPath, filename)) {
      return withPublicBasePath(`${publicPrefix}/${filename}`);
    }
  }

  return withPublicBasePath(`${publicPrefix}/${placeholderFilename}`);
}

function validateFrontmatter(
  file: string,
  data: Record<string, unknown>,
): void {
  const errors: string[] = [];

  if (data.title === undefined) {
    errors.push('`title` is required');
  } else if (typeof data.title !== 'string') {
    errors.push(`\`title\` must be a string, got ${typeof data.title}`);
  }

  if (data.date === undefined) {
    errors.push('`date` is required');
  } else if (typeof data.date !== 'string') {
    errors.push(`\`date\` must be a string, got ${typeof data.date}`);
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push(`\`date\` must be in YYYY-MM-DD format, got "${data.date}"`);
  }

  if (data.slug !== undefined && typeof data.slug !== 'string') {
    errors.push(`\`slug\` must be a string, got ${typeof data.slug}`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid frontmatter in "${file}":\n  ${errors.join('\n  ')}`,
    );
  }
}

function toContentMeta(
  contentPath: string,
  publicPrefix: string,
  placeholderFilename: string,
  file: string,
  data: Record<string, unknown>,
): ContentMeta {
  validateFrontmatter(file, data);

  const slug =
    typeof data.slug === 'string' && data.slug.trim() !== ''
      ? data.slug
      : file.replace(/\.mdx?$/, '');

  const image =
    typeof data.image === 'string'
      ? data.image
      : typeof data.imageUrl === 'string'
        ? data.imageUrl
        : undefined;

  const tags = Array.isArray(data.tags)
    ? data.tags.filter((t): t is string => typeof t === 'string')
    : undefined;
  const excerpt = typeof data.excerpt === 'string' ? data.excerpt : undefined;
  const team = typeof data.team === 'string' ? data.team : undefined;
  const links = Array.isArray(data.links)
    ? data.links.filter((l): l is string => typeof l === 'string')
    : undefined;

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    ...(tags && tags.length > 0 && { tags }),
    ...(excerpt && { excerpt }),
    ...(team && { team }),
    ...(links && links.length > 0 && { links }),
    ...(image && { image }),
    imageSrc: resolveImage(
      contentPath,
      publicPrefix,
      placeholderFilename,
      slug,
      image,
    ),
  };
}

export function createContentLibrary(
  config: ContentLibraryConfig,
): ContentLibrary {
  const contentPath = resolveContentPath(config.mdDir);

  function getAll(): ContentMeta[] {
    if (!fs.existsSync(contentPath)) {
      return [];
    }

    return fs
      .readdirSync(contentPath)
      .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
      .map((file) => {
        const filePath = path.join(contentPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(content);

        return toContentMeta(
          contentPath,
          config.publicPrefix,
          config.placeholderFilename,
          file,
          data as Record<string, unknown>,
        );
      })
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }

  function getBySlug(slug: string): ContentMeta | undefined {
    if (!slug?.trim() || typeof slug !== 'string') {
      return undefined;
    }

    for (const ext of ['.md', '.mdx'] as const) {
      const fileName = `${slug}${ext}`;
      const filePath = path.join(contentPath, fileName);
      if (!fs.existsSync(filePath)) {
        continue;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(content);
      return toContentMeta(
        contentPath,
        config.publicPrefix,
        config.placeholderFilename,
        fileName,
        data as Record<string, unknown>,
      );
    }
    return undefined;
  }

  function getContentBySlug(
    slug: string,
  ): Promise<ContentItemMeta | undefined> {
    return (async () => {
      if (!slug?.trimEnd() || typeof slug !== 'string') {
        return undefined;
      }

      for (const ext of ['.md', '.mdx'] as const) {
        const fileName = `${slug}${ext}`;
        const filePath = path.join(contentPath, fileName);
        if (!fs.existsSync(filePath)) {
          continue;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const { data, content: body } = matter(content);
        const meta = toContentMeta(
          contentPath,
          config.publicPrefix,
          config.placeholderFilename,
          fileName,
          data as Record<string, unknown>,
        );

        let htmlBody = await marked(body);

        // Determine deployment URL using shared helper
        const deploymentUrl = getDeploymentUrl();

        // Replace DEPLOYMENT_URL placeholder and empty hrefs BEFORE relative-link
        // rewriting. Otherwise the placeholder gets prefixed with the public path
        // and the later replacement no longer matches.
        if (deploymentUrl) {
          const ph = DEPLOYMENT_PLACEHOLDER;
          htmlBody = htmlBody.replace(
            new RegExp(`href=("|')${ph}\\1`, 'g'),
            `href="${deploymentUrl}"`,
          );
          htmlBody = htmlBody.replace(
            /href=("|')\1/g,
            `href="${deploymentUrl}"`,
          );
        }

        // Post-process: rewrite relative image paths to absolute URLs
        // Matches: src="filename.ext" or src='filename.ext' (not starting with / or http)
        htmlBody = htmlBody.replace(
          /src=["'](?!\/|https?:)([^"']+)["']/g,
          (match, imagePath) =>
            `src="${withPublicBasePath(`${config.publicPrefix}/${imagePath}`)}"`,
        );

        // Rewrite relative link hrefs to use the publicPrefix.
        // DEPLOYMENT_URL placeholders and empty hrefs were already replaced above.
        // Skip absolute URLs (http/https), anchors (#), and mailto links.
        htmlBody = htmlBody.replace(
          /href=["'](?!https?:|mailto:|#)([^"']+)["']/g,
          (match, linkPath) =>
            `href="${withPublicBasePath(`${config.publicPrefix}/${linkPath.replace(/^\//, '')}`)}"`,
        );

        // Ensure external links open safely in a new tab and mark them
        htmlBody = htmlBody.replace(
          /<a\s+href=("|')(https?:\/\/[^"']+)\1/g,
          (match, q, url) =>
            `<a href=${q}${url}${q} class="external-link" target="_blank" rel="noopener noreferrer"`,
        );

        return { ...meta, body: htmlBody };
      }
      return undefined;
    })();
  }

  return { getAll, getBySlug, getContentBySlug };
}
