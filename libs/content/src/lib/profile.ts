import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import "server-only";
import matter from "gray-matter";

import { getDeploymentUrl, withPublicBasePath } from "./constants";
import { createMarkedInstance } from "./marked-extensions.js";

/** A single education entry parsed from profile frontmatter. */
export interface EducationEntry {
  degree: string;
  institution: string;
  period: string;
  focus: string;
  details: string[];
}

/** A single research interest parsed from profile frontmatter. */
export interface ResearchInterest {
  title: string;
  description: string;
  /** Emoji or HTML entity for the icon. */
  icon?: string;
}

/** A skill category with a list of skill items. */
export interface SkillCategory {
  category: string;
  items: string[];
}

/** Structured metadata for the profile, parsed from YAML frontmatter. */
export interface ProfileMeta {
  name: string;
  role: string;
  email: string;
  linkedInUrl: string;
  githubUrl: string;
  location?: string;
  /** Filename of the profile image in the content `md` folder. */
  image: string;
  /** Resolved URL (with base path) for the profile image. */
  imageSrc: string;
  education: EducationEntry[];
  researchInterests: ResearchInterest[];
  skills: SkillCategory[];
}

/** Full profile data including the biography as rendered HTML. */
export interface ProfileData extends ProfileMeta {
  /** Biography rendered from Markdown to HTML. */
  biography: string;
}

// ---------------------------------------------------------------------------
// Parsing helpers (pure functions — testable without file system access)
// ---------------------------------------------------------------------------

function parseEducation(data: unknown): EducationEntry[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (e): e is Record<string, unknown> => typeof e === "object" && e !== null,
    )
    .map((e) => ({
      degree: typeof e.degree === "string" ? e.degree : "",
      institution: typeof e.institution === "string" ? e.institution : "",
      period: typeof e.period === "string" ? e.period : "",
      focus: typeof e.focus === "string" ? e.focus : "",
      details: Array.isArray(e.details)
        ? e.details.filter((d): d is string => typeof d === "string")
        : [],
    }));
}

function parseResearchInterests(data: unknown): ResearchInterest[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (r): r is Record<string, unknown> => typeof r === "object" && r !== null,
    )
    .map((r) => ({
      title: typeof r.title === "string" ? r.title : "",
      description: typeof r.description === "string" ? r.description : "",
      icon: typeof r.icon === "string" ? r.icon : undefined,
    }));
}

function parseSkills(data: unknown): SkillCategory[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (s): s is Record<string, unknown> => typeof s === "object" && s !== null,
    )
    .map((s) => ({
      category: typeof s.category === "string" ? s.category : "",
      items: Array.isArray(s.items)
        ? s.items.filter((i): i is string => typeof i === "string")
        : [],
    }));
}

/** Validate required profile frontmatter fields. */
function validateProfileFrontmatter(data: Record<string, unknown>): void {
  const errors: string[] = [];
  const required = ["name", "role", "email", "linkedInUrl", "githubUrl"];

  for (const field of required) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      errors.push(`\`${field}\` is required and must be a non-empty string`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid profile.md frontmatter:\n  ${errors.join("\n  ")}`,
    );
  }
}

/**
 * Parse a raw profile.md string into structured profile data.
 *
 * This is a pure function: it takes the file content (frontmatter + body)
 * and returns a `ProfileData` object. It does not read from disk, making
 * it trivially testable.
 */
export function parseProfile(content: string): ProfileData {
  const { data, content: markdownBody } = matter(content);
  validateProfileFrontmatter(data);

  const image =
    typeof data.image === "string" && data.image.trim() !== ""
      ? data.image
      : "profile.jpeg";

  const imageFilename = path.basename(image);
  const imageSrc = withPublicBasePath(`/images/${imageFilename}`);

  return {
    name: data.name as string,
    role: data.role as string,
    email: data.email as string,
    linkedInUrl: data.linkedInUrl as string,
    githubUrl: data.githubUrl as string,
    location: typeof data.location === "string" ? data.location : undefined,
    image,
    imageSrc,
    education: parseEducation(data.education),
    researchInterests: parseResearchInterests(data.researchInterests),
    skills: parseSkills(data.skills),
    biography: parseBiography(markdownBody),
  };
}

/** Parse a markdown biography string into HTML using the content renderer. */
function parseBiography(markdownBody: string): string {
  const markedInstance = createMarkedInstance({
    publicPrefix: "",
    deploymentUrl: getDeploymentUrl(),
  });
  return markedInstance.parse(markdownBody) as string;
}

// ---------------------------------------------------------------------------
// File loader (reads from disk — server-side only)
// ---------------------------------------------------------------------------

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const PROFILE_PATH = path.join(moduleDir, "..", "md", "profile.md");

/**
 * Load and parse the profile from `libs/content/src/md/profile.md`.
 *
 * Must be called in a server-side context (build time for SSG, or server
 * environment). Uses `fs` to read the file from disk.
 */
export function getProfile(): ProfileData {
  if (!fs.existsSync(PROFILE_PATH)) {
    throw new Error(
      `profile.md not found at ${PROFILE_PATH}. ` +
        "Create it in libs/content/src/md/profile.md.",
    );
  }

  const content = fs.readFileSync(PROFILE_PATH, "utf-8");
  return parseProfile(content);
}
