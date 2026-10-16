Template / Content reuse guidance

Goal

If you want others to reuse the _file and folder organization_ (the project skeleton) but not the actual content (text, images, posts, etc.), there are a few pragmatic ways to express and enforce that intent.

Recommended approach (clean and unambiguous)

1. Keep this repository licensed under a standard permissive license (MIT) so tooling and code can be reused.
2. Create a separate repo that contains only the project skeleton (empty placeholder files, configuration, and README instructions) and publish that skeleton under MIT (or any permissive license). Call it e.g. `katie-portfolio-template`.
3. Keep the real content in this repo and mark it explicitly as copyrighted / proprietary (see notes below). Do not include content in the skeleton repo.

Why this is recommended

- Licenses apply to whole files; it is hard to meaningfully license "structure only" for the same repository contents. Creating a separate skeleton repo avoids legal ambiguity.
- Consumers who want a template can clone the skeleton and get a ready-to-use layout without the real content.

If you prefer to keep everything in one repo

You can add a short human-readable policy file (this file) that states your intent ("structure may be copied, content may not"). Note: such a statement helps communicate your wishes but is not a legally precise replacement for a license. If you need legal-level guarantees, consider keeping the skeleton separate.

Suggested wording to include in files you don't want copied

Add a brief header to content files you want to protect, for example:

```text
/*
 * Copyright (c) 2025 DiogoCastroSilva
 * All rights reserved. The file content (text, images, posts) is not licensed
 * for reuse. You may inspect the repository layout and configuration, but you
 * may not copy or reuse the content without explicit permission.
 */
```

Licenses — quick guidance

- MIT (permissive): Good if you want others to freely reuse code and config.
- Apache 2.0: Permissive with an explicit patent grant; use if you want patent protection.
- GPL (v3): Strong copyleft — redistributions must keep the same license.
- Creative Commons (e.g., CC BY-NC): Suitable for non-code content (images, writing). Not ideal for code.

If you want, I can:

- Add this `TEMPLATE_USAGE.md` to the repo (done), and add header comments to content files.
- Create a separate skeleton repo (or folder `template/` with placeholders) and add a small script to export the skeleton.
- Change the repository license to a different standard license if you prefer (I can add `LICENSE` accordingly).

Which would you like me to do next?

- Create a `template/` folder with placeholders and an MIT license for that skeleton
- Add header comments to content files marking them proprietary
- Change the project license to a different standard (name the license)
