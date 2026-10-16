# @katie-portfolio/projects

Markdown-backed portfolio projects shown on the home page.

## Add a project

Create a file in `src/md/` with frontmatter:

```yaml
---
title: 'Project title'
date: '2025-11-01'
tags: ['tag']
excerpt: 'Short summary for cards.'
image: my-project.jpg
---
```

Place cover images in the same `src/md/` folder. After adding or changing images:

```bash
npx nx run main:sync-content-assets
```

See `libs/content` for shared loading behavior used by projects and publications.
