# Content Authoring Guide

This guide explains how to add and edit projects and publications on the portfolio site. No knowledge of React, Next.js, TypeScript, or the content-processing code is required.

## Content Locations

| Content type | Directory                   |
| ------------ | --------------------------- |
| Projects     | `libs/projects/src/md/`     |
| Publications | `libs/publications/src/md/` |

Each item is a single `.md` file with YAML frontmatter at the top. The filename becomes the slug (URL path) unless overridden in the frontmatter.

## File Naming

- Use lowercase letters, numbers, and hyphens only
- No spaces or special characters
- Match the filename to the content topic
- Examples: `ml-classifier-benchmark`, `accessible-forms`, `adaptive-lr-scheduling`

## Frontmatter Fields

### Required fields (all content types)

| Field   | Type   | Description                                                  |
| ------- | ------ | ------------------------------------------------------------ |
| `title` | string | Display title shown on the page and in listing cards         |
| `date`  | string | Date in `YYYY-MM-DD` format; used for sorting (newest first) |

### Optional fields

| Field     | Type             | Description                                                 |
| --------- | ---------------- | ----------------------------------------------------------- |
| `slug`    | string           | URL-friendly identifier; defaults to filename without `.md` |
| `tags`    | array of strings | Tags shown on cards (e.g., technologies used)               |
| `excerpt` | string           | Short summary shown on listing cards                        |
| `team`    | string           | Author or team name(s)                                      |
| `image`   | string           | Cover image filename (same directory as the `.md` file)     |
| `links`   | array of URLs    | External links (GitHub, paper, demo, etc.)                  |
| `draft`   | boolean          | Set to `true` to exclude from the listing and build         |

### Draft items

Set `draft: true` to create a placeholder project that will not appear on the live site. This is useful for work-in-progress entries. The `draft` field is optional; items without it are published by default.

### Validation

- **Missing `title` or `date`:** The build fails with an error identifying the file and the missing field.
- **Invalid `date` format:** The build fails. Must be `YYYY-MM-DD` (e.g., `2025-11-01`).
- **Non-string `title` or `date`:** The build fails.
- **Missing `image` or invalid `image` filename:** A placeholder image is shown instead.

## Adding a Project

### Step 1: Create the Markdown file

Create `libs/projects/src/md/{slug}.md` with this template:

```markdown
---
title: "My Project Title"
date: "2026-02-12"
tags: ["React", "TypeScript", "NASA"]
excerpt: "A brief summary for the project card."
image: project-cover.png
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
```

### Step 2: Add a cover image (optional)

Place the image file in `libs/projects/src/md/` (same directory as the `.md` file).
Reference it by filename in the `image` field.

- Recommended size: 1200×630px (16:9 aspect ratio)
- Supported formats: PNG, JPG, JPEG, WebP, GIF, SVG
- If the image is missing or the filename is wrong, a placeholder is used automatically

### Step 3: Sync content assets

```bash
npx nx run main:sync-content-assets
```

This copies images from `libs/projects/src/md/` to `apps/main/public/projects/`.
The dev server (`npx nx run main:dev`) and build (`npx nx build main`) do this automatically.

### Step 4: Verify

```bash
npx nx run main:dev
```

Visit `http://localhost:3000/projects/{slug}/` to verify your project renders correctly.

## Adding a Publication

Publications follow the same structure. Create `libs/publications/src/md/{slug}.md`:

```markdown
---
title: "Research Paper Title"
date: "2024-06-10"
tags: ["Machine Learning", "Deep Learning"]
excerpt: "A brief abstract for the publication card."
team: "Katie Silva, Dr. Jane Researcher"
links:
  - "https://arxiv.org/abs/2406.xxxxx"
  - "https://doi.org/10.48550/arXiv.2406.xxxxx"
---

## Abstract

A concise abstract of your publication.

## Key Findings

- Finding 1
- Finding 2
```

## Markdown Features

- Standard Markdown: headers, lists, code blocks, tables, blockquotes
- Raw HTML: Allowed for academic formatting (e.g., `<figure>`, `<b>`, `<br>`, custom div layouts)
- No MDX: React components cannot be embedded in Markdown content

## Image Referencing in Content Body

Within Markdown body content, images use relative paths:

```markdown
![Third image](emit.jpeg)
```

These are automatically resolved to the correct public URL with the GitHub Pages base path.

Inline HTML images also work:

```html
<img src="test-emit.jpeg" alt="Alt text" class="w-full rounded" />
```

## Links in Content Body

- **External links** (starting with `http://` or `https://`): Automatically open in a new tab with `rel="noopener noreferrer"`.
- **Internal links** (starting with `/`): Rewritten to include the base path.
- **`DEPLOYMENT_URL` placeholder:** Use `[Link text](DEPLOYMENT_URL)` to link to the deployed site URL (useful for author homepages). The placeholder is replaced at build time using the `NEXT_PUBLIC_DEPLOYMENT_URL` environment variable.
- **Empty hrefs** (`href=""`): Replaced with the deployment URL.
- **Anchor links** (`#section`): Work as expected.
- **Mailto links:** Not modified.

## How to Validate Content Locally

```bash
npx nx run-many -t lint test typecheck build
```

- **Invalid frontmatter** fails the `typecheck` or `build` step with a message like:
  ```
  Invalid frontmatter in "my-project.md":
    `title` is required
  ```
- **Missing images** are silently replaced with a placeholder — no build failure.
- **Malformed Markdown** is passed through by `marked` — invalid Markdown renders as plain text.

## How CI Reports Errors

The GitHub Actions workflow runs `npx nx run-many -t lint test typecheck build` on every push and pull request. If any step fails, the workflow is marked as failed and no deployment occurs. The CI log shows the file and error message for invalid frontmatter.
