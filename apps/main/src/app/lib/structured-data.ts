import type { ProfileData, ContentItemMeta } from "@katie-portfolio/content";
import { getFullUrl, getFullAssetUrl } from "@katie-portfolio/content";

import { siteConfig } from "../../configs/site-config";

/**
 * A JSON-LD object that search engines can parse as structured data.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */
export type JsonLdData = Record<string, unknown>;

/** Person schema for the About page. */
export function buildPersonSchema(profile: ProfileData): JsonLdData {
  const profileImage = getFullAssetUrl(profile.imageSrc);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    ...(profileImage ? { image: profileImage } : {}),
    ...(profile.location ? { location: profile.location } : {}),
    jobTitle: profile.role,
    email: profile.email,
    url: getFullUrl("/about/"),
    sameAs: [profile.linkedInUrl, profile.githubUrl].filter(Boolean),
  };
}

/**
 * Article schema for content detail pages.
 *
 * Publications automatically use `ScholarlyArticle` (with `author`,
 * `publisher`, and `doi` fields); projects use `Article`.
 */
export function buildArticleSchema(content: ContentItemMeta): JsonLdData {
  const image = getFullAssetUrl(content.imageSrc);
  const isPublication =
    Boolean(content.authors?.length) || Boolean(content.venue);
  const schemaType = isPublication ? "ScholarlyArticle" : "Article";

  const base: JsonLdData = {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: content.title,
    datePublished: content.date,
    ...(image ? { image } : {}),
    url: getFullUrl(`${content.href}/`),
    ...(content.excerpt ? { description: content.excerpt } : {}),
  };

  if (isPublication) {
    // Publication-specific fields (ScholarlyArticle)
    if (content.authors?.length) {
      base.author =
        content.authors.length === 1 ? content.authors[0] : content.authors;
    }
    if (content.venue) {
      base.publisher = content.venue;
    }
    if (content.doi) {
      base.doi = content.doi;
    }
  }

  if (content.tags && content.tags.length > 0) {
    base.keywords = content.tags.join(", ");
  }

  return base;
}

/** WebSite schema for the homepage. */
export function buildWebSiteSchema(): JsonLdData {
  const description = `Portfolio of ${siteConfig.name} — science, nature-based solutions, projects, and publications.`;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: getFullUrl("/"),
    description,
    ...(siteConfig.deploymentUrl
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteConfig.deploymentUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }
      : {}),
  };
}

/** Person schema for the homepage (author of the site). */
export function buildSiteAuthorSchema(
  profileName: string,
  profileImage?: string,
): JsonLdData {
  const image = profileImage ? getFullAssetUrl(profileImage) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profileName,
    ...(image ? { image } : {}),
    url: getFullUrl("/about/"),
  };
}
