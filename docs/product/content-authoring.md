# Content Authoring Guide

This guide explains how to add and edit projects, publications, and profile content on the portfolio site. No knowledge of React, Next.js, TypeScript, or the content-processing code is required.

## Quick Reference — Task-to-File Mapping

Every personal or site-level change maps to a specific file or directory. Edit Markdown for content; the only configuration file you may need is `site-config.ts` for advanced settings.

| Want to…                                                   | Edit                                        | Field(s) / detail                                                                               |
| ---------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Change your name (shown in titles and NavBar)              | `libs/content/src/md/profile.md`            | `name` (required)                                                                               |
| Change your professional title / role                      | `libs/content/src/md/profile.md`            | `role` (required)                                                                               |
| Change the SEO description (search/social previews)        | `libs/content/src/md/profile.md`            | `description` (optional)                                                                        |
| Change your location (shown in structured data)            | `libs/content/src/md/profile.md`            | `location` (optional)                                                                           |
| Change your profile photo                                  | `libs/content/src/md/profile.md`            | `image` (optional; default `profile.svg`)                                                       |
| Add/remove your email, LinkedIn, or GitHub                 | `libs/content/src/md/profile.md`            | `email`, `linkedInUrl`, `githubUrl` (all optional)                                              |
| Add or change your CV link                                 | `libs/content/src/md/profile.md`            | `cvUrl` (optional; see [CV Link](#cv-link))                                                     |
| Update your biography text                                 | `libs/content/src/md/profile.md`            | Markdown body after frontmatter                                                                 |
| Add/edit education entries                                 | `libs/content/src/md/profile.md`            | `education` array (see [Education Entries](#education-entries))                                 |
| Add/edit research interests                                | `libs/content/src/md/profile.md`            | `researchInterests` array                                                                       |
| Add/edit skills                                            | `libs/content/src/md/profile.md`            | `skills` array (see [Skill Category Entries](#skill-category-entries))                          |
| Add a project                                              | `libs/projects/src/md/{slug}/README.md`     | See [Project Content](#project-content)                                                         |
| Add a publication                                          | `libs/publications/src/md/{slug}/README.md` | See [Publication Content](#publication-content)                                                 |
| Add a blog post                                            | `libs/blog/src/md/{slug}/README.md`         | Same frontmatter rules as projects                                                              |
| Draft/unpublish an entry                                   | Any `README.md` in a content directory      | `draft: true` (remove to publish)                                                               |
| Change the site title suffix (appended to all page titles) | **No edit needed**                          | Derived from `profile.name` automatically                                                       |
| Enable/disable Cloudflare Analytics                        | `apps/main/src/configs/site-config.ts`      | `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` / `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_DISABLED` env vars |
| Change the deployment URL / base path (GitHub Pages)       | **No edit needed**                          | Derived automatically from repository name in CI                                                |

> **Note on profile vs. collection content:** Projects, publications, and blog entries use a `{slug}/README.md` directory pattern because they form **collections** — each entry is a directory with a slug, and entries are added or removed independently. The profile is a **singleton**: there is exactly one profile per site, so it lives as a single file at `libs/content/src/md/profile.md` rather than a `profile/README.md` directory. This avoids creating a one-element directory and keeps the profile's image (`profile.svg`) and template in the same `md/` folder alongside it. The content sync tool (`tools/sync-content-assets.mjs`) treats `libs/content/src/md/` as a flat image source, separate from the collection directories that mirror to `public/{collection}/{slug}/`. |

## Site Configuration

Site configuration lives in `apps/main/src/configs/site-config.ts`. Most fields are read from `profile.md` at build time so you do not need to edit this file for routine changes. The file also exposes:

| Setting                             | Source                                        | Description                                                                                  |
| ----------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `name`, `role`, `description`       | `profile.md` frontmatter                      | Displayed in titles, OG metadata, and JSON-LD                                                |
| `email`, `linkedInUrl`, `githubUrl` | `profile.md` frontmatter                      | Rendered in footer and Person schema (omitted when absent)                                   |
| `contentLicense`                    | Hardcoded (CC BY-NC-ND 4.0)                   | License for sample content (see [ADR-0007](architecture/decisions/0007-licensing-policy.md)) |
| `deploymentUrl`                     | `NEXT_PUBLIC_DEPLOYMENT_URL`                  | Set by CI from the repository name; can be set for local builds                              |
| `analytics`                         | `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_*` env vars | Disabled by default; set a token to enable                                                   |

## Content Locations

| Content type | Directory                        |
| ------------ | -------------------------------- |
| Profile      | `libs/content/src/md/profile.md` |
| Projects     | `libs/projects/src/md/`          |
| Publications | `libs/publications/src/md/`      |
| Blog         | `libs/blog/src/md/` (optional)   |

Each item lives in its own directory named `{slug}` containing a `README.md` file with YAML frontmatter at the top. The directory name is the authoritative slug (URL path). Frontmatter `slug` is accepted but ignored for routing.

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

| Field               | Type   | Required | Description                                                                        |
| ------------------- | ------ | -------- | ---------------------------------------------------------------------------------- |
| `title`             | string | yes      | Always `"Profile"` to identify the file type                                       |
| `name`              | string | yes      | Your full name (shown in page titles and NavBar)                                   |
| `role`              | string | yes      | Your professional title (e.g. `"PhD Researcher"`)                                  |
| `description`       | string | no       | Concise SEO description for the site (shown in search results and social previews) |
| `email`             | string | no       | Contact email address                                                              |
| `linkedInUrl`       | string | no       | Full LinkedIn profile URL                                                          |
| `githubUrl`         | string | no       | Full GitHub profile URL                                                            |
| `location`          | string | no       | City, Country                                                                      |
| `image`             | string | no       | Filename of your profile photo (default: `profile.svg`)                            |
| `cvUrl`             | string | no       | CV link — see [CV Link](#cv-link)                                                  |
| `education`         | array  | no       | List of education entries (see below)                                              |
| `researchInterests` | array  | no       | List of research interest entries (see below)                                      |
| `skills`            | array  | no       | List of skill categories (see below)                                               |

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

Place your profile photo (JPEG or PNG) in the same `src/md/` directory as
`profile.svg`. It will be automatically synced to the public folder and served
as a WebP-optimised image during the build.

The default `profile.svg` is **identity-neutral** — it displays the initial "A"
inside a circle with the label "Portfolio" below. This is safe to ship as a
starter template. If you prefer initials matching your name, edit both:

- `libs/content/src/md/profile.svg` (used for OG images)
- `apps/main/public/images/profile.svg` (used for the rendered About page)

### CV Link

You can optionally add a "View CV (PDF)" button that appears on the About page next to your contact information. This is controlled by the `cvUrl` field in `profile.md` frontmatter.

Two modes are supported. **You only need to edit `profile.md`** — no TypeScript or build configuration changes required.

#### Mode A — Repository-hosted PDF (recommended)

Host the PDF directly in the repository. It is deployed alongside your site and accessible under your GitHub Pages base path.

1. **Upload your PDF** to `apps/main/public/cv.pdf`. In GitHub:
   - Go to `apps/main/public/`
   - Click **Add file → Upload files**
   - Drag and drop your `cv.pdf`
   - Commit directly to `main`

2. **Set `cvUrl`** in `profile.md` frontmatter to just the filename:

   ```yaml
   cvUrl: "cv.pdf"
   ```

   The GitHub Pages base path (e.g. `/academic-portfolio`) is added automatically. No need to include it.

To replace the PDF later, simply repeat the upload step — the same path (`apps/main/public/cv.pdf`) is overwritten. Then re-deploy the site.

#### Mode B — External PDF URL

Link to a PDF hosted by Google Drive, your university, or another provider.

1. **Set `cvUrl`** in `profile.md` frontmatter to the full HTTPS URL:

   ```yaml
   cvUrl: "https://your-institution.edu/~username/cv.pdf"
   ```

   The URL is used exactly as written — no rewriting is applied.

   For Google Drive: open the file, click **Share → Get link**, set permissions to **"Anyone with the link can view"** (not "restricted" or "institutional login required"), copy the link, and use the direct PDF view URL. The file must be accessible to visitors without signing in.

#### Removing the CV link

To hide the CV button, either remove the `cvUrl` line from `profile.md` or set it to an empty string:

```yaml
cvUrl: ""
```

#### Validation rules

- `cvUrl` must be a string (or omitted/empty).
- External URLs must use `https://` (not `http://`, `ftp://`, `file://`, etc.).
- Protocol-relative URLs (`//example.com/...`) are rejected.
- Local paths must be relative (e.g. `cv.pdf` or `files/cv.pdf`) — no leading `/`.
- Local paths must not contain `..` (path traversal protection).
- Invalid values cause the build to fail with an actionable error message.

### Getting Started (Templates)

Starter template files are provided to help you create new content quickly:

- **Project template:** `libs/projects/src/md/_template.md`
- **Publication template:** `libs/publications/src/md/_template.md`
- **Profile template:** `libs/content/src/md/_profile-template.md`

Copy the file into a new directory as `README.md` (e.g. create `libs/projects/src/md/my-project/README.md`), and remove the `draft: true` line when ready to publish. See [File Naming](#file-naming) for slug conventions.

## Biography

Write your biography here. Use standard Markdown for paragraphs, lists, and links.

### Education

- **PhD in Earth & Atmospheric Sciences**, Green Mountain University (2024 – Present)
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
| `slug`    | string           | Accepted but ignored; directory name is authoritative |
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
tags: ["React", "TypeScript", "Remote Sensing"]
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
- SVG images are copied as-is (no WebP conversion or resizing); raster formats are resized to 1200px width and converted to WebP during sync
- If the image is missing or the filename is wrong, a placeholder is used automatically

#### Image Sourcing and Licensing

- **Use your own images** or images you have permission to use. The template does
  not include any third-party image stock libraries.
- **Sample content images** (`libs/projects/src/md/first-project/`,
  `libs/publications/src/md/`, `libs/blog/src/md/`) are provided under
  CC BY-NC-ND 4.0 and are synthetic/purpose-made illustrations — they do **not**
  contain real satellite imagery, photographs of real field sites, or
  institutional logos. See [ADR-0007](architecture/decisions/0007-licensing-policy.md)
  for the full licensing policy.
- **SVG illustrations** are preferred for diagrams, charts, and abstract
  visualizations — they scale cleanly, load instantly, and have tiny file
  sizes with no WebP conversion needed. The sample project uses SVG
  illustrations exclusively for this reason.
- **Alt text** is required for all images (see [Image Referencing](#image-referencing-in-content-body)).
  Describe what the image actually depicts — not just "figure 1" or "plot".

---

## Publication Content

Publications are academic papers, preprints, presentations, and similar works. They use a **distinct set of metadata** from projects.

### Required Fields (Publications)

| Field   | Type   | Description                                               |
| ------- | ------ | --------------------------------------------------------- |
| `title` | string | Display title shown on the page and in listing cards      |
| `date`  | string | Publication date in `YYYY-MM-DD` format; used for sorting |

### Optional Fields (Publications)

| Field      | Type             | Description                                           |
| ---------- | ---------------- | ----------------------------------------------------- |
| `slug`     | string           | Accepted but ignored; directory name is authoritative |
| `tags`     | array of strings | Tags shown on cards (e.g., research areas)            |
| `excerpt`  | string           | Brief abstract for the publication card               |
| `authors`  | array of strings | List of author names                                  |
| `venue`    | string           | Journal, conference, or preprint server name          |
| `doi`      | string           | Digital Object Identifier                             |
| `paperUrl` | string           | Direct URL to the paper or preprint                   |
| `image`    | string           | Cover image filename (same directory)                 |
| `links`    | array of URLs    | Supplementary links (presentation, code, etc.)        |
| `draft`    | boolean          | Set to `true` to exclude from the listing             |

### Publication Template

Create `libs/publications/src/md/{slug}/README.md` with this template:

```markdown
---
title: "Research Paper Title"
date: "2024-06-10"
tags: ["Machine Learning", "Deep Learning"]
excerpt: "A brief abstract for the publication card."
authors:
  - "Dr. Sam Carter"
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

- Excluded from listing pages (`getAll()`), detail lookups (`getBySlug()`, `getContentBySlug()`)
- Not rendered in the static build (no route generated)
- Excluded from the sitemap and robots.txt
- Excluded from Open Graph image generation
- Visible in source control for tracking progress

## Validation

- **Missing `title` or `date`:** The build fails with an error identifying the file and the missing field.
- **Invalid `date` format:** The build fails. Must be `YYYY-MM-DD` (e.g., `2025-11-01`) and must be a real calendar date (e.g., `2025-02-30` is rejected).
- **Non-string `title` or `date`:** The build fails.
- **Non-string `slug`:** The build fails.
- **Duplicate slug:** The build fails. Each entry must have a unique slug (the directory name). Frontmatter `slug` is accepted but ignored.
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
