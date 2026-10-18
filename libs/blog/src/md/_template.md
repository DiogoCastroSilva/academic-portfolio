---
# This is a TEMPLATE for a blog post. Create a new directory
# `libs/blog/src/md/my-post-slug/` and copy this file into it as
# `README.md`.
#
# Remove the `draft: true` line from the README.md frontmatter when
# ready to publish.
#
# Directory structure:
#   libs/blog/src/md/my-post-slug/
#     README.md         <- this file (frontmatter + body)
#     cover.jpeg        <- cover image (referenced by `image:` field)
#     diagram.png       <- body image (referenced in Markdown)
#
# All images live in the same directory as README.md.
draft: true
title: "My New Blog Post"
date: "2025-01-01"
tags: ["example-tag"]
excerpt: "A one-sentence summary of this blog post."
image: "cover.jpeg"
---

## Introduction

Start with a brief, jargon-free introduction. What problem does this post
address, and why should readers care?

### Section Heading

Write in short paragraphs. Use **bold** for emphasis and _italics_ for
subtle highlights. Break up complex ideas with bullet lists:

- First idea
- Second idea
- Third idea

### Code Blocks

```typescript
// Inline code with syntax highlighting
function calculateMean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}
```

### Figures and Galleries

Images go in the same directory as this `README.md` file:

![Figure 1. A descriptive caption](diagram.png "Figure 1. A descriptive caption.")

### Image Galleries

Place two or more image lines **directly adjacent** (no blank line between
them) to create a responsive gallery:

![Panel A](plot-a.png "Panel A description")
![Panel B](plot-b.png "Panel B description")

### Links in Content Body

- **External links** open in a new tab automatically: [Markdown Guide](https://www.markdownguide.org/)
- **Internal site links** start with `/`: [View my projects](/projects/)
- Use `DEPLOYMENT_URL` to link to your deployed site: [Share this post](DEPLOYMENT_URL)

## Conclusion

Wrap up with key takeaways. What should readers do next?
