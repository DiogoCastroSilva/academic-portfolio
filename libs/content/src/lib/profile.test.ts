import { describe, expect, it } from "vitest";

import { parseProfile } from "./profile.js";

const VALID_PROFILE = `---
name: "Kathleen Miller"
role: "PhD Researcher"
email: "katie@example.com"
linkedInUrl: "https://linkedin.com/in/kathleen"
githubUrl: "https://github.com/kathleen"
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
    expect(result.name).toBe("Kathleen Miller");
    expect(result.role).toBe("PhD Researcher");
    expect(result.email).toBe("katie@example.com");
    expect(result.linkedInUrl).toBe("https://linkedin.com/in/kathleen");
    expect(result.githubUrl).toBe("https://github.com/kathleen");
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
    expect(result.biography).toContain("<h2>Biography</h2>");
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
    expect(result.researchInterests[0].icon).toBe("&#128680;");
  });

  it("parses skills categories", () => {
    const result = parseProfile(VALID_PROFILE);
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].category).toBe("Programming");
    expect(result.skills[0].items).toEqual(["Python", "R"]);
  });

  it("throws when required field is missing", () => {
    const content = VALID_PROFILE.replace('name: "Kathleen Miller"\n', "");
    expect(() => parseProfile(content)).toThrow(/`name` is required/);
  });

  it("throws when required field is empty", () => {
    const content = VALID_PROFILE.replace(
      'name: "Kathleen Miller"',
      'name: ""',
    );
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
});
