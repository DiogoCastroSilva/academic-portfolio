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
  /** Display name used in titles, headings, and structured data. */
  name: string;
  /** Professional role or headline, e.g. "PhD Candidate in Computer Science". */
  role: string;
  /** Concise, owner-editable SEO description for the site. */
  description?: string;
  /** Contact email address. Optional — forks may omit this. */
  email?: string;
  /** LinkedIn profile URL. Optional — forks may omit this. */
  linkedInUrl?: string;
  /** GitHub profile URL. Optional — forks may omit this. */
  githubUrl?: string;
  /** Geographic location, e.g. "Ithaca, NY". */
  location?: string;
  /**
   * URL for the visitor's CV/resume PDF.
   *
   * Two modes are supported:
   * - **External** — a full `https://` URL to a publicly accessible PDF.
   * - **Local** — a relative path (e.g. `cv.pdf`) resolved under the
   *   configured GitHub Pages base path via `withPublicBasePath`.
   *
   * When omitted (or empty), no CV link is rendered.
   */
  cvUrl?: string;
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
      icon:
        typeof r.icon === "string"
          ? decodeHtmlEntities(r.icon.trim())
          : undefined,
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
  // Only name and role are genuinely required; everything else is optional
  // so the template supports forks that omit contact or social links.
  const required = ["name", "role"];

  for (const field of required) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      errors.push(`\`${field}\` is required and must be a non-empty string`);
    }
  }

  // Validate optional cvUrl field (HTTPS URL or relative local path)
  validateCvUrl(data.cvUrl, errors);

  if (errors.length > 0) {
    throw new Error(`Invalid README.md frontmatter:\n  ${errors.join("\n  ")}`);
  }
}

/**
 * Validate the optional `cvUrl` frontmatter field.
 *
 * Accepts either:
 * - A full `https://` URL to a publicly accessible PDF (Mode B — external).
 * - A relative local path (e.g. `cv.pdf` or `files/cv.pdf`) that will be
 *   resolved under the GitHub Pages base path at runtime (Mode A — local).
 *
 * Rejects:
 * - Non-string values
 * - `http://`, `ftp://`, `file://`, or any non-HTTPS scheme
 * - Protocol-relative URLs (`//example.com/...`)
 * - Absolute local paths (leading `/`)
 * - Paths containing `..` (path traversal)
 *
 * An empty string is treated as "not configured" and is accepted silently.
 */
function validateCvUrl(value: unknown, errors: string[]): void {
  if (value === undefined) return;
  if (typeof value !== "string") {
    errors.push(
      `\`'cvUrl' must be a string (HTTPS URL or relative path) or undefined, got \`${typeof value}'\``,
    );
    return;
  }

  const trimmed = value.trim();
  if (trimmed === "") return; // empty = not configured

  // External URL: must use https:// scheme
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (schemeMatch) {
    if (schemeMatch[1] === "https") {
      // Valid external HTTPS URL — accept as-is
      return;
    }
    errors.push(
      `\`'cvUrl' external URLs must use HTTPS, got \`${trimmed}'\`.` +
        " Use an https:// URL to a publicly accessible PDF.",
    );
    return;
  }

  // Protocol-relative URL (e.g. //example.com/cv.pdf)
  if (trimmed.startsWith("//")) {
    errors.push(
      `\`'cvUrl' must not use protocol-relative URLs, got \`${trimmed}'\`.` +
        " Use a full https:// URL or a relative path.",
    );
    return;
  }

  // Local path: must be relative (no leading /), no parent traversal
  if (trimmed.startsWith("/")) {
    errors.push(
      `\`'cvUrl' local paths must be relative (no leading slash), got \`${trimmed}'\`.` +
        " Use a path like 'cv.pdf' — the base path is added automatically.",
    );
    return;
  }

  if (trimmed.includes("..")) {
    errors.push(
      `\`'cvUrl' local paths must not contain '..' (path traversal), got \`${trimmed}'\``,
    );
    return;
  }
}

/**
 * Validate `value` is a non-empty string, pushing an error if not.
 */
function assertNonEmptyString(
  value: unknown,
  path: string,
  errors: string[],
): void {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(
      `\`'${path}' must be a non-empty string, got \`${typeof value}\``,
    );
  }
}

/**
 * Validate `value` is an array of strings, pushing an error if not.
 */
function assertStringArray(
  value: unknown,
  path: string,
  errors: string[],
): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`\`'${path}' must be an array, got \`${typeof value}\``);
    return;
  }
  for (const [j, item] of value.entries()) {
    if (typeof item !== "string") {
      errors.push(`\`'${path}[${j}]' must be a string, got \`${typeof item}\``);
    }
  }
}

/** Validate an education entry from profile frontmatter. */
function validateEducationEntry(
  entry: unknown,
  index: number,
  errors: string[],
): void {
  const path = `education[${index}]`;
  if (typeof entry !== "object" || entry === null) {
    errors.push(`\`'${path}' must be an object, got \`${typeof entry}\``);
    return;
  }
  const e = entry as Record<string, unknown>;
  assertNonEmptyString(e.degree, `${path}.degree`, errors);
  assertNonEmptyString(e.institution, `${path}.institution`, errors);
  assertNonEmptyString(e.period, `${path}.period`, errors);
  assertNonEmptyString(e.focus, `${path}.focus`, errors);
  assertStringArray(e.details, `${path}.details`, errors);
}

/** Validate a research interest entry from profile frontmatter. */
function validateResearchInterestEntry(
  entry: unknown,
  index: number,
  errors: string[],
): void {
  const path = `researchInterests[${index}]`;
  if (typeof entry !== "object" || entry === null) {
    errors.push(`\`'${path}' must be an object, got \`${typeof entry}\``);
    return;
  }
  const r = entry as Record<string, unknown>;
  assertNonEmptyString(r.title, `${path}.title`, errors);
  assertNonEmptyString(r.description, `${path}.description`, errors);
  if (r.icon !== undefined && typeof r.icon !== "string") {
    errors.push(
      `\`'${path}.icon' must be a string or undefined, got \`${typeof r.icon}\``,
    );
  }
}

/** Validate a skill category entry from profile frontmatter. */
function validateSkillEntry(
  entry: unknown,
  index: number,
  errors: string[],
): void {
  const path = `skills[${index}]`;
  if (typeof entry !== "object" || entry === null) {
    errors.push(`\`'${path}' must be an object, got \`${typeof entry}\``);
    return;
  }
  const s = entry as Record<string, unknown>;
  assertNonEmptyString(s.category, `${path}.category`, errors);
  assertStringArray(s.items, `${path}.items`, errors);
}

/**
 * Validate the nested collections in profile frontmatter.
 *
 * Unlike the parsing functions (which silently drop or default invalid
 * values), this validator collects all errors and throws once with an
 * actionable message — matching the approach used by `validateFrontmatter`
 * for content collections. Fields are only validated when present; missing
 * optional collections are not errors.
 */
export function validateProfileNestedData(data: Record<string, unknown>): void {
  const errors: string[] = [];

  if (data.education !== undefined) {
    if (!Array.isArray(data.education)) {
      errors.push(
        `\`'education' must be an array, got \`${typeof data.education}\``,
      );
    } else {
      data.education.forEach((entry, i) =>
        validateEducationEntry(entry, i, errors),
      );
    }
  }

  if (data.researchInterests !== undefined) {
    if (!Array.isArray(data.researchInterests)) {
      errors.push(
        `\`'researchInterests' must be an array, got \`${typeof data.researchInterests}\``,
      );
    } else {
      data.researchInterests.forEach((entry, i) =>
        validateResearchInterestEntry(entry, i, errors),
      );
    }
  }

  if (data.skills !== undefined) {
    if (!Array.isArray(data.skills)) {
      errors.push(`\`'skills' must be an array, got \`${typeof data.skills}\``);
    } else {
      data.skills.forEach((entry, i) => validateSkillEntry(entry, i, errors));
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid README.md nested data:\n  ${errors.join("\n  ")}`);
  }
}

/**
 * Parse the optional `cvUrl` frontmatter field into a resolved URL.
 *
 * - HTTPS URLs are returned as-is (external PDF hosting).
 * - Relative paths (e.g. `cv.pdf`) are prefixed with `/` and resolved under
 *   the configured GitHub Pages base path via `withPublicBasePath`.
 * - Empty or undefined → `undefined` (no CV link rendered).
 */
function parseCvUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;

  // External HTTPS URL — use as-is, no rewriting
  if (/^https:\/\//i.test(trimmed)) return trimmed;

  // Local path — prefix with / so withPublicBasePath adds the base path
  return withPublicBasePath(`/${trimmed}`);
}

/**
 * Parse a raw README.md string into structured profile data.
 *
 * This is a pure function: it takes the file content (frontmatter + body)
 * and returns a `ProfileData` object. It does not read from disk, making
 * it trivially testable.
 */
export function parseProfile(content: string): ProfileData {
  const { data, content: markdownBody } = matter(content);
  validateProfileFrontmatter(data);
  validateProfileNestedData(data);

  const image =
    typeof data.image === "string" && data.image.trim() !== ""
      ? data.image
      : "profile.svg";

  const imageFilename = path.basename(image);
  const imageSrc = withPublicBasePath(`/images/${imageFilename}`);

  return {
    name: data.name as string,
    role: data.role as string,
    description:
      typeof data.description === "string"
        ? data.description.trim()
        : undefined,
    email:
      typeof data.email === "string" && data.email.trim() !== ""
        ? data.email.trim()
        : undefined,
    linkedInUrl:
      typeof data.linkedInUrl === "string" && data.linkedInUrl.trim() !== ""
        ? data.linkedInUrl.trim()
        : undefined,
    githubUrl:
      typeof data.githubUrl === "string" && data.githubUrl.trim() !== ""
        ? data.githubUrl.trim()
        : undefined,
    location: typeof data.location === "string" ? data.location : undefined,
    cvUrl: parseCvUrl(data.cvUrl),
    image,
    imageSrc,
    education: parseEducation(data.education),
    researchInterests: parseResearchInterests(data.researchInterests),
    skills: parseSkills(data.skills),
    biography: parseBiography(markdownBody),
  };
}

/** Decode HTML numeric entities (e.g. `&#128680;` → emoji) in text strings. */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
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
const PROFILE_PATH = path.join(moduleDir, "..", "md", "README.md");

/**
 * Load and parse the profile from `libs/content/src/md/README.md`.
 *
 * Must be called in a server-side context (build time for SSG, or server
 * environment). Uses `fs` to read the file from disk.
 */
export function getProfile(): ProfileData {
  if (!fs.existsSync(PROFILE_PATH)) {
    throw new Error(
      `README.md not found at ${PROFILE_PATH}. ` +
        "Create it in libs/content/src/md/README.md.",
    );
  }

  const content = fs.readFileSync(PROFILE_PATH, "utf-8");
  return parseProfile(content);
}
