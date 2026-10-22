---
# This is a TEMPLATE for the profile/biography content.
# The actual data lives in libs/content/src/md/README.md.
# Copy the structure below and replace the values.
title: "Profile"
name: "Your Name"
role: "Job Title | Specialty Area"
email: "you@example.com"
linkedInUrl: "https://www.linkedin.com/in/your-profile/"
githubUrl: "https://github.com/your-username"
location: "City, Country"
image: "profile.svg" # filename in libs/content/src/md/

# ── CV LINK (optional) ─────────────────────────────────────────────────────
# Renders a "View CV (PDF)" button on the About page. Two modes:
#
# Mode A — Repository-hosted PDF (recommended):
#   Upload the PDF to apps/main/public/cv.pdf (static assets folder),
#   then set cvUrl to the relative filename:
#     cvUrl: "cv.pdf"
#   The GitHub Pages base path (/academic-portfolio) is added automatically.
#
# Mode B — External PDF (Google Drive, university page, etc.):
#   Set cvUrl to a full HTTPS URL. Used as-is, no rewriting:
#     cvUrl: "https://your-institution.edu/~username/cv.pdf"
#   For Google Drive: share so "Anyone with the link can view", then paste
#   the direct PDF link.
#
# Remove the line (or leave empty) to hide the CV action:
#   cvUrl: ""
# ────────────────────────────────────────────────────────────────────────────
education:
  - degree: "Degree Title"
    institution: "Institution Name"
    period: "2020 – 2024"
    focus: "Area of focus"
    details:
      - "Detail 1"
      - "Detail 2"
researchInterests:
  - title: "Research Area 1"
    description: "Brief description of the research area."
    icon: "🛰️" # optional emoji
  - title: "Research Area 2"
    description: "Brief description of the research area."
skills:
  - category: "Technical Skills"
    items:
      - "Skill 1"
      - "Skill 2"
  - category: "Soft Skills"
    items:
      - "Skill 1"
      - "Skill 2"
---

## Biography

Write your biography here in Markdown. This text appears on the About page.

You can use standard Markdown: **bold**, _italic_, links, lists, images.

![Portrait photo](profile.svg)

## External Links

- [Google Scholar](https://scholar.google.com/citations?user=xxxxx)

> **Note:** To add a CV link, use the `cvUrl` frontmatter field (see the commented
> instructions above the `education:` section). Do not use `DEPLOYMENT_URL` for
> CV links — that placeholder resolves to the site homepage, not a PDF.
