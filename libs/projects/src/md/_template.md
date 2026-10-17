---
# This is a TEMPLATE for a project entry. Create a new directory
# `libs/projects/src/md/my-project-slug/` and copy this file into it as
# `README.md`.
#
# Remove the `draft: true` line from the README.md frontmatter when
# ready to publish.
#
# Directory structure:
#   libs/projects/src/md/my-project-slug/
#     README.md          <- this file (frontmatter + body)
#     cover.jpeg         <- cover image (referenced by `image:` field)
#     plot-a.png         <- body image (referenced in Markdown)
#     plot-b.png         <- body image (referenced in Markdown)
#
# All images live in the same directory as README.md.
draft: true
title: "My New Project"
date: "2025-01-01"
tags: ["example-tag"]
excerpt: "A one-sentence summary of this project."
image: "cover.jpeg"
links: []
---

## Overview

Start with a brief, jargon-free summary of what this project does and why it
matters. Imagine you're explaining it to a colleague from another discipline.

### Technical Stack

- **Languages:** Python, JavaScript, TypeScript
- **Tools:** Google Earth Engine, scikit-learn, React
- **Data:** Sentinel-2, Landsat 8, field survey data

## Key Results

- List your main findings as bullet points
- Use **bold** for emphasis on key numbers or conclusions

### Figures and Galleries

Images go in the same directory as this `README.md` file. Use relative paths:

![Figure 1. Caption for a single image](image.png "Figure 1. Caption appears here.")

### Image Galleries

Place two or more image lines **directly adjacent** (no blank line between
them) to create a responsive gallery:

![Figure 1. First panel](plot-a.png "Figure 1. First panel.")
![Figure 2. Second panel](plot-b.png "Figure 2. Second panel.")

### Links in Content Body

- **External links** open in a new tab automatically: [Google Earth Engine](https://earthengine.google.com)
- **Internal site links** start with `/`: [Go to publications](/publications/)
- Use `DEPLOYMENT_URL` to link to your deployed site: [View this project online](DEPLOYMENT_URL)

## References

1. Author, A. A. (Year). "Title of paper." _Journal Name_, Volume(Issue), pages. DOI:xxxxx
