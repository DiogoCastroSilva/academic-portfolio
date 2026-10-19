import { describe, expect, it } from "vitest";

import { parseProfile, validateProfileNestedData } from "./profile.js";

const VALID_PROFILE = `---
name: "Dr. Jane Doe"
role: "PhD Researcher"
email: "jane@example.com"
linkedInUrl: "https://linkedin.com/in/jane"
githubUrl: "https://github.com/jane"
location: "Ithaca, NY"
image: "profile.jpeg"
education:
  - degree: "PhD"
    institution: "Cornell"
    period: "2024 – Present"
    focus: "Remote sensing"
    details:
      - "Item 1"
      - "Item 2"
researchInterests:
  - title: "Satellites"
    description: "EO data analysis"
    icon: "&#128680;"
skills:
  - category: "Programming"
    items: ["Python", "R"]
---

## Biography

This is the biography content.`;

describe("parseProfile", () => {
  it("parses required frontmatter fields", () => {
    const result = parseProfile(VALID_PROFILE);
    expect(result.name).toBe("Dr. Jane Doe");
    expect(result.role).toBe("PhD Researcher");
    expect(result.email).toBe("jane@example.com");
    expect(result.linkedInUrl).toBe("https://linkedin.com/in/jane");
    expect(result.githubUrl).toBe("https://github.com/jane");
  });

  it("parses optional fields", () => {
    const result = parseProfile(VALID_PROFILE);
    expect(result.location).toBe("Ithaca, NY");
    expect(result.image).toBe("profile.jpeg");
    expect(result.imageSrc).toBe("/images/profile.jpeg");
  });

  it("defaults image to profile.jpeg when not provided", () => {
    const content = VALID_PROFILE.replace(/image: "profile\.jpeg"/, "");
    const result = parseProfile(content);
    expect(result.image).toBe("profile.jpeg");
    expect(result.imageSrc).toBe("/images/profile.jpeg");
  });

  it("uses basename of image path for imageSrc", () => {
    const content = VALID_PROFILE.replace(
      'image: "profile.jpeg"',
      'image: "some/nested/profile.jpeg"',
    );
    const result = parseProfile(content);
    expect(result.imageSrc).toBe("/images/profile.jpeg");
  });

  it("renders biography as HTML", () => {
    const result = parseProfile(VALID_PROFILE);
    expect(result.biography).toContain("<h3>Biography</h3>");
    expect(result.biography).toContain("This is the biography content.");
    expect(result.biography).toContain("<p>");
  });

  it("parses education entries", () => {
    const result = parseProfile(VALID_PROFILE);
    expect(result.education).toHaveLength(1);
    expect(result.education[0].degree).toBe("PhD");
    expect(result.education[0].institution).toBe("Cornell");
    expect(result.education[0].period).toBe("2024 – Present");
    expect(result.education[0].focus).toBe("Remote sensing");
    expect(result.education[0].details).toEqual(["Item 1", "Item 2"]);
  });

  it("parses research interests", () => {
    const result = parseProfile(VALID_PROFILE);
    expect(result.researchInterests).toHaveLength(1);
    expect(result.researchInterests[0].title).toBe("Satellites");
    expect(result.researchInterests[0].description).toBe("EO data analysis");
    expect(result.researchInterests[0].icon).toBe("🚨");
  });

  it("decodes HTML entity icons to unicode", () => {
    const content = VALID_PROFILE.replace(
      'icon: "&#128680;"',
      'icon: "&#128680;"',
    );
    const result = parseProfile(content);
    expect(result.researchInterests[0].icon).toBe("🚨");
  });

  it("preserves unicode icon characters", () => {
    const content = VALID_PROFILE.replace('icon: "&#128680;"', 'icon: "🛰️"');
    const result = parseProfile(content);
    expect(result.researchInterests[0].icon).toBe("🛰️");
  });

  it("parses skills categories", () => {
    const result = parseProfile(VALID_PROFILE);
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].category).toBe("Programming");
    expect(result.skills[0].items).toEqual(["Python", "R"]);
  });

  it("throws when required field is missing", () => {
    const content = VALID_PROFILE.replace('name: "Dr. Jane Doe"\n', "");
    expect(() => parseProfile(content)).toThrow(/`name` is required/);
  });

  it("throws when required field is empty", () => {
    const content = VALID_PROFILE.replace('name: "Dr. Jane Doe"', 'name: ""');
    expect(() => parseProfile(content)).toThrow(/`name` is required/);
  });

  it("handles empty education, researchInterests, and skills arrays", () => {
    const content = VALID_PROFILE.replace(/education:[\s\S]*?(?=\n[a-z])/m, "");
    const result = parseProfile(content);
    expect(result.education).toEqual([]);
  });

  it("returns all expected fields on ProfileData", () => {
    const result = parseProfile(VALID_PROFILE);
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("role");
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("linkedInUrl");
    expect(result).toHaveProperty("githubUrl");
    expect(result).toHaveProperty("location");
    expect(result).toHaveProperty("image");
    expect(result).toHaveProperty("imageSrc");
    expect(result).toHaveProperty("education");
    expect(result).toHaveProperty("researchInterests");
    expect(result).toHaveProperty("skills");
    expect(result).toHaveProperty("biography");
  });

  // ---------------------------------------------------------------------------
  // Nested collection validation tests (Phase 3)
  // ---------------------------------------------------------------------------

  it("validateProfileNestedData passes when collections are absent", () => {
    expect(() => validateProfileNestedData({})).not.toThrow();
  });

  it("validateProfileNestedData passes when collections are undefined", () => {
    expect(() =>
      validateProfileNestedData({
        education: undefined,
        researchInterests: undefined,
        skills: undefined,
      }),
    ).not.toThrow();
  });

  it("throws when education is not an array", () => {
    const content = VALID_PROFILE.replace(
      /education:[\s\S]*?(?=\nresearchInterests)/,
      'education: "not-an-array"\n',
    );
    expect(() => parseProfile(content)).toThrow(
      /`'education' must be an array/,
    );
  });

  it("throws when education entry is not an object", () => {
    const content = VALID_PROFILE.replace(
      /education:[\s\S]*?(?=\nresearchInterests)/,
      'education:\n  - "not-an-object"\n',
    );
    expect(() => parseProfile(content)).toThrow(
      /`'education\[0\]' must be an object/,
    );
  });

  it("throws when education entry has non-string degree", () => {
    const content = VALID_PROFILE.replace('degree: "PhD"', "degree: 123");
    expect(() => parseProfile(content)).toThrow(
      /`'education\[0\].degree' must be a non-empty string/,
    );
  });

  it("throws when education entry has empty degree", () => {
    const content = VALID_PROFILE.replace('degree: "PhD"', 'degree: ""');
    expect(() => parseProfile(content)).toThrow(
      /`'education\[0\].degree' must be a non-empty string/,
    );
  });

  it("throws when education details is not an array", () => {
    const content = VALID_PROFILE.replace(
      /details:\n\s+- "Item 1"\n\s+- "Item 2"/,
      'details: "not-an-array"',
    );
    expect(() => parseProfile(content)).toThrow(
      /`'education\[0\].details' must be an array/,
    );
  });

  it("throws when education detail item is not a string", () => {
    const content = VALID_PROFILE.replace('- "Item 1"', "- 42");
    expect(() => parseProfile(content)).toThrow(
      /`'education\[0\].details\[0\]' must be a string/,
    );
  });

  it("throws when researchInterests is not an array", () => {
    const content = VALID_PROFILE.replace(
      /researchInterests:[\s\S]*?(?=\nskills)/,
      'researchInterests: "not-an-array"\n',
    );
    expect(() => parseProfile(content)).toThrow(
      /`'researchInterests' must be an array/,
    );
  });

  it("throws when researchInterest entry is not an object", () => {
    const content = VALID_PROFILE.replace(
      /researchInterests:[\s\S]*?(?=\nskills)/,
      'researchInterests:\n  - "bare-string"\n',
    );
    expect(() => parseProfile(content)).toThrow(
      /`'researchInterests\[0\]' must be an object/,
    );
  });

  it("throws when researchInterest entry has non-string title", () => {
    const content = VALID_PROFILE.replace('title: "Satellites"', "title: 123");
    expect(() => parseProfile(content)).toThrow(
      /`'researchInterests\[0\].title' must be a non-empty string/,
    );
  });

  it("throws when researchInterest icon is not a string", () => {
    const content = VALID_PROFILE.replace('icon: "&#128680;"', "icon: 123");
    expect(() => parseProfile(content)).toThrow(
      /`'researchInterests\[0\].icon' must be a string or undefined/,
    );
  });

  it("throws when skills is not an array", () => {
    const content = VALID_PROFILE.replace(
      /skills:[\s\S]*?(?=\n---)/,
      'skills: "not-an-array"\n',
    );
    expect(() => parseProfile(content)).toThrow(/`'skills' must be an array/);
  });

  it("throws when skill entry is not an object", () => {
    const content = VALID_PROFILE.replace(
      /skills:[\s\S]*?(?=\n---)/,
      "skills:\n  - 42\n",
    );
    expect(() => parseProfile(content)).toThrow(
      /`'skills\[0\]' must be an object/,
    );
  });

  it("throws when skill category is not a string", () => {
    const content = VALID_PROFILE.replace(
      'category: "Programming"',
      "category: 123",
    );
    expect(() => parseProfile(content)).toThrow(
      /`'skills\[0\].category' must be a non-empty string/,
    );
  });

  it("throws when skill category is empty", () => {
    const content = VALID_PROFILE.replace(
      'category: "Programming"',
      'category: ""',
    );
    expect(() => parseProfile(content)).toThrow(
      /`'skills\[0\].category' must be a non-empty string/,
    );
  });

  it("throws when skill item is not a string", () => {
    const content = VALID_PROFILE.replace(
      'items: ["Python", "R"]',
      'items: ["Python", 42]',
    );
    expect(() => parseProfile(content)).toThrow(
      /`'skills\[0\].items\[1\]' must be a string/,
    );
  });

  it("collects multiple validation errors in a single throw", () => {
    const content = VALID_PROFILE.replace('degree: "PhD"', "degree: 123")
      .replace('title: "Satellites"', "title: 456")
      .replace('category: "Programming"', "category: 789");
    let errorMsg = "";
    try {
      parseProfile(content);
    } catch (e) {
      errorMsg = (e as Error).message;
    }
    expect(errorMsg).toMatch(/Invalid profile\.md nested data/);
    expect(errorMsg).toContain("degree");
    expect(errorMsg).toContain("title");
    expect(errorMsg).toContain("category");
  });
});
