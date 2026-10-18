# Content Authoring Guide

This guide explains how to add and edit projects, publications, and profile content on the portfolio site. No knowledge of React, Next.js, TypeScript, or the content-processing code is required.

## Content Locations

| Content type | Directory                        |
| ------------ | -------------------------------- |
| Profile      | `libs/content/src/md/profile.md` |
| Projects     | `libs/projects/src/md/`          |
| Publications | `libs/publications/src/md/`      |
| Blog         | `libs/blog/src/md/` (optional)   |

Each item lives in its own directory named `{slug}` containing a `README.md` file with YAML frontmatter at the top. The directory name becomes the slug (URL path) unless overridden in the frontmatter.

## File Naming

- Use lowercase letters, numbers, and hyphens only
- No spaces or special characters
- Match the directory name to the content topic
- Examples: `ml-classifier-benchmark`, `accessible-forms`, `adaptive-lr-scheduling`

To add a new entry:

1. Copy the starter template: `libs/projects/src/md/_template.md`
2. Create a directory: `libs/projects/src/md/{slug}/`
3. Paste the template as `libs/projects/src/md/{slug}/README.md`
4. Remove the `draft: true` line from the frontmatter
5. Run `npx nx run main:sync-content-assets` (or `npx nx run main:dev` which does it automatically)

## Profile Content

The About page (`/about`) and home page are driven by a profile content file containing your biography, education, research interests, skills, and contact links. All personal data lives in `libs/content/src/md/profile.md` — editing this file updates the site everywhere your name, photo, and bio appear.

### Profile Frontmatter

| Field               | Type   | Required | Description                                              |
| ------------------- | ------ | -------- | -------------------------------------------------------- |
| `title`             | string | yes      | Always `"Profile"` to identify the file type             |
| `name`              | string | yes      | Your full name (shown in page titles and NavBar)         |
| `role`              | string | yes      | Your professional title (e.g. `"PhD Researcher"`)        |
| `email`             | string | yes      | Contact email address                                    |
| `linkedInUrl`       | string | yes      | Full LinkedIn profile URL                                |
| `githubUrl`         | string | yes      | Full GitHub profile URL                                  |
| `location`          | string | no       | City, Country                                            |
| `image`             | string | no       | Filename of your profile photo (default: `profile.jpeg`) |
| `education`         | array  | no       | List of education entries (see below)                    |
| `researchInterests` | array  | no       | List of research interest entries (see below)            |
| `skills`            | array  | no       | List of skill categories (see below)                     |

### Education Entries

| Field         | Type     | Description                           |
| ------------- | -------- | ------------------------------------- |
| `degree`      | string   | Degree title (e.g. `"PhD"`)           |
| `institution` | string   | Institution name                      |
| `period`      | string   | Time period (e.g. `"2024 – Present"`) |
| `focus`       | string   | Area of focus or specialisation       |
| `details`     | string[] | List of bullet-point details          |

### Research Interest Entries

| Field         | Type   | Description                           |
| ------------- | ------ | ------------------------------------- |
| `title`       | string | Short title for the interest area     |
| `description` | string | A brief paragraph describing the work |
| `icon`        | string | _(optional)_ Emoji or HTML entity     |

### Skill Category Entries

| Field      | Type     | Description                           |
| ---------- | -------- | ------------------------------------- |
| `category` | string   | Category name (e.g. `"Data Science"`) |
| `items`    | string[] | List of individual skill names        |

### Profile Body

The body section below the frontmatter is rendered as the biography. Use standard Markdown for paragraphs, lists, and links.

```markdown
## Biography

I'm a PhD researcher passionate about leveraging Earth observation technology...
```

### Profile Photo

Place your profile photo (JPEG or PNG) in the same `src/md/` directory. It will be automatically synced to the public folder and served as a WebP-optimised image during the build.

### Getting Started (Templates)

Starter template files are provided to help you create new content quickly:

- **Project template:** `libs/projects/src/md/_template.md`
- **Publication template:** `libs/publications/src/md/_template.md`
- **Profile template:** `libs/content/src/md/_profile-template.md`

Copy the file into a new directory as `README.md` (e.g. create `libs/projects/src/md/my-project/README.md`), and remove the `draft: true` line when ready to publish. See [File Naming](#file-naming) for slug conventions.

## Biography

Write your biography here. Use standard Markdown for paragraphs, lists, and links.

### Education

- **PhD in Earth & Atmospheric Sciences**, Cornell University (2024 – Present)
- **BSc in Environmental Science**, University Name (2020 – 2024)

### Research Interests

- Hyperspectral and multispectral imagery analysis
- Machine learning for environmental monitoring
- Climate change mitigation and adaptation

### Skills

**Geospatial & Remote Sensing:** ENVI/IDL, ArcGIS, Google Earth Engine, GIS
**Data Science & Analysis:** Python, R, Machine Learning, Statistical Analysis
**Scientific Communication:** Scientific Writing, Data Visualization
**Soft Skills:** Project Management, Team Collaboration, Problem Solving

````

> **Tip:** Edit `libs/content/src/md/profile.md` to update your biography, education, research interests, and skills site-wide. Changes are reflected on both the About page and home page.

## Project Content

Projects are academic or professional work items (research projects, software, etc.).

### Required Fields

| Field   | Type   | Description                                                  |
| ------- | ------ | ------------------------------------------------------------ |
| `title` | string | Display title shown on the page and in listing cards         |
| `date`  | string | Date in `YYYY-MM-DD` format; used for sorting (newest first) |

### Optional Fields (Projects)

| Field     | Type             | Description                                                 |
| --------- | ---------------- | ----------------------------------------------------------- |
| `slug`    | string           | URL-friendly identifier; defaults to directory name |
| `tags`    | array of strings | Tags shown on cards (e.g., technologies used)               |
| `excerpt` | string           | Short summary for the project card                          |
| `team`    | string           | Team or collaborator name(s)                                |
| `image`   | string           | Cover image filename (same directory as the `README.md` file)     |
| `links`   | array of URLs    | External links (GitHub, demo, paper, etc.)                  |
| `draft`   | boolean          | Set to `true` to exclude from the listing and build         |

### Project Template

Create `libs/projects/src/md/{slug}/README.md` with this template:

```markdown
---
title: "My Project Title"
date: "2026-02-12"
tags: ["React", "TypeScript", "NASA"]
excerpt: "A brief summary for the project card."
image: project-cover.jpg
links:
  - "https://github.com/username/repo"
  - "https://project-demo.com"
team: "Your Name"
---

## Overview

Describe your project here. You can use standard Markdown formatting.

### Key Features

- Feature 1
- Feature 2

### Technical Stack

Built with React, TypeScript, and Tailwind CSS.
````

### Adding a Cover Image

Place the image file in `libs/projects/src/md/{slug}/` (same directory as the `README.md` file).
Reference it by filename in the `image` field. All images within the entry directory (including
body images referenced in Markdown) are automatically synced to the public directory.

- Recommended size: 1200x630px (16:9 aspect ratio)
- Supported formats: PNG, JPG, JPEG, WebP, GIF, SVG
- If the image is missing or the filename is wrong, a placeholder is used automatically

---

## Publication Content

Publications are academic papers, preprints, presentations, and similar works. They use a **distinct set of metadata** from projects.

### Required Fields (Publications)

| Field   | Type   | Description                                               |
| ------- | ------ | --------------------------------------------------------- |
| `title` | string | Display title shown on the page and in listing cards      |
| `date`  | string | Publication date in `YYYY-MM-DD` format; used for sorting |

### Optional Fields (Publications)

| Field      | Type             | Description                                         |
| ---------- | ---------------- | --------------------------------------------------- |
| `slug`     | string           | URL-friendly identifier; defaults to directory name |
| `tags`     | array of strings | Tags shown on cards (e.g., research areas)          |
| `excerpt`  | string           | Brief abstract for the publication card             |
| `authors`  | array of strings | List of author names                                |
| `venue`    | string           | Journal, conference, or preprint server name        |
| `doi`      | string           | Digital Object Identifier                           |
| `paperUrl` | string           | Direct URL to the paper or preprint                 |
| `image`    | string           | Cover image filename (same directory)               |
| `links`    | array of URLs    | Supplementary links (presentation, code, etc.)      |
| `draft`    | boolean          | Set to `true` to exclude from the listing           |

### Publication Template

Create `libs/publications/src/md/{slug}/README.md` with this template:

```markdown
---
title: "Research Paper Title"
date: "2024-06-10"
tags: ["Machine Learning", "Deep Learning"]
excerpt: "A brief abstract for the publication card."
authors:
  - "Katie Silva"
  - "Dr. Jane Researcher"
venue: "Nature Climate Change"
doi: "10.1038/s41558-024-01495-3"
paperUrl: "https://www.nature.com/articles/s41558-024-01495-3"
links:
  - "https://arxiv.org/abs/2406.xxxxx"
  - "https://presentation.example.com"
image: paper-cover.png
---

## Abstract

A concise abstract of your publication.

## Key Findings

- Finding 1
- Finding 2
```

---

## Markdown Figure Convention

The portfolio supports a semantic figure convention for images with optional captions. This produces properly structured `<figure>` and `<figcaption>` HTML elements with alt text.

### Single Figure

Standard Markdown with a title (in double quotes) becomes a caption:

```markdown
![Close-up of leaf lesions](lesion-detail.jpg "Figure 1. Symptoms of GLRaV-3 on grapevine leaves, showing characteristic red blotches.")
```

This renders as:

```html
<figure>
  <img src="/projects/lesion-detail.jpg" alt="Close-up of leaf lesions" />
  <figcaption>
    Figure 1. Symptoms of GLRaV-3 on grapevine leaves, showing characteristic
    red blotches.
  </figcaption>
</figure>
```

- **Alt text** (in `[]`) is recommended and used by screen readers. Make it descriptive — e.g., "Spectral plot showing wavelength vs. reflectance for vegetation indices" rather than "plot.png".
- **Alt text fallback:** When alt text is omitted but a title (caption) is provided, the title is used as the `alt` attribute value for accessibility.
- **Caption** (in `"..."`) is optional. When provided, it becomes a `<figcaption>`. When no caption is given, the alt text (if any) is used as the caption.
- **All images** are wrapped in a `<figure>` element with a `<figcaption>` when either a caption or alt text is present.
- The site respects `prefers-reduced-motion`; gallery hover effects are disabled for users who request reduced motion.

### Image Galleries

Consecutive figures (two or more images with captions) are automatically grouped into a responsive gallery:

```markdown
![Figure 1](emit-spectra.jpg "Figure 1. Spectral signatures from EMIT data.")
![Figure 2](sentinel-composite.jpg "Figure 2. Sentinel-2 false-color composite.")
```

This renders as a responsive grid of `<figure>` elements within a `<div class="gallery">` wrapper. On desktop, images display side-by-side; on mobile, they stack vertically.

### Inline HTML Images

For more control, you can also use raw HTML:

```html
<figure>
  <img src="custom-image.jpg" alt="Descriptive alt text" />
  <figcaption>Custom caption with <strong>bold</strong> text.</figcaption>
</figure>
```

> **Security note:** Raw HTML in Markdown is preserved as-is (see [ADR-0004](architecture/decisions/0004-content-validation-and-rendering.md) for the trust model). Only the repository maintainer authors content, so this is safe.

---

## Markdown Features

- Standard Markdown: headers, lists, code blocks, tables, blockquotes
- Semantic figures with captions (see Figure Convention above)
- Image galleries: multiple adjacent image lines are automatically wrapped in a responsive grid
- Raw HTML: Allowed for academic formatting when needed
- No MDX: React components cannot be embedded in Markdown content

## Image Referencing in Content Body

Within Markdown body content, images use relative paths:

```markdown
![Third image](emit.jpeg)
```

These are automatically resolved to the correct public URL with the GitHub Pages base path.

### Image Galleries

Place two or more Markdown images on consecutive lines (no blank line between them) to create an automatic gallery. The images will be rendered side-by-side in a responsive grid:

```markdown
![Caption A](image-a.jpg)
![Caption B](image-b.jpg)
![Caption C](image-c.jpg)
```

Each image is still wrapped in a `<figure>` with its own `<figcaption>`. The gallery layout is styled via CSS in `apps/main/src/app/global.css`.

### Content Image Directory

Images placed alongside Markdown files are automatically synced to the public directory during build:

```
libs/projects/src/md/
  my-project/
    README.md              <- content entry (frontmatter + Markdown body)
    my-project.jpeg        <- cover image (from `image:` field)
    screenshot.jpg         <- body image (referenced in Markdown)
```

The `sync-content-assets` tool copies all image files to `apps/main/public/{projects|publications}/` and generates WebP versions for JPEG and PNG files. This runs automatically before `build` and `dev`.

## Links in Content Body

- **External links** (starting with `http://` or `https://`): Automatically open in a new tab with `rel="noopener noreferrer"`.
- **Internal links** (starting with `/`): Rewritten to include the base path.
- **`DEPLOYMENT_URL` placeholder:** Use `[Link text](DEPLOYMENT_URL)` to link to the deployed site URL. The placeholder is replaced at build time using the `NEXT_PUBLIC_DEPLOYMENT_URL` environment variable.
- **Empty hrefs** (`href=""`): Replaced with the deployment URL.
- **Anchor links** (`#section`): Work as expected.
- **Mailto links:** Not modified.

## Draft Items

Set `draft: true` to create a placeholder entry that will not appear on the live site. This is useful for work-in-progress entries. The `draft` field is optional; items without it are published by default.

Draft items are:

- Excluded from listing pages (`getAll()`)
- Not rendered in the static build (no route generated)
- Excluded from the sitemap and robots.txt
- Excluded from Open Graph image generation
- Visible in source control for tracking progress

## Validation

- **Missing `title` or `date`:** The build fails with an error identifying the file and the missing field.
- **Invalid `date` format:** The build fails. Must be `YYYY-MM-DD` (e.g., `2025-11-01`) and must be a real calendar date (e.g., `2025-02-30` is rejected).
- **Non-string `title` or `date`:** The build fails.
- **Non-string `slug`:** The build fails.
- **Duplicate slug:** The build fails. Each entry must have a unique slug (either the directory name or the `slug` frontmatter override). Two entries with the same slug would create conflicting static routes.
- **Invalid type for optional fields** (`image`, `tags`, `links`, `authors`, `venue`, `doi`, `paperUrl`): The build fails with a message identifying the file and field.
- **Missing images:** Explicitly-specified `image:` fields that don't exist fail the build with an error identifying the file and path. Remove the `image` field or add the file to use the placeholder fallback.
- **Malformed Markdown:** Passed through by `marked` — invalid Markdown renders as plain text.
- **Raw HTML in Markdown:** Allowed for academic formatting (`<figure>`, `<b>`, `<br>`, etc.). Content is author-controlled (trusted), so no HTML sanitizer is applied. See [ADR-0004](../../architecture/decisions/0004-content-validation-and-rendering.md) for the full trust model.

### Example Error

```
Invalid frontmatter in "README.md" (entry slug: "my-project"):
  `title` is required
  `date` must be a valid calendar date in YYYY-MM-DD format, got "11/1/2025"
```

## How to Validate Content Locally

```bash
npx nx run-many -t lint test typecheck build
```

- **Invalid frontmatter** fails the `build` step with a message identifying the file and the error.
- **Missing images** — explicitly specified `image:` fields that don't exist fail the build with the file and path. Remove the field or add the file to use the placeholder.
- **Inline Markdown image references** to missing files also fail the build with the file and path.
- **Malformed Markdown** is passed through — invalid Markdown renders as plain text.

## How CI Reports Errors

The GitHub Actions workflow runs `npx nx run-many -t lint test typecheck build` on every push and pull request. If any step fails, the workflow is marked as failed and no deployment occurs. The CI log shows the file and error message for invalid frontmatter.
