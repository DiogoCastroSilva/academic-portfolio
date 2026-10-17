---
# This is a TEMPLATE for a publication entry. Copy the entire directory
# `libs/publications/src/md/_template/` to a new folder named after your
# publication slug, then edit the README.md inside it.
#
# Remove the `draft: true` line from the README.md frontmatter when
# ready to publish.
#
# Directory structure:
#   libs/publications/src/md/my-paper-slug/
#     README.md          <- this file (frontmatter + body)
#     cover.jpeg         <- cover image (referenced by `image:` field)
#     spectrum.png       <- body image (referenced in Markdown)
#
# All images live in the same directory as README.md.
draft: true
title: "Publication Title"
date: "2025-01-01"
tags: ["example-tag"]
excerpt: "One-sentence summary for the publication card."
authors:
  - "Your Name"
  - "Collaborator Name"
venue: "Journal of Environmental Science"
doi: "10.0000/journal.xxxxx"
paperUrl: "https://journal.example.com/doi/xxxxx"
links: []
image: "cover.jpeg"
---

## Abstract

Write a concise abstract (1–3 short paragraphs) summarizing the problem,
methods, results, and conclusions.

## Background

Provide context that helps readers understand the significance of this work.
Use subsections as needed:

### Motivation

Why did you start this research?

### Methods

What tools, data sources, or analytical approaches did you use?

### Results

What did you find? Highlight the most important insights.

### Figures and Citations

Cite other work using standard academic notation. For image captions:

![Figure 1. Spectral signature plot](spectrum.png "Figure 1. Spectral signatures show clear separation between treatment groups.")

## Supplementary Materials

- [Code repository](https://github.com/yourusername/repo-name)
- [Presentation slides](DEPLOYMENT_URL)
