# @katie-portfolio/publications

Publications content library. Markdown files in `src/md/` are loaded and rendered on the `/publications` page and `/publications/[slug]/` detail pages.

## Content

Add `.md` files under `src/md/` using the same frontmatter as projects:

```yaml
---
title: "Paper Title"
date: "2024-06-10"
tags: ["Machine Learning", "Research"]
excerpt: "A brief abstract for the publication card."
team: "Katie Miller, Dr. Jane Researcher"
image: paper-cover.png
links:
  - "https://arxiv.org/abs/2406.xxxxx"
  - "https://doi.org/10.48550/arXiv.2406.xxxxx"
---
Write the publication abstract and details here.
```

The `/publications` page lists all publications via `getAllPublications()` from `generateStaticParams`. If no content files exist, the page shows an empty state.

See [docs/product/content-authoring.md](https://github.com/DiogoCastroSilva/academic-portfolio/blob/main/docs/product/content-authoring.md) for the full authoring guide.
