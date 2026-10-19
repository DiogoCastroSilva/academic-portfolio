import { describe, expect, it, vi } from "vitest";

import type { ProfileData, ContentItemMeta } from "@academic-portfolio/content";
import {
  buildPersonSchema,
  buildArticleSchema,
  buildWebSiteSchema,
  buildSiteAuthorSchema,
} from "./structured-data";

// Mock getProfile so site-config loads without requiring profile.md on disk
// during unit tests (site-config calls getProfile at module load time).
vi.mock("@academic-portfolio/content", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getProfile: () => ({
      name: "Dr. Jane Doe",
      role: "PhD Researcher | Earth Observation | Climate Solutions",
      description: "Climate researcher studying remote sensing applications.",
      email: "jane@example.com",
      linkedInUrl: "https://linkedin.com/in/jane",
      githubUrl: "https://github.com/jane",
      location: "Ithaca, NY",
      image: "profile.jpeg",
      imageSrc: "/images/profile.jpeg",
      biography: "<p>Bio</p>",
      education: [],
      researchInterests: [],
      skills: [],
    }),
    getFullUrl: (path: string) => `https://example.com/portfolio${path}`,
    getFullAssetUrl: (publicPath: string) =>
      `https://example.com/portfolio${publicPath.replace(/^\/portfolio/, "")}`,
    getDeploymentUrl: () => "https://example.com/portfolio",
    withPublicBasePath: (p: string) => p,
  };
});

const mockProfile: ProfileData = {
  name: "Dr. Jane Doe",
  role: "PhD Researcher | Earth Observation",
  description: "Climate researcher studying remote sensing applications.",
  email: "jane@example.com",
  linkedInUrl: "https://linkedin.com/in/jane",
  githubUrl: "https://github.com/jane",
  location: "Ithaca, NY",
  image: "profile.jpeg",
  imageSrc: "/images/profile.jpeg",
  biography: "<p>Bio</p>",
  education: [],
  researchInterests: [],
  skills: [],
};

describe("buildPersonSchema", () => {
  it("generates a Person schema with required fields", () => {
    const schema = buildPersonSchema(mockProfile);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Person");
    expect(schema.name).toBe("Dr. Jane Doe");
    expect(schema.jobTitle).toBe("PhD Researcher | Earth Observation");
    expect(schema.email).toBe("jane@example.com");
    expect(schema.url).toBe("https://example.com/portfolio/about/");
  });

  it("includes image URL and location when provided", () => {
    const schema = buildPersonSchema(mockProfile);

    expect(schema.image).toBe(
      "https://example.com/portfolio/images/profile.jpeg",
    );
    expect(schema.location).toBe("Ithaca, NY");
  });

  it("includes sameAs links", () => {
    const schema = buildPersonSchema(mockProfile);

    expect(schema.sameAs).toEqual([
      "https://linkedin.com/in/jane",
      "https://github.com/jane",
    ]);
  });

  it("handles missing location gracefully", () => {
    const profileNoLocation: ProfileData = {
      ...mockProfile,
      location: undefined,
    };
    const schema = buildPersonSchema(profileNoLocation);

    expect(schema).not.toHaveProperty("location");
  });

  it("omits email when not provided", () => {
    const profileNoEmail: ProfileData = {
      ...mockProfile,
      email: undefined,
    };
    const schema = buildPersonSchema(profileNoEmail);

    expect(schema).not.toHaveProperty("email");
  });
});

describe("buildArticleSchema", () => {
  it("generates Article schema for projects", () => {
    const project: ContentItemMeta = {
      slug: "first-project",
      href: "/projects/first-project",
      title: "Grapevine Virus Detection",
      date: "2025-11-01",
      tags: ["intro", "welcome"],
      excerpt: "Field notes from grapevine virus screening.",
      imageSrc: "/images/first-project.jpeg",
      imageType: "cover",
      body: "<p>Body</p>",
      team: "Audrey Chin, Noah Larkin",
    };

    const schema = buildArticleSchema(project);

    expect(schema["@type"]).toBe("Article");
    expect(schema.headline).toBe("Grapevine Virus Detection");
    expect(schema.datePublished).toBe("2025-11-01");
    expect(schema.url).toBe(
      "https://example.com/portfolio/projects/first-project/",
    );
    expect(schema.description).toBe(
      "Field notes from grapevine virus screening.",
    );
    expect(schema.keywords).toBe("intro, welcome");
  });

  it("generates ScholarlyArticle schema for publications", () => {
    const publication: ContentItemMeta = {
      slug: "neural-networks-review",
      href: "/publications/neural-networks-review",
      title: "A Review of Neural Networks in Remote Sensing",
      date: "2024-06-15",
      tags: ["deep-learning", "review"],
      excerpt: "Comprehensive review of neural network applications.",
      authors: ["Alice Smith", "Bob Jones"],
      venue: "Journal of Environmental Science",
      doi: "10.1000/journal.12345",
      paperUrl: "https://doi.org/10.1000/journal.12345",
      imageSrc: "/images/cover.jpeg",
      imageType: "cover",
      body: "<p>Abstract</p>",
    };

    const schema = buildArticleSchema(publication);

    expect(schema["@type"]).toBe("ScholarlyArticle");
    expect(schema.headline).toBe(
      "A Review of Neural Networks in Remote Sensing",
    );
    expect(schema.author).toEqual(["Alice Smith", "Bob Jones"]);
    expect(schema.publisher).toBe("Journal of Environmental Science");
    expect(schema.doi).toBe("10.1000/journal.12345");
    expect(schema.keywords).toBe("deep-learning, review");
  });

  it("uses single author as string instead of array", () => {
    const publication: ContentItemMeta = {
      slug: "single-author",
      href: "/publications/single-author",
      title: "Single Author Paper",
      date: "2024-01-01",
      tags: [],
      authors: ["Solo Author"],
      venue: "Some Journal",
      imageSrc: "/images/cover.jpeg",
      imageType: "cover",
      body: "<p>Abstract</p>",
    };

    const schema = buildArticleSchema(publication);

    expect(schema.author).toBe("Solo Author");
  });

  it("omits keywords when tags are empty", () => {
    const project: ContentItemMeta = {
      slug: "no-tags",
      href: "/projects/no-tags",
      title: "Untagged Project",
      date: "2025-01-01",
      imageSrc: "/images/no-tags.jpeg",
      imageType: "cover",
      body: "<p>Body</p>",
    };

    const schema = buildArticleSchema(project);

    expect(schema).not.toHaveProperty("keywords");
  });
});

describe("buildWebSiteSchema", () => {
  it("generates a WebSite schema with site name and URL", () => {
    const schema = buildWebSiteSchema();

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.name).toBe("Dr. Jane Doe");
    expect(schema.url).toBe("https://example.com/portfolio/");
  });

  it("includes description", () => {
    const schema = buildWebSiteSchema();

    expect(schema.description).toBeTruthy();
  });
});

describe("buildSiteAuthorSchema", () => {
  it("generates a Person schema with name and image", () => {
    const schema = buildSiteAuthorSchema(
      "Dr. Jane Doe",
      "/images/profile.jpeg",
    );

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Person");
    expect(schema.name).toBe("Dr. Jane Doe");
    expect(schema.image).toBe(
      "https://example.com/portfolio/images/profile.jpeg",
    );
    expect(schema.url).toBe("https://example.com/portfolio/about/");
  });

  it("omits image when not provided", () => {
    const schema = buildSiteAuthorSchema("Dr. Jane Doe", undefined);

    expect(schema).not.toHaveProperty("image");
  });
});
