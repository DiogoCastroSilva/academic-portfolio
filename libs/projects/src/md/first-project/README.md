---
title: "Grapevine virus detection in Lodi, California"
date: "2025-11-01"
tags: ["intro", "welcome"]
excerpt: "Field notes from grapevine virus screening in Lodi, California."
image: first-project.jpeg
---

## Summary

This project from the Fall 2025 NASA DEVELOP term was conducted in partnership with the Lodi Winegrape Commission, NASA Acres, and the Gold Lab at Cornell University to develop and test a scalable grapevine virus (GLRaV-3) detection model using Earth observations. The team developed a random forest classification model using hyperspectral imagery from EMIT and multispectral imagery from Sentinel-2 MSI to classify vineyard areas based on the presence of virus symptoms. The EMIT-based model showed greater sensitivity to areas with higher densities of symptomatic vines than the Sentinel-2 model, suggesting that hyperspectral data may be more suitable for detecting virus symptoms. These findings indicate that spectral resolution may be more critical than spatial resolution for this application.

![EMIT spectral signatures showing high- and low-infection areas](test-emit.jpeg "Figure 1. EMIT spectral signatures showing clear differences between high- and low-infection vineyard areas.")
![Sentinel-2 false-color composite showing subtle infection differences](sentinel.jpeg "Figure 2. Sentinel-2 composite showing only subtle, overlapping differences between infection levels.")

The team assessed how and where the spectral signatures might differ between areas with high and low infection. EMIT shows a clear difference between high- and low-infection areas, while Sentinel-2 shows only subtle, overlapping differences, limiting its ability to reliably distinguish between infection levels.

![EMIT random forest model predictions for GLRaV-3 symptomatic classes](emit.jpeg "Figure 3. Model predictions for GLRaV-3 symptomatic classes, applied to PCA-transformed EMIT imagery of Lodi vineyards, August–September 2022–2024.")

EMIT random forest model predictions for GLRaV-3 symptomatic classes. Model predictions were made by applying the best performing random forest model to PCA-transformed EMIT imagery of Lodi vineyards from August and September, 2022–2024.

**Team:** Audrey Chin, Noah Larkin, Derek Gonzalez, Monica Napoles Serrano, [Dr. Alex Morgan (Lead)](DEPLOYMENT_URL)

**Paper:** [https://ntrs.nasa.gov/citations/20250011141](https://ntrs.nasa.gov/citations/20250011141)

**Presentation:** [https://ntrs.nasa.gov/citations/20250010829](https://ntrs.nasa.gov/citations/20250010829)
