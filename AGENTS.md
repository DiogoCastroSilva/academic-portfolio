<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

# CI Error Guidelines

If the user wants help with fixing an error in their CI pipeline, use the following flow:

- Retrieve the list of current CI Pipeline Executions (CIPEs) using the `nx_cloud_cipe_details` tool
- If there are any errors, use the `nx_cloud_fix_cipe_failure` tool to retrieve the logs for a specific task
- Use the task logs to see what's wrong and help the user fix their problem. Use the appropriate tools if necessary
- Make sure that the problem is fixed by running the task that you passed into the `nx_cloud_fix_cipe_failure` tool

<!-- nx configuration end-->

---

# Katie Portfolio — Project-Specific Guidelines

## Project Overview

**Katie Portfolio** is a personal portfolio website built as an Nx monorepo using Next.js (App Router) with markdown-based content powered by `marked`.

### Environment Requirements

- **Node.js**: >= 20.9.0
- **Package Manager**: npm (workspaces configured)
- **License**: MIT (code & structure); content copyright is proprietary

## Project Structure

### Applications

- **`apps/main`** — The main Next.js application (App Router). Outputs to `public/` for GitHub Pages deployment.

### Libraries (Shared Code)

- **`libs/content`** — Content library abstraction for loading and parsing markdown files with frontmatter. Exports `createContentLibrary()` and types.
- **`libs/projects`** — Portfolio projects content. Markdown files in `libs/projects/src/md/`. Exports `getAllProjects`, `getProjectBySlug`, `getProjectContentBySlug`.
- **`libs/publications`** — Publications content (TBD). Similar structure to projects library.
- **`libs/navigation`** — Site navigation configuration. Exports navigation items and `NavBar` component.
- **`libs/utils`** — Shared utility functions.

## Technology Stack

- **Framework**: Next.js 16.4.2 (App Router, static export for GitHub Pages)
- **UI**: React 19, Motion (animations)
- **Content**: Markdown with JSX support (via `marked`), frontmatter parsing
- **Styling**: Tailwind CSS 4.2, PostCSS, Autoprefixer
- **Build System**: Nx 22.6.5 with plugins (@nx/js, @nx/next, @nx/react, @nx/vite, @nx/vitest)
- **Testing**: Vitest 4.1 (vitest workspace)
- **Linting**: ESLint 9 with TypeScript, Next.js, import, and jsx-a11y plugins
- **Code Formatting**: Prettier 3 with Tailwind CSS plugin

## Content System

### Markdown-Based Content

Content items are stored as markdown files with YAML frontmatter:

- **Location**: `libs/{projects|publications}/src/md/`
- **Structure**: Each markdown file can have a co-located cover image (referenced in frontmatter `image` field)
- **Frontmatter Fields**:
  ```yaml
  slug: unique-identifier
  title: Display Title
  date: YYYY-MM-DD
  tags: [tag1, tag2] # Optional
  excerpt: Short description # Optional
  team: Author or Team name # Optional
  links: [url1, url2] # Optional (paper, presentation, etc.)
  image: cover-image.png # Optional (same folder as .md file)
  ```

### Content Library API

The `createContentLibrary()` function creates a content loader with:

- `getAll()` — Returns all content items sorted by date (newest first)
- `getBySlug(slug)` — Returns metadata for a single item
- `getContentBySlug(slug)` — Returns full content (markdown + metadata)

Example:

```typescript
const projects = createContentLibrary({
  mdDir: "libs/projects/src/md",
  publicPrefix: "/projects",
  placeholderFilename: "project-placeholder.svg",
});
```

### Asset Management

Cover images must be synced to the Next.js public directory:

- **Sync Target**: `npx nx run main:sync-content-assets`
- **Destination**: Images copied to `apps/main/public/{projects,publications}/`
- **Automation**: Runs automatically before `main:dev` and `main:build`
- **Tool**: `tools/sync-content-assets.mjs` (Node script in workspace root)
- **Fallback**: If image not found, uses placeholder (`project-placeholder.svg`)

## Common Nx Tasks

### Development

```bash
# Start dev server (with auto asset sync)
npx nx run main:dev

# Run tests
npx nx test

# Lint code
npx nx lint

# Format code
npx nx format:write
```

### Production

```bash
# Build (with auto asset sync)
npx nx run main:build

# Serve static output
npx nx run main:serve-static
```

### Utility Tasks

```bash
# Manual content asset sync
npx nx run main:sync-content-assets

# Show all targets for a project
npx nx show project main

# Visualize workspace
npx nx graph
```

## Next.js Configuration Details

- **Output Mode**: Static export (`output: 'export'`) for GitHub Pages
- **Build Output**: `distDir: '../../public'` (relative to app root)
- **Transpile Packages**: Content libraries are transpiled from source
  ```javascript
  transpilePackages: [
    "@katie-portfolio/content",
    "@katie-portfolio/projects",
    "@katie-portfolio/publications",
    "@katie-portfolio/navigation",
  ];
  ```
- **Page Extensions**: Supports `.ts`, `.tsx`, `.md`
- **Images**: Unoptimized (GitHub Pages compatible), SVG support enabled
- **Routing**: Trailing slashes enabled for GitHub Pages compatibility
- **Turbopack**: Configured with workspace root

## Key Navigation Routes

Defined in `libs/navigation/src/lib/feature/config.ts`:

- `/projects` — Portfolio projects listing
- `/publications` — Publications listing
- `/about` — About page

## TypeScript Path Mappings

Imports use Nx path aliases (configured in `tsconfig.base.json`):

```typescript
import { createContentLibrary } from "@katie-portfolio/content";
import { getAllProjects } from "@katie-portfolio/projects";
import { NavBar } from "@katie-portfolio/navigation";
```

Ensure all library exports point to `src/index.ts` files for proper resolution.

## Troubleshooting Tips

- **Image 404s**: Run `npx nx run main:sync-content-assets` to sync assets from libs to public folder
- **Import errors**: Verify path mappings in `tsconfig.base.json` point to library `src/index.ts`
- **Profile photo**: Located at `apps/main/src/assets/profile.jpeg` (update `AboutSection` component if changed)
- **Build output location**: Check `apps/main/next.config.js` for output paths (currently `public/` for GitHub Pages)

## Content Workflow

### Creating New Projects

#### Step-by-Step Guide

1. **Create the markdown file**:
   - Location: `libs/projects/src/md/{slug}.md`
   - `{slug}` should be a URL-friendly identifier (e.g., `my-awesome-project`, `neural-network-classifier`)

2. **Add YAML frontmatter** at the top of the file:

   ```yaml
   ---
   slug: my-awesome-project
   title: My Awesome Project
   date: 2024-06-10
   excerpt: A brief description of what this project is about
   tags: [React, TypeScript, Web Development]
   team: Your Name
   image: project-cover.png
   links:
     - https://github.com/yourrepo/project
     - https://project-demo.com
   ---
   ```

3. **Add your project description** in markdown/MDX format below the frontmatter:

   ```markdown
   ## Overview

   This is where you describe your project in detail. You can use standard markdown formatting.

   ### Key Features

   - Feature 1
   - Feature 2
   - Feature 3

   ### Technical Stack

   Built with React, TypeScript, and Tailwind CSS...
   ```

4. **Add a cover image** (optional):
   - Place the image file in `libs/projects/src/md/` (same directory as the markdown file)
   - Name it as referenced in the frontmatter `image` field (e.g., `project-cover.png`)
   - Supported formats: PNG, JPG, JPEG, WebP, SVG
   - Recommended size: 1200x630px (16:9 aspect ratio)

5. **Sync content assets**:
   ```bash
   npx nx run main:sync-content-assets
   ```
   This copies your images from `libs/projects/src/md/` to `apps/main/public/projects/`

#### Frontmatter Reference (Projects)

| Field     | Required | Type   | Description                                  |
| --------- | -------- | ------ | -------------------------------------------- |
| `slug`    | Yes      | string | URL-friendly identifier, must be unique      |
| `title`   | Yes      | string | Display title for the project                |
| `date`    | Yes      | string | Date in YYYY-MM-DD format (used for sorting) |
| `excerpt` | No       | string | Short summary (appears in listings)          |
| `tags`    | No       | array  | List of technology/topic tags                |
| `team`    | No       | string | Your name or team name                       |
| `image`   | No       | string | Filename of cover image (in same folder)     |
| `links`   | No       | array  | URLs to GitHub repo, demo, etc.              |

#### Example Project Entry

```markdown
---
slug: react-component-library
title: Accessible React Component Library
date: 2024-06-10
excerpt: A comprehensive, fully accessible component library built with React and TypeScript
tags: [React, TypeScript, Accessibility, Tailwind CSS]
team: Katie Silva
image: component-library-cover.png
links:
  - https://github.com/katie/component-library
  - https://components-demo.netlify.app
---

## Overview

A production-ready component library with full WCAG 2.1 AA compliance and zero external dependencies beyond React.

## Features

- 25+ pre-built, accessible components
- TypeScript support with full type safety
- Customizable theming system
- Comprehensive Storybook documentation
- 95%+ test coverage

## Technical Highlights

Built with:

- React 19 for the core library
- TypeScript for type safety
- Tailwind CSS for styling
- Vitest for unit testing
- Storybook for component documentation

The library was designed with accessibility as a first-class concern, implementing keyboard navigation, ARIA labels, and screen reader support across all components.
```

---

### Creating New Publications

#### Step-by-Step Guide

1. **Create the markdown file**:
   - Location: `libs/publications/src/md/{slug}.md`
   - `{slug}` should be a URL-friendly identifier (e.g., `paper-machine-learning-2024`, `talk-react-performance`)

2. **Add YAML frontmatter** at the top of the file:

   ```yaml
   ---
   slug: my-research-paper
   title: Novel Approaches to Machine Learning
   date: 2024-06-10
   excerpt: A paper exploring new techniques in deep learning
   tags: [Machine Learning, AI, Research]
   team: Your Name
   image: publication-cover.png
   links:
     - https://arxiv.org/abs/2024.xxxxx
     - https://doi.org/10.xxxx/xxxxx
   ---
   ```

3. **Add publication details** in markdown/MDX format:

   ```markdown
   ## Abstract

   Provide a concise abstract of your publication...

   ## Key Findings

   - Finding 1
   - Finding 2

   ## Methodology

   Explain your research methodology...

   ## Conclusion

   Summarize your conclusions...
   ```

4. **Add a cover image** (optional):
   - Place the image in `libs/publications/src/md/` (same directory as the markdown file)
   - Name it as referenced in the frontmatter `image` field
   - Recommended: Conference logo, paper cover, or presentation slide
   - Recommended size: 1200x630px

5. **Sync content assets**:
   ```bash
   npx nx run main:sync-content-assets
   ```
   This copies your images to `apps/main/public/publications/`

#### Frontmatter Reference (Publications)

| Field     | Required | Type   | Description                                                    |
| --------- | -------- | ------ | -------------------------------------------------------------- |
| `slug`    | Yes      | string | URL-friendly identifier, must be unique                        |
| `title`   | Yes      | string | Publication title                                              |
| `date`    | Yes      | string | Date in YYYY-MM-DD format (publication date, used for sorting) |
| `excerpt` | No       | string | Abstract or summary                                            |
| `tags`    | No       | array  | Research areas, topics, or keywords                            |
| `team`    | No       | string | Authors or institution                                         |
| `image`   | No       | string | Filename of cover image                                        |
| `links`   | No       | array  | URLs to paper (arXiv, DOI, conference site, slides, etc.)      |

#### Example Publication Entry

```markdown
---
slug: deep-learning-optimization-2024
title: Adaptive Learning Rate Scheduling for Deep Neural Networks
date: 2024-06-10
excerpt: A novel approach to dynamically adjust learning rates during training, improving convergence speed by 35%
tags: [Deep Learning, Optimization, Neural Networks]
team: Katie Silva, Dr. Jane Researcher
image: paper-cover.png
links:
  - https://arxiv.org/abs/2406.xxxxx
  - https://doi.org/10.48550/arXiv.2406.xxxxx
  - https://github.com/katie/adaptive-lr-paper
---

## Abstract

This paper presents a novel adaptive learning rate scheduling algorithm that dynamically adjusts learning rates during training based on gradient variance and loss landscape properties. Our experimental results demonstrate significant improvements in convergence speed and final model performance across multiple architectures and datasets.

## Introduction

Training deep neural networks remains computationally expensive. Traditional learning rate schedules rely on fixed schedules or manual tuning. This work addresses these limitations by proposing an adaptive approach...

## Methodology

Our algorithm monitors gradient statistics in real-time and adjusts learning rates accordingly. Key innovations include:

1. **Gradient Variance Estimation** - Efficient online estimation of gradient variance
2. **Curvature-Aware Scaling** - Considers loss landscape curvature
3. **Stability Guarantees** - Mathematical proofs of convergence

## Experimental Results

Tested on:

- ImageNet (CNN training)
- BERT fine-tuning (NLP)
- RL Policy Training

Results show:

- 35% faster convergence on average
- 2% improvement in final accuracy
- Robust across different batch sizes

## Conclusion

Our adaptive learning rate scheduling approach offers significant practical benefits for training large-scale models. Code is available at the repository link above.
```

---

### General Content Guidelines

#### Markdown & MDX Features

Both projects and publications support:

- **Standard Markdown**: Headers, lists, code blocks, tables
- **MDX Components**: You can use React components in your markdown files
- **Code Highlighting**: Automatic syntax highlighting for code blocks
- **Frontmatter**: YAML-formatted metadata (see examples above)

#### Image Best Practices

- **File names**: Use descriptive, lowercase names with hyphens (e.g., `architecture-diagram.png`, `results-chart.png`)
- **Size**: Optimize images before adding (recommended < 500KB per image)
- **Formats**: PNG (diagrams, charts), JPG (photos), WebP (modern alternative)
- **Cover images**: 1200x630px is ideal for social sharing compatibility
- **In-content images**: Place in the same folder as the markdown file and reference with relative paths

#### Slug Naming Convention

- Use lowercase letters, numbers, and hyphens only
- No spaces or special characters
- Be descriptive and concise
- Examples: `ml-classifier-benchmark`, `accessible-forms`, `react-hooks-deep-dive`

#### Workflow Summary

1. **Create** `{slug}.md` in appropriate `libs/{projects|publications}/src/md/` folder
2. **Add frontmatter** with required fields (slug, title, date) and optional metadata
3. **Write content** in markdown/MDX format
4. **Add cover image** (optional) in same folder
5. **Sync assets** with `npx nx run main:sync-content-assets`
6. **Verify** content appears on site by running dev server: `npx nx run main:dev`

When adding new projects or publications, the content will automatically be discoverable via `getAllProjects()` / `getAllPublications()` and appear in the respective listing pages.
